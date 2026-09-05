'use strict';

const config = require('../../config/env');
const { getProvider } = require('./providers');
const { validateAIResponse } = require('./validators/aiResponse.validator');
const { validatePracticeQuestions } = require('./validators/practiceQuestions.validator');
const { validatePracticeEvaluation } = require('./validators/practiceEvaluation.validator');

/**
 * Thrown when all retry attempts for an AI operation are exhausted.
 */
class AIServiceError extends Error {
  constructor(message = 'AI service request failed after all retry attempts') {
    super(message);
    this.name = 'AIServiceError';
    this.code = 'AI_FAILURE';
  }
}

/**
 * Executes a provider call with retry logic.
 * On each attempt: call provider → parse JSON → validate.
 * Retries on parse failure or validation failure.
 * Raw provider errors are caught and sanitized at the provider boundary.
 *
 * @param {object}   opts
 * @param {string}   opts.prompt       - Fully formatted prompt string
 * @param {number}   opts.timeoutMs    - Per-attempt timeout in milliseconds
 * @param {number}   opts.maxAttempts  - Total attempts (retries + 1)
 * @param {Function} opts.validate     - Validation function; throws on invalid input
 * @returns {Promise<*>} Validated parsed result
 * @throws {AIServiceError} After all attempts exhausted
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function isDailyTokenLimitError(err) {
  const message = String(err?.message || '').toLowerCase()

  return (
    message.includes('tokens per day') ||
    message.includes('tpd') ||
    message.includes('tokens per day (tpd)') ||
    message.includes('daily token')
  )
}

async function callWithRetry({ prompt, timeoutMs, maxAttempts, validate }) {
  const provider = getProvider()
  let lastError

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const raw = await provider.call(prompt, timeoutMs)

      console.log('=== RAW AI RESPONSE ===')
      console.log(raw)

      let parsed

      try {
        parsed = JSON.parse(raw)
      } catch {
        lastError = new Error('AI response was not valid JSON')

        if (attempt < maxAttempts) {
          continue
        }

        break
      }

      validate(parsed)

      return parsed
    } catch (err) {
      lastError = err

      console.error(
        `=== AI ATTEMPT ${attempt}/${maxAttempts} FAILED ===`
      )
      console.error('error name:', err.name)
      console.error('error code:', err.code)
      console.error('error status:', err.status)
      console.error('error message:', err.message)

      /*
       * IMPORTANT:
       * A daily token quota cannot be fixed by retrying.
       *
       * Example:
       * tokens per day (TPD): Limit 200000
       * Used: 199802
       * Requested: 2148
       *
       * Retrying the exact same request only produces another 429.
       */
      if (err.status === 429 && isDailyTokenLimitError(err)) {
        console.error(
          '=== DAILY AI TOKEN LIMIT REACHED === No retry will be attempted.'
        )
        break
      }

      /*
       * Other 429 errors may be temporary rate limits.
       * Respect the provider's retryAfterMs when available.
       */
      if (attempt < maxAttempts && err.status === 429) {
        const delay = err.retryAfterMs || 15000

        console.log(
          `=== AI RATE LIMIT === Waiting ${delay}ms before retry...`
        )

        await sleep(delay)
      }
    }
  }

  console.error('=== AI ALL ATTEMPTS FAILED ===')
  console.error('last error:', lastError?.message)

  const serviceError = new AIServiceError(
    lastError?.message || 'AI service request failed'
  )

  /*
   * Preserve useful information for the controller.
   */
  if (lastError?.status) {
    serviceError.status = lastError.status
  }

  if (isDailyTokenLimitError(lastError)) {
    serviceError.code = 'AI_DAILY_QUOTA_EXCEEDED'
  } else if (lastError?.status === 429) {
    serviceError.code = 'AI_RATE_LIMITED'
  }

  throw serviceError
}

/**
 * Loads a prompt module from the prompts directory lazily (inside function body).
 * This allows aiService.js to be loaded even before all prompt files exist.
 *
 * @param {string} name - Prompt file name without extension (e.g. 'generate')
 * @returns {object} The prompt module (must export a `build(request)` function)
 * @throws {Error} If the prompt module is not found
 */
function loadPrompt(name) {
  try {
    return require(`./prompts/${name}.prompt`);
  } catch (err) {
    throw new Error(
      `Prompt module "${name}.prompt.js" not found. Ensure task 3.2 has been completed.`
    );
  }
}

/**
 * Generate a new analogy or a modified version of an existing one.
 *
 * @param {object}   request
 * @param {string}   request.concept
 * @param {string}   request.analogyWorld
 * @param {'generate'|'simplify'|'expand'|'regenerate'|'switchWorld'} [request.modificationType]
 * @param {number}   [request.currentNodeCount]    - Required for simplify/expand/regenerate
 * @param {string}   [request.newAnalogyWorld]      - Required for switchWorld
 * @param {string}   [request.previousAnalogyWorld] - Required for switchWorld
 * @param {string[]} [request.previousNodeLabels]   - Required for regenerate
 * @returns {Promise<object>} Validated AI_Response
 * @throws {AIServiceError}
 */
async function generate(request) {
  const { modificationType } = request;
  let promptModule;

  if (!modificationType || modificationType === 'generate') {
    promptModule = loadPrompt('generate');
  } else if (modificationType === 'simplify') {
    promptModule = loadPrompt('simplify');
  } else if (modificationType === 'expand') {
    promptModule = loadPrompt('expand');
  } else if (modificationType === 'regenerate') {
    promptModule = loadPrompt('regenerate');
  } else if (modificationType === 'switchWorld') {
    promptModule = loadPrompt('switchWorld');
  } else {
    throw new Error(`Unknown modificationType: "${modificationType}"`);
  }

  const prompt = promptModule.build(request);
  console.log('=== GENERATION PROMPT MODULE ===')
console.log(promptModule)
console.log('=== GENERATION PROMPT START ===')
console.log(prompt.slice(0, 1000))
console.log('=== GENERATION PROMPT END ===')

  return callWithRetry({
    prompt,
    timeoutMs: config.aiAnalogyTimeoutMs,
    maxAttempts: config.aiMaxRetries + 1,
    validate: validateAIResponse,
  });
}

/**
 * Determine whether a concept is meaningful enough for analogy generation.
 * Lightweight check — uses 1 retry (2 total attempts).
 *
 * @param {string} concept
 * @returns {Promise<{ valid: boolean, reason: string, message: string }>}
 * @throws {AIServiceError}
 */
async function validateMeaningfulness(concept) {
  const promptModule = loadPrompt('meaningfulness');
  const prompt = promptModule.build({ concept });

  // Meaningfulness: 15s timeout, 2 total attempts (1 retry) — lightweight
  const MEANINGFULNESS_TIMEOUT_MS = config.aiPracticeQuestionsTimeoutMs;
  const MEANINGFULNESS_MAX_ATTEMPTS = 1;

  function validateMeaningfulnessResponse(parsed) {
    if (typeof parsed.valid !== 'boolean') {
      throw new Error('Meaningfulness response missing valid boolean');
    }
    if (typeof parsed.reason !== 'string') {
      throw new Error('Meaningfulness response missing reason string');
    }
    if (typeof parsed.message !== 'string') {
      throw new Error('Meaningfulness response missing message string');
    }
    return parsed;
  }

  return callWithRetry({
    prompt,
    timeoutMs: MEANINGFULNESS_TIMEOUT_MS,
    maxAttempts: MEANINGFULNESS_MAX_ATTEMPTS,
    validate: validateMeaningfulnessResponse,
  });
}

/**
 * Generate practice questions for a specific analogy.
 * Uses the `generateMoreQuestions` prompt when `previousQuestions` is present.
 *
 * @param {object}   request
 * @param {string}   request.concept
 * @param {string}   request.analogyWorld
 * @param {Array}    request.nodes
 * @param {Array}    request.mappings
 * @param {Array}    request.relationships
 * @param {string}   request.explanation
 * @param {string[]} request.limitations
 * @param {number}   request.questionCount
 * @param {string[]} [request.previousQuestions]
 * @returns {Promise<Array>} Validated PracticeQuestion[]
 * @throws {AIServiceError}
 */
async function generatePracticeQuestions(request) {
  const isMore =
    Array.isArray(request.previousQuestions) && request.previousQuestions.length > 0;

  const promptModule = isMore
    ? loadPrompt('generateMoreQuestions')
    : loadPrompt('practiceQuestions');

  const prompt = promptModule.build(request);

  return callWithRetry({
    prompt,
    timeoutMs: config.aiPracticeQuestionsTimeoutMs,
    maxAttempts: config.aiMaxRetries + 1,
    validate: validatePracticeQuestions,
  });
}

/**
 * Evaluate a user's answer to a practice question using semantic correctness.
 *
 * @param {object} request
 * @param {object} request.question   - PracticeQuestion object
 * @param {string} request.userAnswer
 * @returns {Promise<object>} Validated PracticeEvaluation
 * @throws {AIServiceError}
 */
async function evaluateAnswer(request) {
  const promptModule = loadPrompt('practiceEvaluate');
  const prompt = promptModule.build(request);

  return callWithRetry({
    prompt,
    timeoutMs: config.aiPracticeEvaluationTimeoutMs,
    maxAttempts: config.aiMaxRetries + 1,
    validate: validatePracticeEvaluation,
  });
}

module.exports = {
  generate,
  validateMeaningfulness,
  generatePracticeQuestions,
  evaluateAnswer,
  AIServiceError,
};

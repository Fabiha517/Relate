'use strict';

const config = require('../../../config/env');

const GROQ_API_URL =
  'https://api.groq.com/openai/v1/chat/completions';

/**
 * Calls the Groq LLM API with the given prompt and timeout.
 *
 * @param {string} prompt
 * @param {number} timeoutMs
 * @returns {Promise<string>} Raw text response from the model
 */
async function call(prompt, timeoutMs) {
  const controller = new AbortController();

  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.llmApiKey}`,
      },
      body: JSON.stringify({
        model: config.llmModel,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
      signal: controller.signal,
    });

 if (!response.ok) {
  const errorText = await response.text()

  console.error('=== GROQ HTTP ERROR ===')
  console.error('status:', response.status)
  console.error('statusText:', response.statusText)
  console.error('body:', errorText)

  if (response.status === 429) {
    let retryAfterMs = 15000

    try {
      const errorData = JSON.parse(errorText)
      const message = errorData?.error?.message || ''

      const match = message.match(/try again in ([\d.]+)s/i)

      if (match) {
        retryAfterMs = Math.ceil(Number(match[1]) * 1000)
      }
    } catch {
      // Keep default retry delay
    }

    const error = new Error('Groq rate limit exceeded')
    error.status = 429
    error.retryAfterMs = retryAfterMs

    throw error
  }

  const error = new Error(
    `Groq API request failed with status ${response.status}`
  )

  error.status = response.status

  throw error
}

    const data = await response.json();

    const text = data?.choices?.[0]?.message?.content;

    if (typeof text !== 'string') {
      throw new Error(
        'AI provider returned an unexpected response shape'
      );
    }

    return text;
  } catch (err) {
    console.error('=== GROQ REQUEST ERROR ===');
    console.error('error name:', err.name);
    console.error('error message:', err.message);

    throw err;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { call };
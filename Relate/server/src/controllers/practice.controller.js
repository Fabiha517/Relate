'use strict'

const mongoose = require('mongoose')

const Analogy =
  require('../models/Analogy.model')

const PracticeSession =
  require('../models/PracticeSession.model')

const aiService =
  require('../services/ai/aiService')

const config =
  require('../config/env')

/* ─────────────────────────────────────────────
 * Helpers
 * ──────────────────────────────────────────── */

function notFound(
  res,
  message = 'Not found.'
) {
  return res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message,
    },
  })
}

function forbidden(res) {
  return res.status(403).json({
    error: {
      code: 'FORBIDDEN',
      message: 'Access denied.',
    },
  })
}

function aiFailure(
  res,
  message =
    'Practice question generation failed. Please try again.'
) {
  return res.status(503).json({
    error: {
      code: 'AI_FAILURE',
      message,
    },
  })
}

/**
 * Check that every generated question uses
 * a mappingLabel that actually exists in the
 * stored analogy.
 */
function allMappingLabelsValid(
  questions,
  storedMappings
) {
  if (!Array.isArray(questions)) {
    return false
  }

  if (!Array.isArray(storedMappings)) {
    return false
  }

  const validLabels = new Set(
    storedMappings
      .map(
        (mapping) =>
          mapping?.mappingLabel
      )
      .filter(Boolean)
  )

  return questions.every(
    (question) =>
      question &&
      validLabels.has(
        question.mappingLabel
      )
  )
}

/**
 * Detect answers that clearly do not attempt
 * to answer the question.
 *
 * These must never be considered semantically
 * correct.
 */
function isClearlyInvalidAnswer(value) {
  if (typeof value !== 'string') {
    return true
  }

  const answer = value.trim()

  if (!answer) {
    return true
  }

  /**
   * Only punctuation/symbols such as:
   * -, /, ..., ???
   */
  if (!/[a-zA-Z0-9]/.test(answer)) {
    return true
  }

  const normalized = answer
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  const invalidPatterns = [
    'pata nai',
    'pata nahi',
    'pata nhi',

    'idk',

    'i dont know',
    'i do not know',

    'dont know',
    'do not know',

    'no idea',
    'i have no idea',

    'not sure',
    'im not sure',
    'i am not sure',

    'i dont understand',
    'i do not understand',

    'dont understand',
    'do not understand',

    'i dont understand your question',
    'i do not understand your question',

    'i am confused',
    'im confused',

    'confused',

    'i dont get it',
    'i do not get it',

    'not understand',
  ]

  return invalidPatterns.some(
    (pattern) =>
      normalized === pattern
  )
}

/**
 * Convert a multiple-choice user answer
 * into an option index.
 *
 * Supports:
 * - option-0
 * - option-1
 * - A (Polling)
 * - B (Long polling)
 * - Polling
 */
function getSelectedOptionIndex(
  question,
  userAnswer
) {
  if (
    !question ||
    !Array.isArray(question.options)
  ) {
    return -1
  }

  if (
    typeof userAnswer !== 'string'
  ) {
    return -1
  }

  const answer =
    userAnswer.trim()

  /**
   * Current / legacy frontend format:
   * option-0
   */
  const optionIdMatch =
    answer.match(
      /^option-(\d+)$/i
    )

  if (optionIdMatch) {
    const index =
      Number(optionIdMatch[1])

    if (
      index >= 0 &&
      index < question.options.length
    ) {
      return index
    }
  }

  /**
   * Display format:
   * A (Polling)
   */
  const letterMatch =
    answer.match(
      /^([A-F])\s*\(/i
    )

  if (letterMatch) {
    const index =
      letterMatch[1]
        .toUpperCase()
        .charCodeAt(0) - 65

    if (
      index >= 0 &&
      index < question.options.length
    ) {
      return index
    }
  }

  /**
   * Exact option text.
   */
  const normalizedAnswer =
    answer.toLowerCase()

  const textIndex =
    question.options.findIndex(
      (option) =>
        typeof option?.text ===
          'string' &&
        option.text
          .trim()
          .toLowerCase() ===
          normalizedAnswer
    )

  return textIndex
}

/**
 * Deterministic evaluation for multiple-choice.
 *
 * There is no reason to call the LLM to decide
 * whether option A/B/C is correct because the
 * validated question already contains isCorrect.
 */
function evaluateMultipleChoice(
  question,
  userAnswer
) {
  const selectedIndex =
    getSelectedOptionIndex(
      question,
      userAnswer
    )

  const correctIndex =
    question.options.findIndex(
      (option) =>
        option?.isCorrect === true
    )

  const selectedOption =
    selectedIndex >= 0
      ? question.options[selectedIndex]
      : null

  const correctOption =
    correctIndex >= 0
      ? question.options[correctIndex]
      : null

  const selectedLetter =
    selectedIndex >= 0
      ? String.fromCharCode(
          65 + selectedIndex
        )
      : null

  const correctLetter =
    correctIndex >= 0
      ? String.fromCharCode(
          65 + correctIndex
        )
      : null

  const displayUserAnswer =
    selectedOption &&
    selectedLetter
      ? `${selectedLetter} (${selectedOption.text})`
      : typeof userAnswer ===
          'string'
        ? userAnswer.trim()
        : ''

  const displayCorrectAnswer =
    correctOption &&
    correctLetter
      ? `${correctLetter} (${correctOption.text})`
      : question.expectedAnswer

  const correct =
    selectedIndex >= 0 &&
    correctIndex >= 0 &&
    selectedIndex === correctIndex

  return {
    correct,

    feedback: correct
      ? 'Your answer is correct.'
      : 'Your answer does not match the correct option.',

    correctAnswer:
      displayCorrectAnswer,

    explanation:
      question.explanation,

    /**
     * Always use the original question mapping.
     */
    mappingLabel:
      question.mappingLabel,

    encouragement: correct
      ? 'Good job — you identified the correct concept.'
      : 'Review the explanation and try to connect the answer back to the original concept.',

    misconception: correct
      ? null
      : selectedOption
        ? `Selected "${selectedOption.text}" instead of "${correctOption?.text || question.expectedAnswer}".`
        : 'No valid answer option was selected.',

    userAnswer:
      displayUserAnswer,

    questionType:
      'multiple-choice',
  }
}

/* ─────────────────────────────────────────────
 * POST /api/practice/questions
 * ──────────────────────────────────────────── */

async function generateQuestions(
  req,
  res
) {
  const {
    analogyId,
  } = req.body

  const analogy =
    await Analogy.findById(
      analogyId
    ).catch(() => null)

  if (!analogy) {
    return notFound(
      res,
      'Analogy not found.'
    )
  }

  if (
    !analogy.userId.equals(
      req.user.userId
    )
  ) {
    return forbidden(res)
  }

  const aiRequest = {
    concept:
      analogy.concept,

    analogyWorld:
      analogy.analogyWorld,

    nodes:
      analogy.nodes,

    mappings:
      analogy.mappings,

    relationships:
      analogy.relationships,

    explanation:
      analogy.explanation,

    limitations:
      analogy.limitations,

    questionCount:
      config.practiceQuestionCount,
  }

  /**
   * aiService is responsible for AI retries.
   *
   * The controller should NOT retry an AI failure
   * again because that can multiply Groq requests
   * and make TPM rate limits much worse.
   *
   * We only retry when the AI returned a structurally
   * valid result whose mapping labels don't match
   * the stored analogy.
   */
  const validationAttempts = 2

  for (
    let attempt = 1;
    attempt <= validationAttempts;
    attempt++
  ) {
    try {
      const result =
        await aiService.generatePracticeQuestions(
          aiRequest
        )

      if (
        !allMappingLabelsValid(
          result,
          analogy.mappings
        )
      ) {
        if (
          attempt <
          validationAttempts
        ) {
          continue
        }

        return aiFailure(
          res,
          'The generated practice questions did not match the analogy mappings. Please try again.'
        )
      }

      return res.status(200).json({
        questions: result,
      })
    } catch (err) {
      /**
       * Do NOT retry here.
       *
       * aiService already owns AI retry behavior.
       */
      console.error(
        'Practice question generation failed:',
        err
      )

      return aiFailure(res)
    }
  }

  return aiFailure(res)
}

/* ─────────────────────────────────────────────
 * POST /api/practice/questions/more
 * ──────────────────────────────────────────── */

async function generateMoreQuestions(
  req,
  res
) {
  const {
    analogyId,
    previousQuestions,
  } = req.body

  const analogy =
    await Analogy.findById(
      analogyId
    ).catch(() => null)

  if (!analogy) {
    return notFound(
      res,
      'Analogy not found.'
    )
  }

  if (
    !analogy.userId.equals(
      req.user.userId
    )
  ) {
    return forbidden(res)
  }

  const aiRequest = {
    concept:
      analogy.concept,

    analogyWorld:
      analogy.analogyWorld,

    nodes:
      analogy.nodes,

    mappings:
      analogy.mappings,

    relationships:
      analogy.relationships,

    explanation:
      analogy.explanation,

    limitations:
      analogy.limitations,

    questionCount:
      config.practiceQuestionCount,

    previousQuestions:
      Array.isArray(
        previousQuestions
      )
        ? previousQuestions
        : [],
  }

  /**
   * Same rule as the initial endpoint:
   *
   * - aiService handles AI retries.
   * - Controller only retries mapping validation.
   */
  const validationAttempts = 2

  for (
    let attempt = 1;
    attempt <= validationAttempts;
    attempt++
  ) {
    try {
      const result =
        await aiService.generatePracticeQuestions(
          aiRequest
        )

      if (
        !allMappingLabelsValid(
          result,
          analogy.mappings
        )
      ) {
        if (
          attempt <
          validationAttempts
        ) {
          continue
        }

        return aiFailure(
          res,
          'The generated practice questions did not match the analogy mappings. Please try again.'
        )
      }

      return res.status(200).json({
        questions: result,
      })
    } catch (err) {
      console.error(
    'More practice question generation failed:',
    {
      message: err?.message,
      name: err?.name,
      status: err?.response?.status,
      responseData: err?.response?.data,
      stack: err?.stack,
    }
  )
      /**
       * No additional controller retry.
       */
      return aiFailure(res)
    }
  }

  return aiFailure(res)
}

/* ─────────────────────────────────────────────
 * POST /api/practice/evaluate
 * ──────────────────────────────────────────── */

async function evaluate(
  req,
  res
) {
  const {
    question,
    userAnswer,
  } = req.body

  /**
   * Multiple choice:
   * NEVER use AI to determine correctness.
   */
  if (
    question?.type ===
    'multiple-choice'
  ) {
    const evaluation =
      evaluateMultipleChoice(
        question,
        userAnswer
      )

    return res.status(200).json({
      evaluation,
    })
  }

  /**
   * Short answer:
   * immediately reject obvious non-answers.
   */
  if (
    isClearlyInvalidAnswer(
      userAnswer
    )
  ) {
    return res.status(200).json({
      evaluation: {
        correct: false,

        feedback:
          'This does not answer the question. Try explaining what the concept does or why it works.',

        correctAnswer:
          question.expectedAnswer,

        explanation:
          question.explanation,

        mappingLabel:
          question.mappingLabel,

        encouragement:
          'Take another look at the question and answer in your own words.',

        misconception:
          'The response did not attempt to answer the question.',

        userAnswer:
          typeof userAnswer ===
            'string'
            ? userAnswer.trim()
            : '',

        questionType:
          'short-answer',
      },
    })
  }

  /**
   * Short answer:
   * semantic AI evaluation.
   */
  let evaluation

  try {
    evaluation =
      await aiService.evaluateAnswer({
        question,
        userAnswer,
      })
  } catch (err) {
    console.error(
      'Answer evaluation failed:',
      err
    )

    return res.status(503).json({
      error: {
        code: 'AI_FAILURE',
        message:
          'Answer evaluation failed. Please try again.',
      },
    })
  }

  /**
   * Never allow the evaluator to replace
   * these values with unrelated ones.
   */
  evaluation = {
    ...evaluation,

    correctAnswer:
      question.expectedAnswer,

    mappingLabel:
      question.mappingLabel,

    userAnswer:
      typeof userAnswer === 'string'
        ? userAnswer.trim()
        : '',

    questionType:
      'short-answer',
  }

  return res.status(200).json({
    evaluation,
  })
}

/* ─────────────────────────────────────────────
 * POST /api/practice/sessions
 * ──────────────────────────────────────────── */

async function saveSession(
  req,
  res
) {
  const {
    analogyId,
    questions,
    answers,
    evaluations,
    score,
    completedAt,
  } = req.body

  const misconceptions =
    Array.isArray(evaluations)
      ? evaluations
          .filter(
            (evaluation) =>
              evaluation.correct ===
                false &&
              evaluation.misconception
          )
          .map(
            (evaluation) =>
              evaluation.misconception
          )
      : []

  const doc =
    await PracticeSession.create({
      userId:
        req.user.userId,

      analogyId,

      questions,

      answers,

      evaluations,

      score,

      misconceptions,

      completedAt:
        new Date(completedAt),
    })

  return res.status(201).json({
    sessionId: doc._id,
  })
}

/* ─────────────────────────────────────────────
 * GET /api/practice/sessions/:analogyId
 * ──────────────────────────────────────────── */

async function getSessionsForAnalogy(
  req,
  res
) {
  const {
    analogyId,
  } = req.params

  if (
    !mongoose.Types.ObjectId.isValid(
      analogyId
    )
  ) {
    return notFound(
      res,
      'Analogy not found.'
    )
  }

  const sessions =
    await PracticeSession.find({
      userId:
        req.user.userId,

      analogyId,
    })
      .sort({
        completedAt: -1,
      })
      .limit(50)
      .populate(
        'analogyId',
        'analogyTitle analogyWorld'
      )
      .lean()

  const summaries =
    sessions.map((session) => ({
      sessionId:
        session._id,

      analogyId:
        session.analogyId?._id ??
        analogyId,

      analogyTitle:
        session.analogyId
          ?.analogyTitle ?? '',

      analogyWorld:
        session.analogyId
          ?.analogyWorld ?? '',

      completedAt:
        session.completedAt,

      score:
        session.score,

      questionCount:
        Array.isArray(
          session.questions
        )
          ? session.questions.length
          : 0,

      weakAreaCount:
        Array.isArray(
          session.evaluations
        )
          ? session.evaluations.filter(
              (evaluation) =>
                evaluation.correct ===
                false
            ).length
          : 0,
    }))

  return res.status(200).json({
    sessions: summaries,
  })
}

/* ─────────────────────────────────────────────
 * GET /api/practice/sessions/:analogyId/:sessionId
 * ──────────────────────────────────────────── */

async function getSessionById(
  req,
  res
) {
  const {
    sessionId,
  } = req.params

  if (
    !mongoose.Types.ObjectId.isValid(
      sessionId
    )
  ) {
    return notFound(
      res,
      'Session not found.'
    )
  }

  const session =
    await PracticeSession.findById(
      sessionId
    )
      .lean()
      .catch(() => null)

  if (!session) {
    return notFound(
      res,
      'Session not found.'
    )
  }

  if (
    session.userId.toString() !==
    req.user.userId.toString()
  ) {
    return forbidden(res)
  }

  return res.status(200).json({
    session,
  })
}

/* ─────────────────────────────────────────────
 * GET /api/practice/history
 * ──────────────────────────────────────────── */

async function getHistory(
  req,
  res
) {
  const sessions =
    await PracticeSession.find({
      userId:
        req.user.userId,
    })
      .sort({
        completedAt: -1,
      })
      .populate(
        'analogyId',
        'analogyTitle analogyWorld'
      )
      .lean()

  const summaries =
    sessions.map((session) => ({
      sessionId:
        session._id,

      analogyId:
        session.analogyId?._id ??
        null,

      analogyTitle:
        session.analogyId
          ?.analogyTitle ?? '',

      analogyWorld:
        session.analogyId
          ?.analogyWorld ?? '',

      completedAt:
        session.completedAt,

      score:
        session.score,

      questionCount:
        Array.isArray(
          session.questions
        )
          ? session.questions.length
          : 0,

      weakAreaCount:
        Array.isArray(
          session.evaluations
        )
          ? session.evaluations.filter(
              (evaluation) =>
                evaluation.correct ===
                false
            ).length
          : 0,
    }))

  return res.status(200).json({
    sessions: summaries,
  })
}

/* ─────────────────────────────────────────────
 * DELETE /api/practice/sessions/:sessionId
 * ──────────────────────────────────────────── */

async function deleteSession(
  req,
  res
) {
  const {
    sessionId,
  } = req.params

  if (
    !mongoose.Types.ObjectId.isValid(
      sessionId
    )
  ) {
    return notFound(
      res,
      'Session not found.'
    )
  }

  const session =
    await PracticeSession.findById(
      sessionId
    )
      .lean()
      .catch(() => null)

  if (!session) {
    return notFound(
      res,
      'Session not found.'
    )
  }

  if (
    session.userId.toString() !==
    req.user.userId.toString()
  ) {
    return forbidden(res)
  }

  await PracticeSession.findByIdAndDelete(
    sessionId
  )

  return res.status(200).json({
    message:
      'Practice session deleted.',
  })
}

module.exports = {
  generateQuestions,
  generateMoreQuestions,
  evaluate,
  saveSession,
  getSessionsForAnalogy,
  getSessionById,
  getHistory,
  deleteSession,
}
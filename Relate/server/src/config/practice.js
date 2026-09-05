  'use strict';

  /**
   * Practice configuration — derived from the validated env config.
   * Importing env.js here ensures startup validation has already run.
   *
   * Requirements: 10.7
   */
  const config = require('./env');

  const PRACTICE_QUESTION_COUNT = config.practiceQuestionCount;
  const AI_ANALOGY_TIMEOUT_MS = config.aiAnalogyTimeoutMs;
  const AI_PRACTICE_QUESTIONS_TIMEOUT_MS = config.aiPracticeQuestionsTimeoutMs;
  const AI_PRACTICE_EVALUATION_TIMEOUT_MS = config.aiPracticeEvaluationTimeoutMs;
  const AI_MAX_RETRIES = config.aiMaxRetries;

  module.exports = {
    PRACTICE_QUESTION_COUNT,
    AI_ANALOGY_TIMEOUT_MS,
    AI_PRACTICE_QUESTIONS_TIMEOUT_MS,
    AI_PRACTICE_EVALUATION_TIMEOUT_MS,
    AI_MAX_RETRIES
  };

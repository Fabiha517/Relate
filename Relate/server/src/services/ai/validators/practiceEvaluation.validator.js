'use strict';

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'VALIDATION_ERROR';
  }
}

/**
 * Validates a PracticeEvaluation object returned by the AI.
 * @param {*} data
 * @returns {object} The validated evaluation
 * @throws {ValidationError}
 */
function validatePracticeEvaluation(data) {
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    throw new ValidationError('Practice evaluation response must be a JSON object');
  }

  // correct: boolean
  if (typeof data.correct !== 'boolean') {
    throw new ValidationError('correct must be a boolean');
  }

  // required non-empty string fields
  const requiredStringFields = ['feedback', 'correctAnswer', 'explanation', 'mappingLabel', 'encouragement'];
  for (const field of requiredStringFields) {
    if (typeof data[field] !== 'string' || data[field].trim() === '') {
      throw new ValidationError(`${field} must be a non-empty string`);
    }
  }

  // misconception: string or null
  if (data.misconception !== null && typeof data.misconception !== 'string') {
    throw new ValidationError('misconception must be a string or null');
  }

  return data;
}

module.exports = { validatePracticeEvaluation, ValidationError };

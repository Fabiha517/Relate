'use strict';

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'VALIDATION_ERROR';
  }
}

/**
 * Validates the array of practice questions returned by the AI.
 *
 * @param {*} data - Parsed JSON value to validate
 * @returns {Array} The validated questions array
 * @throws {ValidationError}
 */
function validatePracticeQuestions(data) {
  if (!Array.isArray(data)) {
    throw new ValidationError('Practice questions response must be a JSON array');
  }
  if (data.length < 1 || data.length > 5) {
    throw new ValidationError(
      `Practice questions array must have 1–5 items (got ${data.length})`
    );
  }

  for (let i = 0; i < data.length; i++) {
    const q = data[i];

    if (q === null || typeof q !== 'object') {
      throw new ValidationError(`questions[${i}] must be an object`);
    }

    // text
    if (typeof q.text !== 'string' || q.text.trim() === '') {
      throw new ValidationError(`questions[${i}].text must be a non-empty string`);
    }

    // type
    if (q.type !== 'multiple-choice' && q.type !== 'short-answer') {
      throw new ValidationError(
        `questions[${i}].type must be "multiple-choice" or "short-answer" (got "${q.type}")`
      );
    }

    // expectedAnswer
    if (typeof q.expectedAnswer !== 'string' || q.expectedAnswer.trim() === '') {
      throw new ValidationError(`questions[${i}].expectedAnswer must be a non-empty string`);
    }

    // explanation
    if (typeof q.explanation !== 'string' || q.explanation.trim() === '') {
      throw new ValidationError(`questions[${i}].explanation must be a non-empty string`);
    }

    // mappingLabel
    if (typeof q.mappingLabel !== 'string' || q.mappingLabel.trim() === '') {
      throw new ValidationError(`questions[${i}].mappingLabel must be a non-empty string`);
    }

    // encouragement
    if (typeof q.encouragement !== 'string' || q.encouragement.trim() === '') {
      throw new ValidationError(`questions[${i}].encouragement must be a non-empty string`);
    }

    // multiple-choice specific validation
    if (q.type === 'multiple-choice') {
      if (!Array.isArray(q.options)) {
        throw new ValidationError(`questions[${i}].options must be an array for multiple-choice`);
      }
      if (q.options.length < 2 || q.options.length > 6) {
        throw new ValidationError(
          `questions[${i}].options must have 2–6 items (got ${q.options.length})`
        );
      }

      let correctCount = 0;
      for (let j = 0; j < q.options.length; j++) {
        const opt = q.options[j];
        if (opt === null || typeof opt !== 'object') {
          throw new ValidationError(`questions[${i}].options[${j}] must be an object`);
        }
        if (typeof opt.text !== 'string' || opt.text.trim() === '') {
          throw new ValidationError(
            `questions[${i}].options[${j}].text must be a non-empty string`
          );
        }
        if (typeof opt.isCorrect !== 'boolean') {
          throw new ValidationError(
            `questions[${i}].options[${j}].isCorrect must be a boolean`
          );
        }
        if (opt.isCorrect) correctCount++;
      }

      if (correctCount !== 1) {
        throw new ValidationError(
          `questions[${i}].options must have exactly 1 correct option (got ${correctCount})`
        );
      }
    }
  }

  return data;
}

module.exports = { validatePracticeQuestions, ValidationError };

'use strict';

/**
 * Meaningfulness Validator — isolated module.
 *
 * Delegates to aiService.validateMeaningfulness so the validation mechanism
 * can be swapped (e.g. AI-based → rule-based) without touching other services.
 *
 * @module meaningfulnessValidator
 */
const aiService = require('./aiService');

/**
 * Validate whether a concept is meaningful enough for analogy generation.
 *
 * @param {string} concept
 * @returns {Promise<{ valid: boolean, reason: string, message: string }>}
 */
async function validate(concept) {
  return aiService.validateMeaningfulness(concept);
}

module.exports = { validate };

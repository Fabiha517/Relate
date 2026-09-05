'use strict';

const config = require('../../../config/env');

/**
 * Resolves the appropriate LLM provider based on LLM_PROVIDER environment variable.
 *
 * @returns {object} The provider module with a call(prompt, timeoutMs) function
 * @throws {Error} If LLM_PROVIDER is not recognized
 */
function getProvider() {
  const providerName = config.llmProvider;

  switch (providerName) {
    case 'groq':
      return require('./groq.provider');
    default:
      throw new Error(`Unknown LLM_PROVIDER: ${providerName}`);
  }
}

module.exports = { getProvider };

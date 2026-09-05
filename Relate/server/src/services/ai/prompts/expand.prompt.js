'use strict';

/**
 * Builds the expand modification prompt.
 *
 * @param {object} request
 * @param {string} request.currentAnalogyJson  - JSON.stringify of the current analogy
 * @param {string} request.analogyTitle
 * @param {number} request.currentNodeCount
 * @returns {string}
 */
function build({ currentAnalogyJson, analogyTitle, currentNodeCount }) {
  return `Expand the following analogy by adding at least 1 new node and at least 1 new relationship. The result must have no more than 20 nodes total. Preserve the analogyTitle exactly as provided. Return the same JSON schema as the original analogy generation prompt.

Current analogy (JSON):
${currentAnalogyJson}

analogyTitle to preserve: "${analogyTitle}"
Current node count: ${currentNodeCount}
Maximum nodes in result: 20`;
}

module.exports = { build };

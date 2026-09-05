'use strict';

/**
 * Builds the simplify modification prompt.
 * maxNodes = max(1, floor(currentNodeCount * 0.5))
 *
 * @param {object} request
 * @param {string} request.currentAnalogyJson  - JSON.stringify of the current analogy
 * @param {string} request.analogyTitle
 * @param {number} request.currentNodeCount
 * @returns {string}
 */
function build({ currentAnalogyJson, analogyTitle, currentNodeCount }) {
  const maxNodes = Math.max(1, Math.floor(currentNodeCount * 0.5));
  return `Simplify the following analogy. The result must have no more than ${maxNodes} nodes (minimum 1). Preserve the analogyTitle exactly as provided. Remove the least essential nodes and relationships. Return the same JSON schema as the original analogy generation prompt.

Current analogy (JSON):
${currentAnalogyJson}

analogyTitle to preserve: "${analogyTitle}"
Maximum nodes in result: ${maxNodes}`;
}

module.exports = { build };

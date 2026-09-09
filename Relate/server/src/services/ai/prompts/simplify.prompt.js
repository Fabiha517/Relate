'use strict'

function build({ currentAnalogyJson, analogyTitle, currentNodeCount }) {
  const maxNodes =
    currentNodeCount <= 3
      ? 3
      : Math.max(3, Math.floor(currentNodeCount * 0.5))

  return `
Simplify the following analogy for a beginner.

The goal is NOT merely to delete nodes.
The goal is to make the explanation easier to understand while preserving the core teaching idea.

RULES:

1. Return the exact same JSON schema required by the original analogy generation schema.
2. analogyTitle MUST remain exactly:
"${analogyTitle}"
3. The result must contain between 3 and ${maxNodes} nodes.
4. Every remaining node must have:
   - a meaningful conceptLabel
   - a meaningful analogyLabel
   - the same required id structure
5. If nodes are removed, also remove every mapping and relationship that refers to them.
6. All mappings and relationships must reference nodes that still exist.
7. Rewrite the explanation so it is genuinely simpler.
8. Rewrite the limitations if the simplification changes what needs to be clarified.
9. Do not merely shorten the existing explanation.
10. Preserve the central mechanism and meaning of the original concept.
11. If the analogy already has only 3 nodes, keep all 3 nodes and simplify their labels, mappings, relationships, and explanation instead of reducing the node count.
12. Do not introduce unrelated information.

Current node count: ${currentNodeCount}
Maximum nodes allowed: ${maxNodes}

Current analogy:

${currentAnalogyJson}
`
}

module.exports = { build }
'use strict'

function build({
  currentAnalogyJson,
  analogyTitle,
  currentNodeCount,
}) {
  const targetNodes = Math.min(
    20,
    Math.max(
      currentNodeCount + 2,
      Math.ceil(currentNodeCount * 1.4)
    )
  )

  return `
You are modifying an existing Relate teaching analogy.

MODIFICATION: MORE DETAIL

The learner already has the current explanation below.

Your job is NOT to merely add one extra node.

Create a genuinely deeper and more useful teaching version of the SAME explanation.

CURRENT ANALOGY:

${currentAnalogyJson}

TITLE TO PRESERVE EXACTLY:
"${analogyTitle}"

EXPANSION GOAL:

1. Keep the same underlying concept.
2. Keep the same analogy world.
3. Preserve the core analogy.
4. Add meaningful details that improve understanding.
5. Explain important intermediate steps that were previously skipped.
6. Make the mechanism easier to follow.
7. Add useful relationships between existing and new nodes.
8. Add detail only when it improves understanding.
9. Do not add decorative or irrelevant nodes.
10. Rewrite the explanation so it is noticeably more detailed.
11. Update the analogy so the additional detail actually exists in the analogy world.
12. Update mappings so every new concept component has a meaningful analogy counterpart.
13. Update relationships so the visual model represents the richer mechanism.
14. Update limitations when the expanded analogy introduces new claims or boundaries.

NODE REQUIREMENTS:

- Target approximately ${targetNodes} nodes.
- Maximum allowed: 20 nodes.
- Add at least 2 meaningful nodes when possible.
- Every node must teach something useful.
- Every node must have a meaningful concept-to-analogy mapping.
- Relationships must describe how the elements actually interact.
- Preserve important existing nodes unless there is a strong teaching reason to replace one.

EXPLANATION REQUIREMENT:

The new explanation must be visibly more detailed than the original.

Do NOT copy the original explanation and append one sentence.

Instead, restructure the explanation to include:

REAL CONCEPT
→ BASIC MECHANISM
→ IMPORTANT INTERMEDIATE STEPS
→ ANALOGY
→ STEP-BY-STEP CONNECTION BACK TO REALITY

Technical terminology may be used when necessary, but explain unfamiliar terms briefly on first use.

OUTPUT:

Return ONLY valid JSON using EXACTLY the same schema as the original analogy generation response.

Do not add commentary.
Do not use Markdown.
Do not omit required fields.
Do not invent new fields.

The result must be a complete replacement analogy.
`
}

module.exports = { build }
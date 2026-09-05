'use strict';

/**
 * Builds the practice-question generation prompt.
 *
 * The original concept is always the learning target.
 * The analogy is used as the mental model for testing that concept.
 */
function build({
  concept,
  analogyWorld,
  nodes,
  mappings,
  relationships,
  explanation,
  limitations,
  questionCount,
  previousQuestions = [],
}) {
  const mappingsJson = JSON.stringify(mappings, null, 2);
  const nodesJson = JSON.stringify(nodes || [], null, 2);
  const relationshipsJson = JSON.stringify(
    relationships || [],
    null,
    2
  );
  const limitationsJson = JSON.stringify(
    limitations || [],
    null,
    2
  );

  const previousQuestionsText =
    Array.isArray(previousQuestions) && previousQuestions.length > 0
      ? `

Questions already used:
${previousQuestions
  .map((question, index) => `${index + 1}. ${question}`)
  .join('\n')}

Do NOT repeat these questions or ask the same thing with only minor wording changes.`
      : '';

  return `Generate up to ${questionCount} practice questions to test the user's understanding of the ORIGINAL CONCEPT below.

ORIGINAL CONCEPT:
${concept}

ANALOGY WORLD:
${analogyWorld}

ANALOGY EXPLANATION:
${explanation}

ANALOGY NODES:
${nodesJson}

MAPPINGS:
${mappingsJson}

RELATIONSHIPS:
${relationshipsJson}

LIMITATIONS OF THE ANALOGY:
${limitationsJson}

${previousQuestionsText}

IMPORTANT PURPOSE:
The user is learning the ORIGINAL CONCEPT, not the analogy world.

The analogy is a mental model that helps explain the original concept.

Every question must therefore test a real idea, behavior, relationship, or reasoning point about the ORIGINAL CONCEPT, using the analogy as context when useful.

A question may ask the user to connect an analogy element to the original concept, but the answer must ultimately explain something about the ORIGINAL CONCEPT.

GOOD EXAMPLE:
If the concept is webhooks and the analogy says:
- a product being finished = an event
- the factory instantly packs it = creating a request
- the address label = webhook URL
- shipping it = sending the request
then a good question is:
"A factory sends a package to a specific dock immediately after a product is finished. What webhook behavior does this represent?"

The answer should be about the webhook behavior:
"An HTTP request is sent automatically when an event occurs."

BAD EXAMPLE:
"The spacecraft fails to drop the beacon. What will happen on its next visit?"

That is bad if the analogy never explicitly taught that consequence. It tests invented story details instead of the original concept.

QUESTION QUALITY RULES:

1. ORIGINAL CONCEPT FIRST
   - The original concept is the source of truth.
   - Do not test random facts about the analogy world.
   - Do not invent consequences, rules, or events that were never explained.

2. GROUNDED IN THE PROVIDED ANALOGY
   - Questions must use relationships explicitly present in the explanation/mappings.
   - Do not introduce new analogy details.

3. CLEAR WORDING
   - Questions may be challenging, but they must be easy to understand grammatically.
   - Prefer normal, familiar wording.
   - Avoid unnecessarily academic, technical, or obscure vocabulary.
   - Avoid long sentences with multiple dependent clauses.
   - Ask one main thing at a time.
   - Do not make the difficulty come from confusing wording.

4. CHALLENGE THROUGH THINKING
   - Difficulty should come from understanding the concept, applying it, comparing ideas, or reasoning about a situation.
   - Difficulty should NOT come from unusual vocabulary or complicated sentence structure.

5. TEACHING COVERAGE
   - Test different important parts of the original concept.
   - Do not repeatedly test the same mapping.
   - Use different styles when the analogy supports them:
     * basic understanding
     * concept → analogy mapping
     * analogy → concept mapping
     * application
     * reasoning
     * misconception detection
     * transfer to a new but conceptually equivalent situation

6. DO NOT TEST UNTAUGHT CONCEPTS
   - Do not ask about details that are absent from the analogy explanation.
   - Do not require outside knowledge that the user could not reasonably infer from the supplied concept and analogy.

7. EXPLANATIONS
   - Every question's explanation must teach the relevant original concept.
   - Keep it concise and clear.
   - Explain why the answer is correct.
   - Do not merely repeat the analogy story.
   - Do not introduce unrelated concepts.

8. MAPPING LABEL
   - mappingLabel MUST be copied EXACTLY from one of the provided mappings.
   - Never invent or rewrite a mappingLabel.

9. MULTIPLE CHOICE
   - Exactly one option must be correct.
   - Incorrect options should be plausible misconceptions, not nonsense.
   - Options should be similar in style and length.
   - The correct option must directly answer the question.

10. SHORT ANSWER
   - expectedAnswer must state the essential concept clearly.
   - A semantically equivalent answer should be accepted later by the evaluator.
   - "I don't know", "I don't understand", "pata nai", punctuation-only responses, or other non-answers must NOT be considered correct.

11. QUESTION COUNT
   - Generate no more than ${questionCount}.
   - If the analogy cannot support ${questionCount} genuinely distinct questions, generate fewer.
   - Minimum 1 question.

Return ONLY valid JSON array:

[
  {
    "text": string,
    "type": "multiple-choice" | "short-answer",
    "options": [
      {
        "text": string,
        "isCorrect": boolean
      }
    ],
    "expectedAnswer": string,
    "explanation": string,
    "mappingLabel": string,
    "encouragement": string
  }
]`;
}

module.exports = { build };
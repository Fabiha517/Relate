'use strict';

/**
 * Builds the practice answer evaluation prompt.
 *
 * Semantic correctness is allowed, but the answer must actually
 * attempt to answer the question.
 */
function build({ question, userAnswer }) {
  return `Evaluate the user's answer to the following practice question.

The goal is to determine whether the user actually understands the ORIGINAL CONCEPT being tested.

Question:
${question.text}

Expected Answer:
${question.expectedAnswer}

User's Answer:
${userAnswer}

Question Explanation:
${question.explanation}

Mapping:
${question.mappingLabel}

IMPORTANT EVALUATION RULES:

1. SEMANTIC CORRECTNESS
   - Do not require word-for-word matching.
   - Accept different wording when it clearly expresses the same idea.
   - Minor grammar mistakes are fine if the meaning is correct.

2. ACTUAL UNDERSTANDING IS REQUIRED
   - The answer must actually address the question.
   - Do not give credit simply because the answer contains words related to the topic.

3. INVALID / NON-ANSWERS ARE ALWAYS WRONG
   Mark correct=false for responses such as:
   - "pata nai"
   - "pata nahi"
   - "idk"
   - "I don't know"
   - "I do not know"
   - "I don't understand"
   - "I do not understand your question"
   - "I'm confused"
   - "not sure"
   - "no idea"
   - "-"
   - "/"
   - "..."
   - "???"
   - punctuation-only responses
   - other responses that do not attempt to answer the question

4. DO NOT GUESS USER INTENT
   - If the answer is unclear or does not contain an actual explanation, mark it incorrect.
   - Do not turn a meaningless response into a correct answer.

5. ORIGINAL CONCEPT FIRST
   - Evaluate whether the answer demonstrates understanding of the original concept.
   - The user does not need to describe the analogy perfectly.
   - Do not mark an answer correct merely because it describes something in the analogy world.

6. EXPLANATION
   - Explain the relevant original concept clearly.
   - Keep the explanation understandable.
   - Do not introduce concepts that were not needed to answer the question.

7. CORRECT ANSWER
   - Return the expected answer, expressed clearly.
   - Do not replace it with an unrelated analogy-world description.

8. MAPPING LABEL
   - Return the mapping label exactly as provided.
   - Do not invent or rewrite it.

Return ONLY valid JSON:

{
  "correct": boolean,
  "feedback": string,
  "correctAnswer": string,
  "explanation": string,
  "mappingLabel": string,
  "encouragement": string,
  "misconception": string | null
}`;
}

module.exports = { build };
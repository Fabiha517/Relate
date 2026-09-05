'use strict';

/**
 * Builds the "generate more questions" prompt.
 * Used when previousQuestions is present — must avoid duplicates.
 *
 * @param {object}   request
 * @param {string}   request.concept
 * @param {string}   request.analogyWorld
 * @param {string}   request.explanation
 * @param {Array}    request.mappings
 * @param {number}   request.questionCount
 * @param {string[]} request.previousQuestions  - Text of previously asked questions
 * @returns {string}
 */
function build({ concept, analogyWorld, explanation, mappings, questionCount, previousQuestions }) {
  const mappingsJson = JSON.stringify(mappings, null, 2);
  const previousQuestionsJson = JSON.stringify(previousQuestions || [], null, 2);
  return `Generate up to ${questionCount} NEW practice questions for the following analogy. These questions MUST be different from all previously asked questions.

Concept: ${concept}
Analogy World: ${analogyWorld}
Explanation: ${explanation}
Mappings:
${mappingsJson}

Previously asked questions (DO NOT generate questions that duplicate or closely resemble these):
${previousQuestionsJson}

Rules:
- Generate questions that test DIFFERENT mappings or aspects from the previously asked questions where possible.
- Questions must still be grounded in this specific analogy — NOT generic knowledge questions.
- Each question MUST reference a mappingLabel from the provided mappings list.
- Vary question styles.

Return the same JSON array format as the practice questions prompt.`;
}

module.exports = { build };

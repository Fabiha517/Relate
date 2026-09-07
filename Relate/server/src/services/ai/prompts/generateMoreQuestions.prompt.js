'use strict'

/**
 * Builds the "generate more questions" prompt.
 *
 * Used when previousQuestions is present — must avoid duplicates.
 *
 * The analogy is used as a learning scaffold, but questions MUST
 * test understanding of the original concept rather than the
 * fictional analogy/world.
 *
 * @param {object} request
 * @returns {string}
 */

function build({
  concept,
  analogyWorld,
  explanation,
  mappings,
  questionCount,
  previousQuestions,
}) {
  const mappingsJson = JSON.stringify(mappings || [], null, 2)

  const previousQuestionsJson = JSON.stringify(
    previousQuestions || [],
    null,
    2
  )

  return `Generate up to ${questionCount} NEW practice questions that test the user's understanding of the ORIGINAL CONCEPT.

The ORIGINAL CONCEPT is the primary learning target.

The analogy is ONLY a learning scaffold. Do NOT test the user on the fictional analogy, analogy world, analogy characters, analogy objects, or analogy events.

CONCEPT:
${concept}

ANALOGY WORLD:
${analogyWorld}

EXPLANATION:
${explanation}

MAPPINGS:
${mappingsJson}

PREVIOUSLY ASKED QUESTIONS:
${previousQuestionsJson}

CORE PURPOSE:

The user studied the concept using the analogy above.

Your job is to check whether the user actually understands the ORIGINAL CONCEPT.

Therefore:

- Questions MUST be about the ORIGINAL CONCEPT.
- Questions MUST test conceptual understanding, application, reasoning, distinctions, mechanisms, or relationships within the ORIGINAL CONCEPT.
- Questions MAY use information represented by the supplied mappings to decide which aspect of the concept to test.
- Questions MUST NOT ask the user to identify, recall, or reason about the analogy itself.
- Questions MUST NOT ask "Which part of the analogy...?"
- Questions MUST NOT ask "What does X represent in the analogy?"
- Questions MUST NOT ask about analogy characters, places, objects, roles, or events.
- Questions MUST NOT require knowledge of the analogy world to answer.
- A learner who understands the ORIGINAL CONCEPT should be able to answer the question even without remembering the analogy.

For example, if the concept is SMTP:

GOOD:
"What is the primary role of SMTP when sending an email?"

GOOD:
"Why does SMTP use a mail server to relay an outgoing email?"

GOOD:
"What happens when an SMTP server cannot deliver a message to the recipient's mail server?"

BAD:
"Which part of the analogy represents the SMTP server?"

BAD:
"What does the post office represent in the SMTP analogy?"

BAD:
"Why does the post office employee act as the SMTP server?"

The GOOD questions test SMTP itself.

The BAD questions test the analogy.

QUESTION QUALITY:

1. Every question must test the ORIGINAL CONCEPT, not the analogy.

2. Questions should be useful for learning and should require actual understanding rather than simple recognition of analogy details.

3. Prefer a mixture of:
   - conceptual understanding
   - cause and effect
   - practical application
   - distinguishing related concepts
   - explaining how or why something works
   - identifying the result of a change or failure

4. Do NOT make every question a definition question.

5. Do NOT make questions unnecessarily difficult or obscure.

6. Questions must be answerable using the knowledge represented by the CONCEPT, EXPLANATION, and MAPPINGS.

7. Do NOT introduce unrelated concepts that are not supported by the provided concept information.

8. Do NOT duplicate or closely paraphrase any question in PREVIOUSLY ASKED QUESTIONS.

9. Prefer testing aspects of the ORIGINAL CONCEPT that were not already tested.

MAPPING REQUIREMENT:

Each question MUST still use exactly one mappingLabel from the supplied MAPPINGS.

The mappingLabel is metadata used to identify which concept relationship the question is testing.

The mappingLabel MUST be copied EXACTLY from the supplied MAPPINGS.

Do not rewrite it.
Do not paraphrase it.
Do not add words to it.

IMPORTANT:

The mappingLabel is NOT an instruction to write an analogy-based question.

Use the mappingLabel only to identify the underlying concept relationship being tested.

QUESTION TEXT STYLE:

All question text MUST be clean plain text.

Do NOT use Markdown.

Do NOT use bold formatting.

Do NOT use italic formatting.

Do NOT use Markdown emphasis markers such as ** or *.

Do NOT use backticks.

Do NOT use code fences.

Do NOT use headings inside question text.

Do NOT add decorative symbols.

Do NOT wrap words in asterisks.

For example:

GOOD:
"What is the primary role of SMTP when sending an email?"

BAD:
"What is the primary role of **SMTP** when sending an email?"

BAD:
"What is the primary role of *SMTP* when sending an email?"

All other user-visible text fields, including expectedAnswer, explanation, and encouragement, MUST also be plain text without Markdown formatting.

QUESTION TYPES:

You may generate either:

- multiple-choice questions
- short-answer questions

Return ONLY a JSON array.

Do NOT return Markdown.

Do NOT return code fences.

Do NOT add commentary before or after the JSON.

VERY IMPORTANT:

The property containing the actual question MUST be named "text".

DO NOT use "question".

Each question object MUST follow this schema.

MULTIPLE-CHOICE EXAMPLE:

[
  {
    "text": "What is the primary role of SMTP when sending an email?",
    "type": "multiple-choice",
    "options": [
      {
        "text": "To transfer outgoing email between mail servers",
        "isCorrect": true
      },
      {
        "text": "To store email permanently on a user's device",
        "isCorrect": false
      },
      {
        "text": "To display the email inside a web browser",
        "isCorrect": false
      },
      {
        "text": "To encrypt every email message automatically",
        "isCorrect": false
      }
    ],
    "expectedAnswer": "To transfer outgoing email between mail servers",
    "explanation": "SMTP is used to send and relay email messages, including transferring outgoing messages between mail servers.",
    "mappingLabel": "EXACT mappingLabel FROM THE PROVIDED MAPPINGS",
    "encouragement": "Good thinking — you identified the core role of SMTP."
  }
]

SHORT-ANSWER EXAMPLE:

[
  {
    "text": "Why does SMTP use mail servers when delivering outgoing email?",
    "type": "short-answer",
    "expectedAnswer": "Mail servers receive, relay, and deliver outgoing email messages to the appropriate destination mail server.",
    "explanation": "SMTP is a protocol for sending and relaying email, so mail servers handle the transfer of messages toward their destination.",
    "mappingLabel": "EXACT mappingLabel FROM THE PROVIDED MAPPINGS",
    "encouragement": "Nice work — you explained the underlying concept clearly."
  }
]

REQUIRED FIELDS FOR EVERY QUESTION:

"text"

"type"

"expectedAnswer"

"explanation"

"mappingLabel"

"encouragement"

MULTIPLE-CHOICE QUESTIONS MUST ALSO HAVE:

"options"

MULTIPLE-CHOICE REQUIREMENTS:

- options must contain between 2 and 6 items.
- Every option must contain "text".
- Every option must contain "isCorrect".
- isCorrect MUST be a boolean.
- Exactly ONE option must have "isCorrect": true.
- All other options must have "isCorrect": false.
- expectedAnswer must correspond exactly to the correct option.

SHORT-ANSWER REQUIREMENTS:

- Do NOT include options.
- expectedAnswer must be a non-empty string.

FINAL VALIDATION BEFORE RETURNING:

- Return between 1 and ${questionCount} questions.
- Every question uses "text", NEVER "question".
- Every "text" value is a non-empty string.
- Every question tests the ORIGINAL CONCEPT.
- No question tests the analogy itself.
- No question requires knowledge of the analogy to answer.
- Every question has a valid type.
- Every question has a non-empty expectedAnswer.
- Every question has a non-empty explanation.
- Every question has a non-empty mappingLabel.
- Every question has a non-empty encouragement.
- Every multiple-choice question has 2–6 options.
- Every multiple-choice question has exactly one correct option.
- Every mappingLabel exactly matches a mappingLabel in MAPPINGS.
- No question duplicates or closely resembles a previous question.
- No user-visible text contains Markdown formatting.
- No user-visible text contains **.
- No user-visible text contains unnecessary asterisks.
- No user-visible text contains backticks.
- Do not return Markdown or code fences.

RETURN ONLY THE JSON ARRAY.`
}

module.exports = { build }
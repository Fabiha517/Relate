import axios from 'axios'

/**
 * Axios instance configured for practice requests with credentials.
 */
const practiceClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

/**
 * Generate practice questions for a saved analogy.
 *
 * @param {Object} params
 * @param {string} params.analogyId - Analogy ID
 * @param {string} params.concept - Original concept text
 * @param {string} params.analogyWorld - Analogy world name
 * @param {Array} params.nodes - Analogy nodes
 * @param {Array} params.mappings - Analogy mappings
 * @param {Array} params.relationships - Analogy relationships
 * @param {string} params.explanation - Explanation text
 * @param {Array} params.limitations - Limitations list
 * @returns {Promise<Object>} { questions: PracticeQuestion[] }
 */
export async function generatePracticeQuestions({
  analogyId,
  concept,
  analogyWorld,
  nodes,
  mappings,
  relationships,
  explanation,
  limitations,
}) {
  const response = await practiceClient.post('/practice/questions', {
    analogyId,
    concept,
    analogyWorld,
    nodes,
    mappings,
    relationships,
    explanation,
    limitations,
  })
  return response.data
}

/**
 * Generate additional practice questions (excluding previously asked questions).
 *
 * @param {Object} params
 * @param {string} params.analogyId - Analogy ID
 * @param {string} params.concept - Original concept text
 * @param {string} params.analogyWorld - Analogy world name
 * @param {Array} params.nodes - Analogy nodes
 * @param {Array} params.mappings - Analogy mappings
 * @param {Array} params.relationships - Analogy relationships
 * @param {string} params.explanation - Explanation text
 * @param {Array} params.limitations - Limitations list
 * @param {string[]} params.previousQuestions - Texts of previously asked questions
 * @returns {Promise<Object>} { questions: PracticeQuestion[] }
 */
export async function generateMorePracticeQuestions({
  analogyId,
  concept,
  analogyWorld,
  nodes,
  mappings,
  relationships,
  explanation,
  limitations,
  previousQuestions,
}) {
  const response = await practiceClient.post('/practice/questions/more', {
    analogyId,
    concept,
    analogyWorld,
    nodes,
    mappings,
    relationships,
    explanation,
    limitations,
    previousQuestions,
  })
  return response.data
}

/**
 * Evaluate a user's answer to a practice question.
 *
 * @param {Object} params
 * @param {Object} params.question - PracticeQuestion object
 * @param {string} params.userAnswer - User's answer text
 * @returns {Promise<Object>} { evaluation: PracticeEvaluation }
 */
export async function evaluateAnswer({ question, userAnswer }) {
  const response = await practiceClient.post('/practice/evaluate', {
    question,
    userAnswer,
  })
  return response.data
}

/**
 * Save a completed practice session.
 *
 * @param {Object} params
 * @param {string} params.analogyId - Analogy ID
 * @param {Array} params.questions - Array of practice questions
 * @param {Array} params.answers - Array of user answers
 * @param {Array} params.evaluations - Array of evaluations
 * @param {number} params.score - Session score (0-100)
 * @param {Array} [params.misconceptions] - Identified misconceptions
 * @param {string} params.completedAt - ISO timestamp
 * @returns {Promise<Object>} { sessionId: string }
 */
export async function savePracticeSession({
  analogyId,
  questions,
  answers,
  evaluations,
  score,
  misconceptions,
  completedAt,
}) {
  const response = await practiceClient.post('/practice/sessions', {
    analogyId,
    questions,
    answers,
    evaluations,
    score,
    misconceptions,
    completedAt,
  })
  return response.data
}

/**
 * Get all practice sessions for a specific analogy.
 *
 * @param {string} analogyId - Analogy ID
 * @returns {Promise<Object>} { sessions: Array }
 */
export async function getPracticeSessionsByAnalogy(analogyId) {
  const response = await practiceClient.get(`/practice/sessions/${analogyId}`)
  return response.data
}

/**
 * Get a specific practice session.
 *
 * @param {string} analogyId - Analogy ID
 * @param {string} sessionId - Session ID
 * @returns {Promise<Object>} { session: PracticeSession }
 */
export async function getPracticeSession(analogyId, sessionId) {
  const response = await practiceClient.get(`/practice/sessions/${analogyId}/${sessionId}`)
  return response.data
}

/**
 * Get practice history (all practice sessions across all analogies for the authenticated user).
 *
 * @returns {Promise<Object>} { sessions: Array } (summary data, ordered by completedAt desc)
 */
export async function getPracticeHistory() {
  const response = await practiceClient.get('/practice/history')
  return response.data
}


/**
 * Delete a practice session. The server verifies ownership before deleting.
 *
 * @param {string} sessionId - Session ID
 * @returns {Promise<void>}
 */
export async function deletePracticeSession(sessionId) {
  await practiceClient.delete(`/practice/sessions/${sessionId}`)
}
export default practiceClient


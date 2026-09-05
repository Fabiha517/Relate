import axios from 'axios'

/**
 * Axios instance configured for analogy requests with credentials.
 */
const analogyClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

/**
 * Generate a new analogy.
 *
 * @param {Object} params
 * @param {string} params.concept - The concept to explain (1-5000 chars)
 * @param {string} params.analogyWorld - Selected analogy world
 * @returns {Promise<Object>} Generated analogy with nodes, mappings, relationships, explanation, limitations
 */
export async function generateAnalogy({ concept, analogyWorld }) {
  const response = await analogyClient.post('/analogies/generate', {
    concept,
    analogyWorld,
  })
  return response.data
}

/**
 * Save an analogy to the authenticated user's library.
 *
 * @param {Object} params
 * @param {string} params.analogyTitle - Title of the analogy
 * @param {string} params.concept - Original concept text
 * @param {string} params.analogyWorld - Selected analogy world
 * @param {Array} params.nodes - Analogy nodes
 * @param {Array} params.mappings - Analogy mappings
 * @param {Array} params.relationships - Analogy relationships
 * @param {string} params.explanation - Explanation text
 * @param {Array} params.limitations - Limitations list
 * @returns {Promise<Object>} Saved analogy with id
 */
export async function saveAnalogy({
  analogyTitle,
  concept,
  analogyWorld,
  nodes,
  mappings,
  relationships,
  explanation,
  limitations,
}) {
  const response = await analogyClient.post('/analogies', {
    analogyTitle,
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
 * Get a saved analogy by ID.
 *
 * @param {string} analogyId - Analogy ID
 * @returns {Promise<Object>} Analogy object
 */
export async function getAnalogy(analogyId) {
  const response = await analogyClient.get(`/analogies/${analogyId}`)
  return response.data
}

/**
 * Update a saved analogy.
 *
 * @param {string} analogyId - Analogy ID
 * @param {Object} params - Updated analogy data
 * @returns {Promise<Object>} Updated analogy
 */
export async function updateAnalogy(analogyId, params) {
  const response = await analogyClient.put(`/analogies/${analogyId}`, params)
  return response.data
}

/**
 * Delete a saved analogy.
 *
 * @param {string} analogyId - Analogy ID
 * @returns {Promise<void>}
 */
export async function deleteAnalogy(analogyId) {
  await analogyClient.delete(`/analogies/${analogyId}`)
}

/**
 * Modify an existing analogy (simplify, expand, regenerate, or switch world).
 *
 * @param {string} analogyId - Analogy ID
 * @param {Object} params
 * @param {string} params.modificationType - 'simplify', 'expand', 'regenerate', or 'switchWorld'
 * @param {number} params.currentNodeCount - Current node count (required for simplify/expand/regenerate)
 * @param {string[]} [params.previousNodeLabels] - Previous node labels (required for regenerate)
 * @param {string} [params.analogyWorld] - New analogy world (required for switchWorld)
 * @returns {Promise<Object>} Modified analogy
 */
export async function modifyAnalogy(analogyId, params) {
  const response = await analogyClient.post(`/analogies/${analogyId}/modify`, params)
  return response.data
}

export default analogyClient

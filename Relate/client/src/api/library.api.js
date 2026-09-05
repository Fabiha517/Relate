import axios from 'axios'

/**
 * Axios instance configured for library requests with credentials.
 */
const libraryClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

/**
 * Fetch the authenticated user's library (all saved analogies).
 *
 * @returns {Promise<Object>} { analogies: Array }
 */
export async function getLibrary() {
  const response = await libraryClient.get('/library')
  return response.data
}

/**
 * Delete a saved analogy. The server verifies ownership before deleting.
 *
 * @param {string} analogyId - Analogy ID
 * @returns {Promise<void>}
 */
export async function deleteAnalogy(analogyId) {
  await libraryClient.delete(`/analogies/${analogyId}`)
}

export default libraryClient

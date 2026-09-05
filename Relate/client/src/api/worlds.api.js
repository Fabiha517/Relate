import axios from 'axios'

/**
 * Axios instance configured for worlds requests.
 */
const worldsClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

/**
 * Fetch the list of available analogy worlds.
 *
 * @returns {Promise<Object>} { worlds: string[] }
 */
export async function getWorlds() {
  const response = await worldsClient.get('/worlds')
  return response.data
}

export default worldsClient

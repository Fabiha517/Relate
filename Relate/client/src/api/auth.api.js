import axios from 'axios'

/**
 * Axios instance configured for auth requests with credentials.
 */
const authClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

/**
 * Register a new user.
 *
 * @param {Object} params
 * @param {string} params.name - User's full name
 * @param {string} params.email - User's email address
 * @param {string} params.password - User's password (8-128 chars)
 * @param {Object} [params.guestAnalogy] - Optional guest analogy to transfer
 * @returns {Promise<Object>} User object and session token in cookie
 */
export async function register({ name, email, password, guestAnalogy }) {
  const response = await authClient.post('/auth/register', {
    name,
    email,
    password,
    guestAnalogy,
  })
  return response.data
}

/**
 * Log in a user.
 *
 * @param {Object} params
 * @param {string} params.email - User's email address
 * @param {string} params.password - User's password
 * @returns {Promise<Object>} User object and session token in cookie
 */
export async function login({ email, password }) {
  const response = await authClient.post('/auth/login', {
    email,
    password,
  })
  return response.data
}

/**
 * Log out the current user.
 *
 * @returns {Promise<void>}
 */
export async function logout() {
  await authClient.post('/auth/logout')
}

/**
 * Get the current authenticated user's profile.
 *
 * @returns {Promise<Object>} User object with name, email, createdAt
 * @throws {Error} 401 if not authenticated
 */
export async function getCurrentUser() {
  const response = await authClient.get('/auth/me')
  return response.data
}

/**
 * Request a password reset email.
 * Always returns 200 for security (enumeration-safe).
 *
 * @param {Object} params
 * @param {string} params.email - User's email address
 * @returns {Promise<Object>} Success message
 */
export async function requestPasswordReset({ email }) {
  const response = await authClient.post('/auth/forgot-password', {
    email,
  })
  return response.data
}

/**
 * Reset password using a reset token.
 *
 * @param {Object} params
 * @param {string} params.token - Reset token from email link
 * @param {string} params.password - New password (8-128 chars)
 * @returns {Promise<Object>} Success message
 */
export async function resetPassword({ token, password }) {
  const response = await authClient.post('/auth/reset-password', {
    token,
    password,
  })
  return response.data
}


/**
 * Update the current user's profile information.
 *
 * @param {Object} params
 * @param {string} params.name - User's updated name
 * @returns {Promise<Object>} Updated user object and success message
 * @throws {Error} 400/401 if validation fails or not authenticated
 */
export async function updateProfile({ name }) {
  const response = await authClient.put('/auth/profile', {
    name,
  })
  return response.data
}

/**
 * Change the current user's password.
 *
 * @param {Object} params
 * @param {string} params.currentPassword - User's current password
 * @param {string} params.newPassword - User's new password (8-128 chars)
 * @returns {Promise<Object>} Success message
 * @throws {Error} 400/401 if validation fails, current password incorrect, or not authenticated
 */
export async function changePassword({ currentPassword, newPassword }) {
  const response = await authClient.put('/auth/password', {
    currentPassword,
    newPassword,
  })
  return response.data
}
export default authClient


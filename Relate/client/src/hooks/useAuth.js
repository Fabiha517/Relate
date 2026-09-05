import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

/**
 * Hook to read AuthContext.
 * Returns user, loading state, and auth actions (login, logout).
 *
 * @returns {Object} Auth context with user, loading, login, logout
 * @throws {Error} If used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default useAuth

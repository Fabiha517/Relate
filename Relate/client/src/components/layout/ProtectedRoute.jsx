import { Navigate, useLocation } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'

/**
 * ProtectedRoute
 *
 * Prevents unauthenticated users from accessing protected pages.
 * Waits for the initial authentication check to finish before
 * deciding whether the user is authenticated.
 */
export function ProtectedRoute({ children }) {
  const { user, initializing } = useAuth()
  const location = useLocation()

  // Wait only for the initial /auth/me check.
  if (initializing) {
    return null
  }

  // Once initialization is complete, redirect unauthenticated users.
  if (!user) {
    return (
      <Navigate
        to={`/login?from=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    )
  }

  return children
}

export default ProtectedRoute
import { Navigate } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'

/**
 * GuestRoute - Wrapper for guest-only routes.
 *
 * Prevents authenticated users from accessing guest-only pages.
 */
export function GuestRoute({ children }) {
  const { user, initializing } = useAuth()

  // Only wait during the initial /auth/me check.
  if (initializing) {
    return null
  }

  // Authenticated users should not access guest-only pages.
  if (user !== null) {
    return <Navigate to="/" replace />
  }

  // Unauthenticated users can access the guest page.
  return children
}

export default GuestRoute
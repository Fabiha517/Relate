import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

/**
 * GuestRoute - Wrapper for guest-only routes (login, register, forgot-password, reset-password).
 *
 * Prevents authenticated users from accessing these pages.
 * Redirects authenticated users to /library (the authenticated landing page).
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component to render if user is not authenticated
 */
export function GuestRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    // Defer navigation until loading is complete
    return null
  }

  if (user !== null) {
    // User is authenticated, redirect to library
    return <Navigate to="/library" replace />
  }

  // User is not authenticated, allow access to guest-only page
  return children
}

export default GuestRoute

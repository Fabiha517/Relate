import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

/**
 * LoadingSpinner - Simple loading indicator.
 */
function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div>Loading...</div>
    </div>
  )
}

/**
 * ProtectedRoute - Wrapper for routes that require authentication.
 *
 * - Shows LoadingSpinner while loading
 * - Redirects to /login?from=<currentPath> if user is null
 * - Renders the protected component if user is authenticated
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Component to render if authenticated
 */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingSpinner />
  }

  if (user === null) {
    const from = location.pathname + location.search
    return <Navigate to={`/login?from=${encodeURIComponent(from)}`} replace />
  }

  return children
}

export default ProtectedRoute

/** @jsxImportSource react */
import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import * as authApi from '../api/auth.api'
import * as guestSession from '../utils/guestSession'

/**
 * LoginPage - User login form with email and password fields.
 * Includes post-login guest analogy transfer flow.
 *
 * Requirements: 7.10-7.13, 7.22, 6.9
 */
export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login: contextLogin } = useAuth()

  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [saveGuestAnalogyError, setSaveGuestAnalogyError] = useState('')

  // Redirect if already authenticated
  useEffect(() => {
    // This is handled by GuestRoute, but we can add a check here too
  }, [])

  /**
   * Validate form fields.
   * Returns true if all fields are valid, false otherwise.
   */
  function validateForm() {
    const newErrors = {}

    if (!email.trim()) {
      newErrors.email = 'Email is required.'
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handle form submission.
   */
  async function handleSubmit(e) {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setLoginError('')
    setSaveGuestAnalogyError('')

    try {
      // Log in the user
      await contextLogin(email, password)

      // Post-login: check for guest analogy
      const guestAnalogy = guestSession.get()
      if (guestAnalogy) {
        try {
          // Try to save the guest analogy to the user's library
          await authApi.saveAnalogy(guestAnalogy)
          // Clear session on success
          guestSession.clear()
        } catch (saveError) {
          // On save failure: show non-blocking error, but still navigate
          console.error('Failed to save guest analogy:', saveError.message)
          setSaveGuestAnalogyError(
            'Your guest analogy could not be saved, but your account was created successfully.'
          )
          // Don't clear guestSession - let user retry later if needed
        }
      }

      // Navigate to library (or the original destination)
      const from = searchParams.get('from') || '/library'
      navigate(from, { replace: true })
    } catch (error) {
      // Generic error message (no distinction between email/password)
      // Requirement 7.16: generic message
      setLoginError('Invalid email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-heading">Log in to Relate</h1>

        {loginError && (
          <div className="error-banner">
            <p>{loginError}</p>
          </div>
        )}

        {saveGuestAnalogyError && (
          <div className="warning-banner">
            <p>{saveGuestAnalogyError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Email field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                // Clear error when user starts typing
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: '' }))
                }
              }}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="your@email.com"
              disabled={loading}
            />
            {errors.email && (
              <p className="field-error">{errors.email}</p>
            )}
          </div>

          {/* Password field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                // Clear error when user starts typing
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: '' }))
                }
              }}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="••••••••"
              disabled={loading}
            />
            {errors.password && (
              <p className="field-error">{errors.password}</p>
            )}
          </div>

          {/* Forgot password link */}
          <div className="forgot-password-link">
            <Link to="/forgot">Forgot password?</Link>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        {/* Sign up link */}
        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  )
}

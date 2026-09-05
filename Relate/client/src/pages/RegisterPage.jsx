/** @jsxImportSource react */
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import * as authApi from '../api/auth.api'
import * as guestSession from '../utils/guestSession'

/**
 * RegisterPage - User registration form with name, email, password, and confirm password fields.
 * Includes guest analogy transfer on successful registration.
 *
 * Requirements: 7.10-7.13, 7.22, 6.9
 */
export default function RegisterPage() {
  const navigate = useNavigate()
  const { login: contextLogin } = useAuth()

  // Form state
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [saveGuestAnalogyError, setSaveGuestAnalogyError] = useState('')

  /**
   * Validate form fields.
   * Returns true if all fields are valid, false otherwise.
   * Field-specific validation per Requirement 7.13
   */
  function validateForm() {
    const newErrors = {}

    // Name validation (Requirement 7.4, 7.5)
    if (!name.trim()) {
      newErrors.name = 'Please enter your name.'
    } else if (name.length > 100) {
      newErrors.name = 'Name must be 100 characters or fewer.'
    }

    // Email validation (Requirement 7.2)
    if (!email.trim()) {
      newErrors.email = 'Please enter your email address.'
    }

    // Password validation (Requirement 7.3)
    if (!password.trim()) {
      newErrors.password = 'Password is required.'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.'
    } else if (password.length > 128) {
      newErrors.password = 'Password must be no more than 128 characters.'
    }

    // Confirm password validation (Requirement 7.11)
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password.'
    }

    // Confirm passwords match (Requirement 7.12)
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.'
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
    setRegisterError('')
    setSaveGuestAnalogyError('')

    try {
      // Get guest analogy if present (before registration)
      const guestAnalogy = guestSession.get()

      // Register the user
      // Note: confirmPassword is NEVER included in the payload (Requirement 7.8)
      const payload = {
        name,
        email,
        password,
      }

      // Include guestAnalogy if present (Requirement 6.9)
      if (guestAnalogy) {
        payload.guestAnalogy = guestAnalogy
      }

      const response = await authApi.register(payload)

      // Automatically log in after successful registration
      await contextLogin(email, password)

      // Try to save guest analogy if it wasn't already saved during registration
      if (guestAnalogy) {
        try {
          // If the backend didn't save it during registration, try to save it now
          await authApi.saveAnalogy(guestAnalogy)
          guestSession.clear()
        } catch (saveError) {
          // On save failure: show non-blocking error, but still navigate
          console.error('Failed to save guest analogy:', saveError.message)
          setSaveGuestAnalogyError(
            'Your account was created successfully, but your guest analogy could not be saved.'
          )
          // Don't clear guestSession - let user retry later if needed
        }
      }

      // Navigate to library
      navigate('/library', { replace: true })
    } catch (error) {
      // Display server error messages if available
      if (error.response?.data?.error?.fields) {
        // Multiple field errors
        setErrors(error.response.data.error.fields)
      } else if (error.response?.data?.error?.message) {
        // General error message
        setRegisterError(error.response.data.error.message)
      } else {
        setRegisterError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-heading">Create an Account</h1>

        {registerError && (
          <div className="error-banner">
            <p>{registerError}</p>
          </div>
        )}

        {saveGuestAnalogyError && (
          <div className="warning-banner">
            <p>{saveGuestAnalogyError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Name field */}
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                // Clear error when user starts typing
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: '' }))
                }
              }}
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="Your full name"
              disabled={loading}
            />
            {errors.name && (
              <p className="field-error">{errors.name}</p>
            )}
          </div>

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

          {/* Confirm Password field */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value)
                // Clear error when user starts typing
                if (errors.confirmPassword) {
                  setErrors((prev) => ({ ...prev, confirmPassword: '' }))
                }
              }}
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="••••••••"
              disabled={loading}
            />
            {errors.confirmPassword && (
              <p className="field-error">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        {/* Log in link */}
        <p className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  )
}

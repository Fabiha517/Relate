/** @jsxImportSource react */
import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import * as authApi from '../api/auth.api'

/**
 * ResetPasswordPage - Reset password using a reset token from email.
 * CRITICAL SECURITY: Applies Referrer-Policy: no-referrer while the plaintext
 * reset token is present in the URL to prevent token leakage through HTTP Referer header.
 *
 * Requirements: 16.11-16.16
 */
export default function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Extract token from URL query parameter
  const token = searchParams.get('token')

  // Form state
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetErrorCode, setResetErrorCode] = useState('')
  const [submitted, setSubmitted] = useState(false)

  /**
   * CRITICAL SECURITY: Apply Referrer-Policy: no-referrer while token is in URL.
   * This prevents the reset URL (containing the plaintext token) from leaking
   * through the HTTP Referer header to any third-party resources or services.
   *
   * Requirement 16.16: "ResetPasswordPage must apply Referrer-Policy: no-referrer
   * via <meta> tag while the plaintext reset token is present in the URL"
   */
  useEffect(() => {
    if (token) {
      // Create meta tag for Referrer-Policy
      const metaTag = document.createElement('meta')
      metaTag.name = 'referrer'
      metaTag.content = 'no-referrer'
      document.head.appendChild(metaTag)

      // Clean up when component unmounts or token clears
      return () => {
        document.head.removeChild(metaTag)
      }
    }
  }, [token])

  /**
   * Validate form fields.
   * Returns true if all fields are valid, false otherwise.
   */
  function validateForm() {
    const newErrors = {}

    // Password validation (Requirement 16.11)
    if (!password.trim()) {
      newErrors.password = 'Password is required.'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.'
    } else if (password.length > 128) {
      newErrors.password = 'Password must be no more than 128 characters.'
    }

    // Confirm password validation
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password.'
    }

    // Confirm passwords match
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

    if (!token) {
      setResetError('Invalid or missing reset token.')
      return
    }

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setResetError('')
    setResetErrorCode('')

    try {
      // Submit password reset
      await authApi.resetPassword({
        token,
        password,
      })

      // Success - show confirmation and redirect to login
      setSubmitted(true)
    } catch (error) {
      // Check for specific error codes
      if (error.response?.data?.error?.code === 'RESET_TOKEN_INVALID') {
        // Requirement 16.13: specific error with new-request link
        setResetErrorCode('RESET_TOKEN_INVALID')
        setResetError(
          error.response?.data?.error?.message ||
          'This password reset link is invalid or has expired.'
        )
      } else if (error.response?.data?.error?.message) {
        setResetError(error.response.data.error.message)
      } else {
        setResetError('Failed to reset password. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-heading">Invalid reset link</h1>

          <p className="error-message">
            This password reset link is invalid or missing. Please request a new one.
          </p>

          <div className="auth-footer">
            <Link to="/forgot">Request a new reset link</Link>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-heading">Password reset successful</h1>

          <div className="success-message">
            <p>Your password has been reset successfully.</p>
            <p>You can now log in with your new password.</p>
          </div>

          <Link to="/login" className="btn btn-primary">
            Go to login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-heading">Reset your password</h1>

        {resetError && (
          <div className="error-banner">
            <p>{resetError}</p>
            {resetErrorCode === 'RESET_TOKEN_INVALID' && (
              <Link to="/forgot" className="error-link">
                Request a new reset link
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* New Password field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              New Password
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
            {loading ? 'Resetting password...' : 'Reset password'}
          </button>
        </form>

        {/* Back to login link */}
        <p className="auth-footer">
          <Link to="/login">Back to login</Link>
        </p>
      </div>
    </div>
  )
}

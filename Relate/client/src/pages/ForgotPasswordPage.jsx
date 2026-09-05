/** @jsxImportSource react */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import * as authApi from '../api/auth.api'

/**
 * ForgotPasswordPage - Request password reset email.
 * Always shows success message regardless of whether email exists (enumeration-safe).
 *
 * Requirements: 16.11-16.16
 */
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  /**
   * Validate form fields.
   * Returns true if email is present, false otherwise.
   */
  function validateForm() {
    const newErrors = {}

    if (!email.trim()) {
      newErrors.email = 'Please enter your email address.'
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

    try {
      // Request password reset
      // Always returns 200 for enumeration safety (Requirement 16.11)
      await authApi.requestPasswordReset({ email })

      // Show success message
      setSubmitted(true)
    } catch (error) {
      // Even on error, show the success message (enumeration-safe)
      // Requirement: "Always shows success message regardless of outcome"
      console.error('Password reset request error:', error.message)
      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-heading">Check your email</h1>

          <div className="success-message">
            <p>
              If an account with that email exists, a password reset link has been sent to your inbox.
            </p>
            <p>
              The link will expire in 1 hour. If you don't see the email, check your spam folder.
            </p>
          </div>

          <div className="auth-footer">
            <Link to="/login">Back to login</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-heading">Reset your password</h1>

        <p className="auth-description">
          Enter your email address and we'll send you a link to reset your password.
        </p>

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

          {/* Submit button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send reset link'}
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

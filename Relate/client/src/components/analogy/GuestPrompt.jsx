/** @jsxImportSource react */
import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * GuestPrompt - Prompt shown AFTER analogy is displayed (not overlaid)
 * Three action buttons: Create Account, Log In, Dismiss
 * Dismiss behavior: hides prompt, disables concept form, but keeps guestAnalogy in sessionStorage
 * 
 * Requirements: 6.7, 6.8, 6.9, 6.13
 */
export default function GuestPrompt({ onDismiss, onConceptFormDisable }) {
  const navigate = useNavigate()

  const handleCreateAccount = useCallback(() => {
    navigate('/register')
  }, [navigate])

  const handleLogIn = useCallback(() => {
    navigate('/login')
  }, [navigate])

  const handleDismiss = useCallback(() => {
    // Hide prompt but keep guestAnalogy in sessionStorage
    onDismiss()
    // Disable concept form so user can't generate another analogy as guest
    onConceptFormDisable()
  }, [onDismiss, onConceptFormDisable])

  return (
    <div className="guest-prompt">
      <div className="guest-prompt-content">
        <h3>Ready to save your progress?</h3>
        <p>Create an account to save this analogy, practice your understanding, and track your learning over time.</p>

        <div className="guest-prompt-actions">
          <button onClick={handleCreateAccount} className="btn btn-primary">
            Create Account
          </button>
          <button onClick={handleLogIn} className="btn btn-ghost">
            Log In
          </button>
          <button onClick={handleDismiss} className="btn btn-ghost btn-dismiss">
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

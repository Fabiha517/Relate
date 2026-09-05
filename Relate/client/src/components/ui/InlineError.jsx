/** @jsxImportSource react */

/**
 * InlineError - Displays inline validation/error messages
 * Used on form fields for errors like MEANINGFULNESS_REJECTED
 * Appears below the relevant form field
 * 
 * Requirements: 6.7, 6.8
 */
export default function InlineError({ message, onDismiss, showRetry = false, onRetry }) {
  if (!message) return null

  return (
    <div className="inline-error" role="alert">
      <div className="error-content">
        <p className="error-message">{message}</p>
        <div className="error-actions">
          {showRetry && onRetry && (
            <button onClick={onRetry} className="btn btn-ghost btn-sm">
              Try again
            </button>
          )}
          {onDismiss && (
            <button onClick={onDismiss} className="btn btn-ghost btn-sm btn-close">
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

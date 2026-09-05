/** @jsxImportSource react */

import { useState, useCallback, useEffect } from 'react'

/**
 * BannerError - Dismissible error banner at page level
 *
 * Shows:
 * - Error message
 * - Optional "Try again" button
 * - Optional "Dismiss" button
 *
 * Accepts either:
 * - message="Something went wrong"
 * - message={{ message: "Something went wrong" }}
 */
export default function BannerError({
  message,
  onDismiss,
  onRetry,
  isDismissible = true,
}) {
  const [isVisible, setIsVisible] = useState(!!message)

  /*
   * Keep visibility in sync when a NEW error is supplied.
   *
   * Without this, dismissing one error and then receiving
   * another error could leave the banner hidden.
   */
  useEffect(() => {
    setIsVisible(!!message)
  }, [message])

  const handleDismiss = useCallback(() => {
    setIsVisible(false)
    onDismiss?.()
  }, [onDismiss])

  const handleRetry = useCallback(() => {
    onRetry?.()
  }, [onRetry])

  if (!message || !isVisible) {
    return null
  }

  /*
   * Error messages should normally be strings.
   * However, safely support an error object too.
   */
  const displayMessage =
    typeof message === 'string'
      ? message
      : message?.message ||
        message?.error?.message ||
        'Something went wrong. Please try again.'

  /*
   * If the caller explicitly provides dismissible inside
   * the error object, respect it.
   */
  const dismissible =
    typeof message === 'object' &&
    typeof message.dismissible === 'boolean'
      ? message.dismissible
      : isDismissible

  return (
    <div className="banner-error" role="alert">
      <div className="banner-content">
        <div className="error-text">
          <p>{displayMessage}</p>
        </div>

        <div className="banner-actions">
          {onRetry && (
            <button
              type="button"
              onClick={handleRetry}
              className="btn btn-primary btn-sm"
            >
              Try again
            </button>
          )}

          {dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              className="btn btn-ghost btn-sm"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
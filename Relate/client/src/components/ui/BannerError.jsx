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
   * Safely support an error object too.
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
    <div
      className="mx-auto mb-6 w-full max-w-6xl px-4 sm:px-6 lg:px-8"
      role="alert"
    >
      <div className="flex flex-col gap-4 rounded-2xl border border-[#E9D9D9] bg-[#FFF9F8] px-5 py-4 shadow-[0_2px_10px_rgba(80,55,45,0.04)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        {/* Error message */}
        <div className="flex min-w-0 items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F7E8E5]">
            <span className="text-sm font-bold text-[#B56A61]">
              !
            </span>
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium leading-6 text-[#51464A]">
              {displayMessage}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2 pl-11 sm:pl-0">
          {onRetry && (
            <button
              type="button"
              onClick={handleRetry}
              className="rounded-xl bg-[#6855C8] px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#5D4BBB] hover:shadow-[0_4px_12px_rgba(104,85,200,0.18)] focus:outline-none focus:ring-2 focus:ring-[#B9ADF0] focus:ring-offset-2"
            >
              Try again
            </button>
          )}

          {dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-[#827A82] transition-colors duration-200 hover:bg-[#F3EEEC] hover:text-[#51484D] focus:outline-none focus:ring-2 focus:ring-[#D8D0CD] focus:ring-offset-2"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
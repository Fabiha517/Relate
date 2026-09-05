/** @jsxImportSource react */
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * AuthModal - Friendly modal for prompting guests to sign in or create an account.
 *
 * Props:
 * - isOpen: boolean
 * - title: string
 * - message: string
 * - showMaybeLater: boolean (default false)
 * - onClose: function
 */
export default function AuthModal({
  isOpen,
  title,
  message,
  showMaybeLater = false,
  onClose,
}) {
  const navigate = useNavigate()
  const closeRef = useRef(null)

  // Focus the close/later button when modal opens
  useEffect(() => {
    if (isOpen && closeRef.current) {
      closeRef.current.focus()
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#071a38]/60 backdrop-blur-sm"
        onClick={showMaybeLater ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm rounded-[20px] border-2 border-[#071a38] bg-[#fffaf2] p-6 shadow-[6px_6px_0_#071a38] sm:p-8">
        {/* Decorative accent */}
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#ffb800] text-xl font-black text-[#071a38] shadow-[2px_2px_0_#071a38]">
          ✦
        </div>

        {/* Title */}
        <h2
          id="auth-modal-title"
          className="mb-3 text-xl font-black uppercase tracking-tight text-[#071a38]"
        >
          {title}
        </h2>

        {/* Message */}
        <p className="mb-6 text-sm leading-relaxed text-[#526477]">
          {message}
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="w-full rounded-xl border-2 border-[#5424c7] bg-[#5424c7] px-5 py-3 text-sm font-black text-white shadow-[3px_3px_0_#071a38] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#071a38] active:translate-y-0 active:shadow-[1px_1px_0_#071a38]"
          >
            Create account
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full rounded-xl border-2 border-[#071a38] bg-[#f8f1e5] px-5 py-3 text-sm font-black text-[#071a38] shadow-[3px_3px_0_#071a38] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#071a38] active:translate-y-0 active:shadow-[1px_1px_0_#071a38]"
          >
            Sign in
          </button>

          {showMaybeLater && (
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="mt-1 text-center text-xs font-medium text-[#526477] underline-offset-2 hover:underline"
            >
              Maybe later
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

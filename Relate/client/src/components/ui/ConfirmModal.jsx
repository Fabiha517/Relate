/** @jsxImportSource react */
import { useEffect, useRef } from 'react'

/**
 * ConfirmModal - Reusable confirmation dialog for destructive or important actions.
 *
 * Props:
 * - isOpen: boolean
 * - title: string
 * - message: string
 * - confirmLabel: string (default "Confirm")
 * - cancelLabel: string (default "Cancel")
 * - confirmVariant: "danger" | "primary" (default "danger")
 * - onConfirm: function
 * - onCancel: function
 * - children: optional additional content under message
 */
export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmVariant = 'danger',
  onConfirm,
  onCancel,
  children,
}) {
  const cancelRef = useRef(null)

  // Focus trap: focus Cancel button when modal opens
  useEffect(() => {
    if (isOpen && cancelRef.current) {
      cancelRef.current.focus()
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const confirmBtnClass =
    confirmVariant === 'danger'
      ? 'rounded-xl border-2 border-[#f27d6b] bg-[#f27d6b] px-5 py-2.5 text-sm font-black text-white shadow-[3px_3px_0_#071a38] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#071a38] active:translate-y-0 active:shadow-[1px_1px_0_#071a38]'
      : 'rounded-xl border-2 border-[#5424c7] bg-[#5424c7] px-5 py-2.5 text-sm font-black text-white shadow-[3px_3px_0_#071a38] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#071a38] active:translate-y-0 active:shadow-[1px_1px_0_#071a38]'

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#071a38]/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm rounded-[20px] border-2 border-[#071a38] bg-[#fffaf2] p-6 shadow-[6px_6px_0_#071a38] sm:p-8">
        {/* Title */}
        <h2
          id="confirm-modal-title"
          className="mb-3 text-xl font-black uppercase tracking-tight text-[#071a38]"
        >
          {title}
        </h2>

        {/* Message */}
        {message && (
          <p className="mb-4 text-sm leading-relaxed text-[#526477]">
            {message}
          </p>
        )}

        {/* Optional children */}
        {children}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            ref={cancelRef}
            type="button"
            onClick={onCancel}
            className="rounded-xl border-2 border-[#c9c5bb] bg-transparent px-5 py-2.5 text-sm font-bold text-[#526477] transition-all hover:-translate-y-0.5 hover:border-[#071a38] hover:text-[#071a38] active:translate-y-0"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={confirmBtnClass}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

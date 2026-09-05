/** @jsxImportSource react */

import { useState } from 'react'

/**
 * ConceptForm
 *
 * Compact concept input matching the Relate home-page design.
 *
 * Functionality preserved:
 * - 1–5000 character validation
 * - Real-time input
 * - External errors
 * - Loading state
 * - Disabled state
 * - Submit with arrow button
 * - Enter key submission
 */

export default function ConceptForm({
  value = '',
  onChange = () => {},
  onSubmit = () => {},
  loading = false,
  error = null,
  disabled = false,
}) {
  const MAX_CHARS = 5000

  const charCount = (value || '').length

  const [touched, setTouched] = useState(false)

  const isEmpty = charCount === 0
  const isTooLong = charCount > MAX_CHARS

  let displayError = null

  if (isEmpty && touched && !error) {
    displayError =
      'Please enter a concept, question, or explanation.'
  }

  if (isTooLong && !error) {
    displayError =
      `Concept must be no more than ${MAX_CHARS} characters.`
  }

  function handleChange(e) {
    const newValue = e.target.value

    if (newValue.length <= MAX_CHARS) {
      onChange(newValue)
    }
  }

  function handleBlur() {
    setTouched(true)
  }

  function handleSubmit(e) {
    e.preventDefault()

    setTouched(true)

    if (isEmpty || isTooLong || loading || disabled) {
      return
    }

    onSubmit(value)
  }

  return (
    <form
      className="w-full"
      onSubmit={handleSubmit}
    >

      {/* =====================================================
          INPUT
          ===================================================== */}
      <div
        className={`
          flex
          w-full
          overflow-hidden
          rounded-[7px]
          border-2
          bg-[#f8f1e5]
          transition-all
          duration-150

          ${
            displayError || (error && error.field === 'concept')
              ? 'border-red-400'
              : 'border-[#7d8490]'
          }

          focus-within:border-[#5424c7]
          focus-within:shadow-[0_0_0_2px_rgba(84,36,199,0.10)]
        `}
      >

        {/* TEXT INPUT */}
        <input
          id="concept"
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          disabled={loading || disabled}
          placeholder="e.g. recursion"
          maxLength={MAX_CHARS}
          aria-label="What are you trying to understand?"
          className="
            min-w-0
            flex-1
            border-0
            bg-transparent
            px-4
            py-[11px]
            text-[13px]
            font-medium
            text-[#071a38]
            outline-none
            placeholder:text-[#8b8b8b]
            placeholder:font-medium
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        />

        {/* =================================================
            PURPLE ARROW BUTTON
            ================================================= */}
        <button
          type="submit"
          disabled={
            isEmpty ||
            isTooLong ||
            loading ||
            disabled
          }
          aria-label="Continue"
          className="
            flex
            h-[46px]
            w-[46px]
            flex-shrink-0
            items-center
            justify-center
            bg-[#5424c7]
            text-white
            transition-all
            duration-150

            hover:bg-[#4520a8]
            active:scale-[0.96]

            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {loading ? (
            <span
              className="
                h-4
                w-4
                animate-spin
                rounded-full
                border-2
                border-white/40
                border-t-white
              "
            />
          ) : (
            <span
              className="
                text-[23px]
                font-light
                leading-none
                translate-y-[-1px]
              "
            >
              →
            </span>
          )}
        </button>

      </div>

      {/* =====================================================
          VALIDATION ERROR
          ===================================================== */}
      {displayError && (
        <p
          className="
            mt-2
            px-1
            text-[10px]
            font-medium
            text-red-500
          "
        >
          {displayError}
        </p>
      )}

      {/* =====================================================
          EXTERNAL ERROR FROM API/PARENT
          ===================================================== */}
      {error && error.field === 'concept' && (
        <p
          className="
            mt-2
            px-1
            text-[10px]
            font-medium
            text-red-500
          "
        >
          {error.message}
        </p>
      )}

    </form>
  )
}
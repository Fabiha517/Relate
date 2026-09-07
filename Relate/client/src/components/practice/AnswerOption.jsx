export function AnswerOption({
  letter,
  text,
  isSelected,
  isEvaluated,
  isCorrect,
  onClick,
  disabled = false,
}) {
  let stateClass = 'unselected'

  if (isEvaluated) {
    stateClass = isCorrect
      ? 'correct'
      : 'incorrect'
  } else if (isSelected) {
    stateClass = 'selected'
  }

  const handleKeyDown = (e) => {
    /*
     * Allow spacebar or enter to select
     */
    if (
      e.key === ' ' ||
      e.key === 'Enter'
    ) {
      e.preventDefault()

      if (
        !disabled &&
        !isEvaluated
      ) {
        onClick()
      }
    }
  }

  const selected =
    stateClass === 'selected'

  const correct =
    stateClass === 'correct'

  const incorrect =
    stateClass === 'incorrect'

  return (
    <div
      className={`
        group
        relative
        flex
        min-h-[76px]
        w-full
        cursor-pointer
        items-center
        gap-4
        overflow-hidden
        rounded-[22px]
        border-2
        px-5
        py-4
        text-left
        transition-all
        duration-250
        focus:outline-none
        focus:ring-2
        focus:ring-[#5424C7]
        focus:ring-offset-2
        focus:ring-offset-[#F7F0E3]

        ${
          selected
            ? `
              border-[#5424C7]
              bg-[#EEE7FF]
              shadow-[4px_5px_0_#5424C7]
              -translate-y-1
            `
            : correct
              ? `
                border-[#4E9EA0]
                bg-[#D8F1EE]
              `
              : incorrect
                ? `
                  border-[#E47B62]
                  bg-[#FBE0D9]
                `
                : `
                  border-[#D8D0C2]
                  bg-[#FFFDF7]
                  shadow-[2px_3px_0_#D8D0C2]

                  hover:-translate-y-1
                  hover:border-[#5424C7]
                  hover:shadow-[4px_5px_0_#C7BDDB]
                `
        }

        ${disabled ? 'cursor-default' : ''}
      `}
      role="radio"
      aria-checked={isSelected}
      tabIndex={disabled ? -1 : 0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`Option ${letter}: ${text}`}
    >

      {/* =====================================================
          HOVER SWEEP
      ===================================================== */}

      {!selected &&
        !correct &&
        !incorrect && (
          <div
            className="
              absolute
              inset-y-0
              -left-full
              w-1/2
              skew-x-[-18deg]
              bg-[#EEE7FF]/50
              transition-all
              duration-500
              group-hover:left-[120%]
            "
          />
        )}

      {/* =====================================================
          LETTER
      ===================================================== */}

      <div
        className={`
          relative
          flex
          h-11
          w-11
          shrink-0
          items-center
          justify-center
          rounded-full
          border-2
          text-sm
          font-black
          transition-all
          duration-200

          ${
            selected
              ? 'border-[#5424C7] bg-[#5424C7] text-white'

              : correct
                ? 'border-[#4E9EA0] bg-[#4E9EA0] text-white'

                : incorrect
                  ? 'border-[#E47B62] bg-[#E47B62] text-white'

                  : 'border-[#D2C9BD] bg-[#F7F2E9] text-[#6F6875] group-hover:border-[#5424C7] group-hover:text-[#5424C7]'
          }
        `}
      >
        {letter}
      </div>

      {/* =====================================================
          TEXT
      ===================================================== */}

      <div className="relative flex-1 text-sm font-semibold leading-6 text-[#353B48] sm:text-base">
        {text}
      </div>

      {/* =====================================================
          SELECTED
      ===================================================== */}

      {selected && (
        <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#5424C7] text-xs font-black text-white">
          ✓
        </div>
      )}

      {/* =====================================================
          CORRECT
      ===================================================== */}

      {correct && (
        <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#4E9EA0] text-xs font-black text-white">
          ✓
        </div>
      )}

      {/* =====================================================
          INCORRECT
      ===================================================== */}

      {incorrect && (
        <div className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E47B62] text-xs font-black text-white">
          ×
        </div>
      )}

    </div>
  )
}
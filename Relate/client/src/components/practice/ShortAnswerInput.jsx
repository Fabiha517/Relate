import { useState } from 'react'

export function ShortAnswerInput({
  onSubmit,
  isAnswered = false,
  placeholder = 'Type your answer...',
}) {
  const [answer, setAnswer] = useState('')

  const handleSubmit = () => {
    const trimmedAnswer = answer.trim()

    if (trimmedAnswer && !isAnswered) {
      onSubmit(trimmedAnswer)
    }
  }

  const handleKeyDown = (e) => {
    // Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="relative">

      {/* little decorative pencil */}
      <svg
        aria-hidden="true"
        className="absolute -right-3 -top-5 z-10 h-12 w-12 rotate-12 text-[#F0A23A]"
        viewBox="0 0 50 50"
        fill="none"
      >
        <path
          d="M10 39L13 29L34 8L42 16L21 37L10 39Z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        <path
          d="M29 13L37 21"
          stroke="currentColor"
          strokeWidth="2"
        />
      </svg>

      <div className="overflow-hidden rounded-[30px] border-2 border-[#D8D0C2] bg-[#FFFDF7] shadow-[4px_5px_0_#D8D0C2]">

        <textarea
          className="
            min-h-[220px]
            w-full
            resize-none
            border-0
            bg-transparent
            px-6
            py-6
            text-base
            leading-7
            text-[#14213D]
            outline-none
            placeholder:text-[#B0A9B3]
            focus:ring-0
            sm:px-8
            sm:py-8
          "
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isAnswered}
          rows={6}
        />

        {!isAnswered && (
          <div className="flex flex-col gap-4 border-t border-dashed border-[#DDD5C9] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">

            <p className="text-xs text-[#99929E]">
              Press{' '}
              <span className="font-bold text-[#6E6675]">
                Ctrl + Enter
              </span>{' '}
              to submit
            </p>

            <button
              className="
                group
                rounded-full
                border-2
                border-[#14213D]
                bg-[#5424C7]
                px-6
                py-3
                text-xs
                font-black
                text-white
                shadow-[3px_3px_0_#14213D]
                transition-all
                duration-200
                hover:-translate-y-0.5
                hover:shadow-[4px_4px_0_#14213D]
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
              onClick={handleSubmit}
              disabled={!answer.trim()}
            >
              Submit Answer
              <span className="ml-2 transition-transform group-hover:translate-x-1">
                →
              </span>
            </button>
          </div>
        )}

        {isAnswered && (
          <div className="border-t border-dashed border-[#DDD5C9] bg-[#F8F4EC] px-6 py-5 sm:px-8">

            <p className="mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-[#8E8793]">
              Your answer
            </p>

            <div className="text-sm leading-7 text-[#4D5360]">
              {answer}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
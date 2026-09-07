import { useState } from 'react'

export function ExplanationDropdown({
  isCorrect,
  correctAnswer,
  explanation,
  encouragement,
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = (event) => {
    setIsOpen(event.currentTarget.open)
  }

  return (
    <details
      className="group"
      onToggle={handleToggle}
    >
      <summary
        className={`flex cursor-pointer list-none items-center gap-3 select-none text-sm font-bold transition-colors ${
          isCorrect
            ? 'text-[#187A6D] hover:text-[#0F5D53]'
            : 'text-[#5424C7] hover:text-[#3F189E]'
        }`}
        aria-expanded={isOpen}
      >
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs transition-transform duration-300 group-open:rotate-180 ${
            isCorrect
              ? 'bg-[#D8F2EA]'
              : 'bg-[#E9DDFF]'
          }`}
        >
          ▾
        </span>

        <span>
          {isOpen ? 'Hide explanation' : 'See explanation'}
        </span>

        <span
          className={`ml-1 h-px flex-1 border-t border-dashed ${
            isCorrect ? 'border-[#A9DCCF]' : 'border-[#CFC1EA]'
          }`}
        />
      </summary>

      <div className="relative mt-5 pl-11">
        {/* Hand-drawn connector */}
        <svg
          className="pointer-events-none absolute left-3 top-0 h-full w-5 overflow-visible"
          viewBox="0 0 20 160"
          preserveAspectRatio="none"
          fill="none"
        >
          <path
            d="M10 0 C4 25 15 40 9 63 C3 88 15 105 9 135 C7 145 9 153 10 160"
            stroke={isCorrect ? '#2A9D8F' : '#8A68D8'}
            strokeWidth="1.5"
            strokeDasharray="4 5"
          />
        </svg>

        {!isCorrect && correctAnswer && (
          <div className="mb-6">
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#9A929B]">
              Correct answer
            </p>

            <p className="text-[15px] font-bold leading-6 text-[#302B37]">
              {correctAnswer}
            </p>
          </div>
        )}

        {explanation && (
          <div className="mb-6">
            {!isCorrect && (
              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#9A929B]">
                Why
              </p>
            )}

            <p className="max-w-2xl text-sm leading-7 text-[#625C66]">
              {explanation}
            </p>
          </div>
        )}

       
      </div>
    </details>
  )
}
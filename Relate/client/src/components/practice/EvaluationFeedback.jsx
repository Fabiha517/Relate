import { ExplanationDropdown } from './ExplanationDropdown'

export function EvaluationFeedback({
  isCorrect,
  userAnswer,
  correctAnswer,
  explanation,
  feedback,
  mappingLabel,
  encouragement,
  questionType = 'multiple-choice',
}) {
  return (
    <div
      className={`relative min-w-0 overflow-hidden rounded-[1.35rem] border px-4 py-4 sm:px-5 sm:py-4 ${
        isCorrect
          ? 'border-[#A9DCCF] bg-[#EFF9F5]'
          : 'border-[#F1C0B4] bg-[#FFF3EE]'
      }`}
    >
      {/* =========================================================
          SMALL DECORATIVE SKETCH
      ========================================================= */}

      <svg
        className="pointer-events-none absolute -right-7 -top-8 h-28 w-28 animate-[feedbackSpin_20s_linear_infinite] opacity-30"
        viewBox="0 0 140 140"
        fill="none"
      >
        <circle
          cx="70"
          cy="70"
          r="48"
          stroke={isCorrect ? '#2A9D8F' : '#E76F51'}
          strokeWidth="2"
          strokeDasharray="6 7"
        />

        <circle
          cx="70"
          cy="70"
          r="29"
          stroke={isCorrect ? '#F2B134' : '#5424C7'}
          strokeWidth="2"
        />

        <circle
          cx="116"
          cy="27"
          r="5"
          fill={isCorrect ? '#F2B134' : '#E76F51'}
        />
      </svg>

      {/* =========================================================
          RESULT HEADER
      ========================================================= */}

      <div className="relative flex items-start gap-3">

        <span
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-lg font-black ${
            isCorrect
              ? 'border-[#2A9D8F] bg-[#D8F2EA] text-[#187A6D]'
              : 'border-[#E76F51] bg-[#FFE0D6] text-[#C94F37]'
          }`}
        >
          {isCorrect ? '✓' : '✕'}
        </span>

        <div className="min-w-0 pr-10">
          <p
            className={`text-base font-black tracking-tight ${
              isCorrect ? 'text-[#187A6D]' : 'text-[#C94F37]'
            }`}
          >
            {isCorrect ? 'Correct ✓' : 'Not quite ✕'}
          </p>

          {feedback && (
            <p className="mt-0.5 text-xs leading-5 text-[#625C63]">
              {feedback}
            </p>
          )}
        </div>
      </div>

      {/* =========================================================
          ANSWER + EXPLANATION
      ========================================================= */}

      <div className="relative mt-4 grid gap-3 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:items-stretch">

        {/* =====================================================
            USER ANSWER
        ===================================================== */}

        <div className="min-w-0 rounded-xl border border-[#DDD4D8] bg-[#FFFDFC] px-4 py-3">

          <p className="mb-2 text-[9px] font-black uppercase tracking-[0.16em] text-[#8C858E]">
            Your answer
          </p>

          <div className="flex items-start gap-2">
            <span
              className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                isCorrect ? 'bg-[#2A9D8F]' : 'bg-[#E76F51]'
              }`}
            />

            <p
              className={`text-[14px] font-bold leading-5 ${
                isCorrect ? 'text-[#275F58]' : 'text-[#73483E]'
              }`}
            >
              {userAnswer || 'No answer provided'}
            </p>
          </div>

         
        </div>

        {/* =====================================================
            EXPLANATION
        ===================================================== */}

        <div className="min-w-0 rounded-xl border border-[#DDD4D8] bg-[#FFFDFC] px-4 py-3">

          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-[9px] font-black uppercase tracking-[0.16em] text-[#8C858E]">
              Why this works
            </p>

            <span className="h-2 w-2 rounded-full bg-[#5424C7]" />
          </div>

          <ExplanationDropdown
            isCorrect={isCorrect}
            correctAnswer={correctAnswer}
            explanation={explanation}
            encouragement={encouragement}
          />
        </div>
      </div>

      {/* =========================================================
          QUESTION TYPE
      ========================================================= */}

      {questionType && (
        <div className="relative mt-3 flex justify-end">
          <span className="text-[8px] font-black uppercase tracking-[0.14em] text-[#A099A0]">
            {questionType.replace(/-/g, ' ')}
          </span>
        </div>
      )}

      <style>{`
        @keyframes feedbackSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  )
}
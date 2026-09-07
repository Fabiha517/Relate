import { useState } from 'react'

import { MultipleChoiceInput } from './MultipleChoiceInput'
import { ShortAnswerInput } from './ShortAnswerInput'
import { EvaluationFeedback } from './EvaluationFeedback'

export function PracticeQuestion({
  question,
  questionNumber,
  totalQuestions,
  evaluation = null,
  isLoading = false,
  isAnswered = false,
  onSubmit,
  onNext,
  error = null,
  onRetry = null,
}) {
  const [userAnswer, setUserAnswer] = useState(null)

  const handleSubmitAnswer = (answer) => {
    setUserAnswer(answer)
    onSubmit(answer)
  }

  if (!question) {
    return (
      <div className="relative py-12 text-center text-[#14213D]">
        <div className="mx-auto max-w-md border-2 border-dashed border-[#D8D0C2] bg-[#FFFDF7]/60 p-10">
          No question available
        </div>
      </div>
    )
  }

  const isMultipleChoice =
    question.type === 'multiple-choice'

  const progress = Math.round(
    (questionNumber / totalQuestions) * 100
  )

  return (
    <div className="relative w-full text-[#14213D]">

      {/* =====================================================
          CANVAS DECORATION
          These sit directly on the page canvas.
          There is intentionally NO card/background here.
      ===================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-visible"
      >

        {/* left orbit */}
        <div className="absolute -left-3 top-[14%] hidden h-28 w-28 opacity-35 sm:block">
          <div className="absolute inset-0 rounded-full border border-dashed border-[#5424C7]" />

          <div className="absolute inset-4 rounded-full border border-[#E47B62]" />

          <span className="absolute right-0 top-5 h-2.5 w-2.5 rounded-full bg-[#FFD65A]" />
        </div>

        {/* top-right squiggle */}
        <svg
          className="absolute right-[3%] top-[7%] h-20 w-28 rotate-[-7deg] opacity-55"
          viewBox="0 0 120 80"
          fill="none"
        >
          <path
            d="M4 48C17 20 28 66 41 39C53 14 65 63 77 37C88 17 101 52 116 25"
            stroke="#E47B62"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>

        {/* constellation */}
        <svg
          className="absolute left-[42%] top-[2%] hidden h-20 w-44 opacity-35 md:block"
          viewBox="0 0 180 80"
          fill="none"
        >
          <path
            d="M8 58L54 18L102 43L151 10L173 53"
            stroke="#5424C7"
            strokeWidth="1.2"
            strokeDasharray="4 6"
          />

          <circle
            cx="8"
            cy="58"
            r="3"
            fill="#E47B62"
          />

          <circle
            cx="54"
            cy="18"
            r="3"
            fill="#FFD65A"
          />

          <circle
            cx="102"
            cy="43"
            r="3"
            fill="#4E9EA0"
          />

          <circle
            cx="151"
            cy="10"
            r="3"
            fill="#E47B62"
          />

          <circle
            cx="173"
            cy="53"
            r="3"
            fill="#5424C7"
          />
        </svg>

        {/* left triangle */}
        <svg
          className="absolute left-[5%] top-[42%] h-12 w-12 rotate-12 opacity-45"
          viewBox="0 0 50 50"
          fill="none"
        >
          <path
            d="M25 4L47 43H4L25 4Z"
            stroke="#2A9D8F"
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        </svg>

        {/* right star */}
        <svg
          className="absolute right-[4%] bottom-[15%] h-10 w-10 rotate-12 opacity-45"
          viewBox="0 0 50 50"
          fill="none"
        >
          <path
            d="M25 3L30 19L47 25L30 30L25 47L20 30L3 25L20 19L25 3Z"
            stroke="#5424C7"
            strokeWidth="2"
          />
        </svg>

        {/* floating dots */}
        <span className="absolute left-[23%] top-[20%] h-2 w-2 rounded-full bg-[#E47B62] opacity-65" />

        <span className="absolute right-[23%] top-[38%] h-2.5 w-2.5 rounded-full bg-[#2A9D8F] opacity-65" />

        <span className="absolute left-[15%] bottom-[12%] h-2 w-2 rounded-full bg-[#5424C7] opacity-45" />

        <span className="absolute right-[10%] top-[53%] h-2 w-2 rounded-full bg-[#FFD65A] opacity-80" />

        {/* plus */}
        <span className="absolute right-[14%] bottom-[32%] text-2xl font-light text-[#F0A23A]/60">
          +
        </span>

      </div>

      {/* =====================================================
          CONTENT
          Directly on the canvas
      ===================================================== */}

      <div className="relative z-10">

        {/* ===================================================
            HEADER / PROGRESS
        =================================================== */}

        <div className="mb-10">

          <div className="mb-3 flex items-center justify-between gap-4">

            <div className="flex items-center gap-3">

              <span className="rotate-[-2deg] rounded-full border-2 border-[#5424C7] bg-[#EEE7FF] px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#5424C7]">
                Practice
              </span>

              <span className="hidden text-[10px] font-bold uppercase tracking-[0.14em] text-[#9A949F] sm:inline">
                Think • connect • remember
              </span>

            </div>

            <span className="rounded-full bg-[#FFFDF7]/70 px-3 py-1 text-xs font-black text-[#858B97]">
              {questionNumber} / {totalQuestions}
            </span>

          </div>

          {/* progress */}
          <div className="relative h-2.5 overflow-visible rounded-full bg-[#E4DED5]">

            <div
              className="absolute inset-y-0 left-0 rounded-full bg-[#5424C7] transition-all duration-500"
              style={{
                width: `${progress}%`,
              }}
            />

            <div
              className="absolute -top-[4px] h-[18px] w-[18px] rounded-full border-2 border-[#14213D] bg-[#FFD65A] shadow-[1px_2px_0_#14213D] transition-all duration-500"
              style={{
                left: `calc(${progress}% - 9px)`,
              }}
            />

          </div>
        </div>

        {/* ===================================================
            QUESTION
        =================================================== */}

        <section className="relative mb-9">

          <div className="mb-3 flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-[#4E9EA0]" />

            <p className="text-[10px] font-black uppercase tracking-[0.17em] text-[#8C8691]">
              Think it through
            </p>

          </div>

          <h2 className="max-w-5xl text-3xl font-black leading-[1.08] tracking-[-0.04em] text-[#14213D] sm:text-4xl lg:text-[2.9rem]">
            {question.text}
          </h2>

          <svg
            aria-hidden="true"
            className="mt-4 h-4 w-44 text-[#F0A23A]"
            viewBox="0 0 220 20"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M3 12C45 4 85 18 122 9C155 2 184 6 217 10"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>

        </section>

        {/* ===================================================
            ANSWER AREA
            NO OUTER CARD
        =================================================== */}

        <div className="relative">

          {isLoading ? (

            <div className="relative flex min-h-[220px] flex-col items-center justify-center border-t border-[#D8D0C2] bg-transparent py-12">

              <div className="relative h-16 w-16">

                <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-[#DDD5EA] border-t-[#5424C7]" />

                <div className="absolute inset-3 flex items-center justify-center rounded-full bg-[#EEE7FF] text-lg text-[#5424C7]">
                  ✦
                </div>

              </div>

              <p className="mt-5 text-sm font-black text-[#5424C7]">
                Evaluating your connection…
              </p>

              <p className="mt-1.5 text-xs text-[#9A949F]">
                Give us a moment.
              </p>

            </div>

          ) : isAnswered && evaluation ? (

            /*
             * IMPORTANT:
             * EvaluationFeedback is no longer wrapped
             * inside another rounded card.
             */
            <div className="relative">
              <EvaluationFeedback
                isCorrect={evaluation.correct}
                userAnswer={userAnswer}
                correctAnswer={evaluation.correctAnswer}
                explanation={evaluation.explanation}
                mappingLabel={evaluation.mappingLabel}
                encouragement={evaluation.encouragement}
                questionType={question.type}
              />
            </div>

          ) : (

            <div className="relative">

              {isMultipleChoice ? (

                <MultipleChoiceInput
                  options={
                    question.options || []
                  }
                  onSubmit={
                    handleSubmitAnswer
                  }
                  isAnswered={false}
                />

              ) : (

                <ShortAnswerInput
                  onSubmit={
                    handleSubmitAnswer
                  }
                  isAnswered={false}
                />

              )}

            </div>
          )}

          {/* =================================================
              ERROR
          ================================================= */}

          {error && (
            <div className="mt-6 border-l-4 border-[#E47B62] bg-[#FBE7E1]/75 p-4">

              <p className="text-sm font-semibold leading-6 text-[#A84F40]">
                {error}
              </p>

              {onRetry && (
                <button
                  className="mt-3 rounded-full bg-[#E47B62] px-5 py-2.5 text-xs font-black text-white transition-all hover:-translate-y-0.5 hover:bg-[#C96250]"
                  onClick={onRetry}
                >
                  Try Again
                </button>
              )}

            </div>
          )}

        </div>

        {/* ===================================================
            NEXT
        =================================================== */}

        {isAnswered &&
          evaluation &&
          !isLoading && (

            <div className="mt-7 flex justify-end">

              <button
                className="
                  group
                  relative
                  overflow-hidden
                  rounded-full
                  border-2
                  border-[#14213D]
                  bg-[#5424C7]
                  px-6
                  py-3
                  text-sm
                  font-black
                  text-white
                  shadow-[3px_4px_0_#14213D]
                  transition-all
                  duration-200
                  hover:-translate-y-1
                  hover:shadow-[4px_5px_0_#14213D]
                "
                onClick={onNext}
              >
                Continue

                <span className="ml-2 transition-transform group-hover:translate-x-1">
                  →
                </span>

                <span className="absolute -right-5 -top-5 h-12 w-12 rounded-full bg-[#FFD65A]/30 transition-transform group-hover:scale-150" />

              </button>

            </div>
          )}

      </div>
    </div>
  )
}
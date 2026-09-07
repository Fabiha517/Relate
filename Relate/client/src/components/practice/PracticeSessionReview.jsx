import { EvaluationFeedback } from './EvaluationFeedback'

export default function PracticeSessionReview({
  session,
  analogyId,
  onPracticeAgain,
  onGenerateMoreQuestions,
}) {
  const {
    questions = [],
    answers = [],
    evaluations = [],
    score = 0,
  } = session || {}

  if (!questions || questions.length === 0) {
    return (
      <div className="relative overflow-hidden rounded-[28px] border-2 border-dashed border-[#D8D0C2] bg-[#FFFDF7] px-6 py-16 text-center shadow-[3px_4px_0_#D8D0C2]">

        <svg
          aria-hidden="true"
          className="pointer-events-none absolute -left-5 -top-6 h-24 w-24 opacity-40"
          viewBox="0 0 100 100"
          fill="none"
        >
          <circle
            cx="50"
            cy="50"
            r="35"
            stroke="#5424C7"
            strokeWidth="1.5"
            strokeDasharray="4 7"
          />
          <circle
            cx="20"
            cy="34"
            r="4"
            fill="#FFD65A"
          />
        </svg>

        <svg
          aria-hidden="true"
          className="pointer-events-none absolute -right-3 bottom-0 h-28 w-28 opacity-40"
          viewBox="0 0 120 120"
          fill="none"
        >
          <path
            d="M10 82C35 32 58 94 79 49C92 22 103 46 113 18"
            stroke="#E47B62"
            strokeWidth="2"
            strokeDasharray="3 6"
          />
        </svg>

        <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 border-[#5424C7] bg-[#EEE7FF] text-2xl text-[#5424C7] shadow-[3px_3px_0_#D8D0C2]">
          ✦
        </div>

        <p className="relative text-lg font-black text-[#14213D]">
          No questions in this session.
        </p>
      </div>
    )
  }

  const correctCount = evaluations.filter(
    (e) => e?.correct
  ).length

  return (
    <div className="relative isolate w-full">

      {/* =====================================================
          FLOATING CANVAS DECOR
      ===================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-visible"
      >

        {/* Top-left orbit */}
        <svg
          viewBox="0 0 180 180"
          className="absolute -left-16 -top-12 h-40 w-40 opacity-45 animate-[reviewOrbit_24s_linear_infinite]"
          fill="none"
        >
          <circle
            cx="90"
            cy="90"
            r="62"
            stroke="#5424C7"
            strokeWidth="1.5"
            strokeDasharray="5 8"
          />
          <circle
            cx="90"
            cy="90"
            r="40"
            stroke="#E47B62"
            strokeWidth="1"
            strokeDasharray="2 8"
          />
          <circle
            cx="29"
            cy="72"
            r="5"
            fill="#FFD65A"
          />
          <circle
            cx="145"
            cy="45"
            r="4"
            fill="#4E9EA0"
          />
        </svg>

        {/* Top constellation */}
        <svg
          viewBox="0 0 260 120"
          className="absolute left-[34%] top-[-20px] h-24 w-52 opacity-50 animate-[reviewFloat_9s_ease-in-out_infinite]"
          fill="none"
        >
          <path
            d="M10 73L55 30L108 63L158 23L238 58"
            stroke="#B8AFBF"
            strokeWidth="1"
            strokeDasharray="4 8"
          />

          <path
            d="M55 30L82 102L108 63"
            stroke="#B8AFBF"
            strokeWidth="1"
            strokeDasharray="3 7"
          />

          <circle cx="10" cy="73" r="3" fill="#E47B62" />
          <circle cx="55" cy="30" r="5" fill="#FFD65A" />
          <circle cx="108" cy="63" r="4" fill="#4E9EA0" />
          <circle cx="158" cy="23" r="5" fill="#5424C7" />
          <circle cx="238" cy="58" r="3" fill="#E47B62" />
          <circle cx="82" cy="102" r="3" fill="#5424C7" />
        </svg>

        {/* Top-right orbit */}
        <svg
          viewBox="0 0 180 180"
          className="absolute -right-14 -top-8 h-40 w-40 opacity-40 animate-[reviewOrbitReverse_28s_linear_infinite]"
          fill="none"
        >
          <circle
            cx="90"
            cy="90"
            r="67"
            stroke="#4E9EA0"
            strokeWidth="1.5"
            strokeDasharray="6 9"
          />
          <circle
            cx="90"
            cy="90"
            r="43"
            stroke="#5424C7"
            strokeWidth="1"
            strokeDasharray="3 7"
          />
          <circle
            cx="145"
            cy="48"
            r="5"
            fill="#FFD65A"
          />
        </svg>

        {/* Left squiggle */}
        <svg
          viewBox="0 0 90 220"
          className="absolute -left-1 top-[27%] h-48 w-20 opacity-45 animate-[reviewFloatReverse_10s_ease-in-out_infinite]"
          fill="none"
        >
          <path
            d="M43 7C8 30 76 51 32 80C2 100 72 121 29 150C10 164 25 191 64 212"
            stroke="#E47B62"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="3 7"
          />
          <circle
            cx="43"
            cy="7"
            r="4"
            fill="#FFD65A"
          />
        </svg>

        {/* Right squiggle */}
        <svg
          viewBox="0 0 90 220"
          className="absolute -right-1 top-[46%] h-48 w-20 opacity-40 animate-[reviewFloat_11s_ease-in-out_infinite]"
          fill="none"
        >
          <path
            d="M48 8C82 30 16 53 60 82C90 102 19 125 62 151C80 164 67 191 30 211"
            stroke="#5424C7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="4 8"
          />
          <circle
            cx="48"
            cy="8"
            r="4"
            fill="#4E9EA0"
          />
        </svg>

        {/* Floating star */}
        <svg
          viewBox="0 0 60 60"
          className="absolute left-[6%] top-[44%] h-9 w-9 opacity-60 animate-[reviewTwinkle_4s_ease-in-out_infinite]"
          fill="none"
        >
          <path
            d="M30 4L35 23L55 30L35 36L30 56L25 36L5 30L25 23L30 4Z"
            stroke="#F0A23A"
            strokeWidth="2"
          />
        </svg>

        {/* Triangle */}
        <svg
          viewBox="0 0 80 80"
          className="absolute right-[7%] top-[57%] h-11 w-11 opacity-50 animate-[reviewTriangle_8s_ease-in-out_infinite]"
          fill="none"
        >
          <path
            d="M40 7L73 66H7L40 7Z"
            stroke="#4E9EA0"
            strokeWidth="2"
            strokeDasharray="4 5"
          />
          <circle
            cx="40"
            cy="40"
            r="4"
            fill="#FFD65A"
          />
        </svg>

        {/* Plus */}
        <span className="absolute left-[14%] top-[67%] text-2xl font-light text-[#4E9EA0] animate-[reviewTwinkle_6s_ease-in-out_infinite]">
          +
        </span>

        <span className="absolute right-[17%] top-[76%] text-2xl font-light text-[#E47B62] animate-[reviewTwinkle_7s_ease-in-out_infinite_1s]">
          +
        </span>

        {/* Dot clusters */}
        <div className="absolute left-[8%] top-[77%] flex gap-2 animate-[reviewFloat_8s_ease-in-out_infinite]">
          <span className="h-2 w-2 rounded-full bg-[#5424C7]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#FFD65A]" />
          <span className="h-2 w-2 rounded-full bg-[#4E9EA0]" />
        </div>

        <div className="absolute right-[9%] top-[84%] flex gap-2 animate-[reviewFloatReverse_9s_ease-in-out_infinite]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E47B62]" />
          <span className="h-2 w-2 rounded-full bg-[#5424C7]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#FFD65A]" />
        </div>
      </div>

      {/* =====================================================
          SCORE HERO
      ===================================================== */}

      <section className="relative mb-9 overflow-hidden rounded-[26px] border-2 border-[#D8D0C2] bg-[#FFFDF7] px-5 py-5 shadow-[4px_5px_0_#D8D0C2] sm:px-7 sm:py-6">

        {/* Hero decoration */}
        <svg
          aria-hidden="true"
          viewBox="0 0 220 220"
          className="absolute -left-14 -top-16 h-48 w-48 opacity-35 animate-[reviewOrbit_30s_linear_infinite]"
          fill="none"
        >
          <circle
            cx="110"
            cy="110"
            r="82"
            stroke="#5424C7"
            strokeWidth="1.5"
            strokeDasharray="5 9"
          />
          <circle
            cx="110"
            cy="110"
            r="57"
            stroke="#E47B62"
            strokeWidth="1.5"
            strokeDasharray="2 8"
          />
          <circle
            cx="39"
            cy="72"
            r="5"
            fill="#FFD65A"
          />
        </svg>

        <svg
          aria-hidden="true"
          viewBox="0 0 150 150"
          className="absolute -right-8 -top-10 h-36 w-36 opacity-35 animate-[reviewOrbitReverse_25s_linear_infinite]"
          fill="none"
        >
          <circle
            cx="75"
            cy="75"
            r="57"
            stroke="#4E9EA0"
            strokeWidth="1.5"
            strokeDasharray="6 9"
          />
          <circle
            cx="75"
            cy="75"
            r="38"
            stroke="#5424C7"
            strokeWidth="1"
            strokeDasharray="3 7"
          />
        </svg>

        <div className="absolute -bottom-10 left-[30%] h-20 w-20 rounded-full bg-[#FFD65A]/35" />

        <div className="relative flex items-center justify-between gap-6">

          <div className="min-w-0">
            <p className="mb-1 text-[9px] font-black uppercase tracking-[0.18em] text-[#8D8793]">
              Your understanding
            </p>

            <h2 className="max-w-xl text-2xl font-black leading-[1.08] tracking-[-0.045em] text-[#14213D] sm:text-3xl">
              Here's how the
              <span className="text-[#5424C7]">
                {' '}connection held up.
              </span>
            </h2>

            <p className="mt-2 text-[11px] text-[#858B97]">
              {correctCount} of {questions.length} correct
            </p>
          </div>

          {/* Score */}
          <div className="relative flex h-[88px] w-[88px] shrink-0 items-center justify-center sm:h-[98px] sm:w-[98px]">

            <svg
              className="absolute inset-0 h-full w-full -rotate-90"
              viewBox="0 0 140 140"
              fill="none"
            >
              <circle
                cx="70"
                cy="70"
                r="57"
                stroke="#E8E1D8"
                strokeWidth="8"
              />

              <circle
                cx="70"
                cy="70"
                r="57"
                stroke="#5424C7"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray="358"
                strokeDashoffset={
                  358 - (358 * Number(score || 0)) / 100
                }
                className="transition-all duration-1000"
              />
            </svg>

            <div className="relative text-center">
              <div className="text-2xl font-black tracking-[-0.05em] text-[#14213D] sm:text-3xl">
                {score}%
              </div>

              <div className="text-[7px] font-black uppercase tracking-[0.15em] text-[#928B98]">
                score
              </div>
            </div>

            <svg
              className="absolute -right-4 -top-3 h-8 w-8 rotate-12 text-[#F0A23A] animate-[reviewTwinkle_4s_ease-in-out_infinite]"
              viewBox="0 0 40 40"
              fill="none"
            >
              <path
                d="M20 3L23 15L37 20L23 24L20 37L16 24L3 20L16 15L20 3Z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* =====================================================
          SESSION HEADER
      ===================================================== */}

      <section className="relative">

        <div className="mb-5 flex items-end justify-between px-1">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#4E9EA0]" />

              <span className="text-[9px] font-black uppercase tracking-[0.17em] text-[#858B97]">
                Session trail
              </span>
            </div>

            <h2 className="text-xl font-black tracking-[-0.04em] text-[#14213D] sm:text-2xl">
              Let's retrace it.
            </h2>
          </div>

          <span className="hidden text-[10px] font-medium text-[#9A949F] sm:block">
            {questions.length} questions
          </span>
        </div>

        {/* ===================================================
            LEARNING PATH
        =================================================== */}

        <div className="relative">

          {/* CONTINUOUS PURPLE SPINE */}
          <div
            aria-hidden="true"
            className="absolute bottom-8 left-[20px] top-4 z-0 w-px border-l border-dashed border-[#5424C7]/40 sm:left-1/2 sm:-translate-x-1/2"
          />

          {/* Path nodes */}
          <div
            aria-hidden="true"
            className="absolute left-[17px] top-[17%] z-0 h-2 w-2 rounded-full bg-[#FFD65A] sm:left-1/2 sm:-translate-x-1/2"
          />

          <div
            aria-hidden="true"
            className="absolute bottom-[17%] left-[17px] z-0 h-2 w-2 rounded-full bg-[#5424C7] sm:left-1/2 sm:-translate-x-1/2"
          />

          <div className="space-y-8 sm:space-y-10">

            {questions.map((question, idx) => {

              const evaluation = evaluations[idx]

              // Answers are stored as:
              // { questionIndex, userAnswer }

              const answerEntry = answers[idx]

              const userAnswer =
                typeof answerEntry === 'object'
                  ? answerEntry?.userAnswer
                  : answerEntry

              const isCorrect = evaluation?.correct

              return (
                <div
                  key={idx}
                  className="relative min-h-0 pl-10 sm:min-h-[190px] sm:pl-0"
                >

                  {/* =================================================
                      NUMBERED PATH NODE
                  ================================================= */}

                  <div
                    className={`
                      absolute left-[6px] top-5 z-30
                      flex h-[30px] w-[30px]
                      items-center justify-center
                      rounded-full
                      border-[3px]
                      border-[#F7F0E3]
                      shadow-[0_0_0_1px_#5424C7]
                      ${
                        isCorrect
                          ? 'bg-[#4E9EA0]'
                          : 'bg-[#E47B62]'
                      }
                      sm:left-1/2
                      sm:-translate-x-1/2
                    `}
                  >
                    <span className="text-[9px] font-black text-white">
                      {idx + 1}
                    </span>
                  </div>

                  {/* Decorative connector */}
                  {idx % 2 === 0 ? (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 100 50"
                      className="absolute left-[10%] top-1 hidden h-10 w-24 opacity-45 animate-[reviewFloat_7s_ease-in-out_infinite] sm:block"
                      fill="none"
                    >
                      <path
                        d="M5 30C24 5 40 41 56 18C69 0 80 25 95 10"
                        stroke="#E47B62"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeDasharray="3 6"
                      />
                      <circle
                        cx="8"
                        cy="30"
                        r="3"
                        fill="#FFD65A"
                      />
                    </svg>
                  ) : (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 100 50"
                      className="absolute right-[10%] top-1 hidden h-10 w-24 opacity-45 animate-[reviewFloatReverse_8s_ease-in-out_infinite] sm:block"
                      fill="none"
                    >
                      <path
                        d="M5 10C24 34 40 3 56 27C69 45 80 25 95 37"
                        stroke="#4E9EA0"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeDasharray="3 6"
                      />
                      <circle
                        cx="92"
                        cy="37"
                        r="3"
                        fill="#5424C7"
                      />
                    </svg>
                  )}

                  {/* =================================================
                      CARD
                  ================================================= */}

                  <article
                    className={`
                      relative z-10
                      w-full
                      overflow-hidden
                      rounded-[22px]
                      border-2
                      border-[#D8D0C2]
                      bg-[#FFFDF7]
                      shadow-[3px_4px_0_#D8D0C2]
                      transition-all
                      duration-300
                      hover:-translate-y-1
                      hover:shadow-[5px_6px_0_#C8C0D4]
                      sm:w-[76%]
                      ${
                        idx % 2 === 0
                          ? 'sm:mr-auto sm:ml-[3%]'
                          : 'sm:ml-auto sm:mr-[3%]'
                      }
                    `}
                  >

                    {/* Status strip */}
                    <div
                      className={`
                        h-1.5
                        ${
                          isCorrect
                            ? 'bg-[#4E9EA0]'
                            : 'bg-[#E47B62]'
                        }
                      `}
                    />

                    <div className="px-4 py-4 sm:px-5 sm:py-5">

                      {/* Question header */}
                      <div className="mb-4 flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <span className="inline-flex rounded-full bg-[#F2EEE7] px-2.5 py-1 text-[8px] font-black uppercase tracking-[0.13em] text-[#8D8792]">
                            Question {idx + 1}
                          </span>

                          <h3 className="mt-2 max-w-2xl text-[15px] font-black leading-[1.2] tracking-[-0.025em] text-[#14213D] sm:text-base">
                            {question.text}
                          </h3>
                        </div>

                        <div
                          className={`
                            mt-0.5 shrink-0
                            rounded-full
                            px-2 py-1
                            text-[7px]
                            font-black
                            uppercase
                            tracking-[0.1em]
                            ${
                              isCorrect
                                ? 'bg-[#D8F1EE] text-[#327C7C]'
                                : 'bg-[#FBE0D9] text-[#B85C49]'
                            }
                          `}
                        >
                          {isCorrect
                            ? 'Connected'
                            : 'Needs another look'}
                        </div>
                      </div>

                      {/* Evaluation */}
                      {evaluation && (
                        <div className="relative">

                          <div
                            aria-hidden="true"
                            className="absolute -left-1.5 top-0 h-full border-l border-dashed border-[#DDD5C9]"
                          />

                          <div className="pl-3">

                            <EvaluationFeedback
                              isCorrect={evaluation.correct}
                              userAnswer={userAnswer}
                              correctAnswer={evaluation.correctAnswer}
                              explanation={evaluation.explanation}
                              feedback={evaluation.feedback}
                              mappingLabel={evaluation.mappingLabel}
                              encouragement={evaluation.encouragement}
                              questionType={question.type}
                            />

                          </div>
                        </div>
                      )}

                      {/* Tiny bottom trail */}
                      <div className="mt-4 flex justify-end gap-1 opacity-50">
                        <span className="h-1 w-1 rounded-full bg-[#5424C7]" />
                        <span className="h-1.5 w-1.5 rounded-full bg-[#FFD65A]" />
                        <span className="h-1 w-1 rounded-full bg-[#4E9EA0]" />
                      </div>
                    </div>
                  </article>

                  {/* Bottom decoration */}
                  {idx % 2 === 0 ? (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 130 60"
                      className="absolute -bottom-7 right-[8%] h-10 w-24 opacity-40 animate-[reviewFloatReverse_9s_ease-in-out_infinite]"
                      fill="none"
                    >
                      <path
                        d="M5 40C27 12 44 52 63 26C77 7 96 40 125 14"
                        stroke="#4E9EA0"
                        strokeWidth="1.7"
                        strokeLinecap="round"
                        strokeDasharray="3 6"
                      />
                    </svg>
                  ) : (
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 60 60"
                      className="absolute -bottom-6 left-[9%] h-8 w-8 opacity-50 animate-[reviewTwinkle_5s_ease-in-out_infinite]"
                      fill="none"
                    >
                      <path
                        d="M30 4L35 23L55 30L35 36L30 56L25 36L5 30L25 23L30 4Z"
                        stroke="#F0A23A"
                        strokeWidth="2"
                      />
                    </svg>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* =====================================================
          BOTTOM FINISH
      ===================================================== */}

      <div
        aria-hidden="true"
        className="relative mt-10 flex justify-center"
      >
        <svg
          viewBox="0 0 520 100"
          className="h-20 w-[420px] opacity-35 animate-[reviewFloat_10s_ease-in-out_infinite]"
          fill="none"
        >
          <path
            d="M15 60C75 12 115 78 170 43C225 8 270 70 325 40C375 12 420 68 505 22"
            stroke="#5424C7"
            strokeWidth="1.5"
            strokeDasharray="5 9"
          />

          <circle
            cx="78"
            cy="39"
            r="4"
            fill="#FFD65A"
          />

          <circle
            cx="270"
            cy="55"
            r="4"
            fill="#4E9EA0"
          />

          <circle
            cx="421"
            cy="48"
            r="4"
            fill="#E47B62"
          />
        </svg>
      </div>

      {/* =====================================================
          ANIMATIONS
      ===================================================== */}

      <style>{`
        @keyframes reviewFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(0, -8px, 0);
          }
        }

        @keyframes reviewFloatReverse {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }

          50% {
            transform: translate3d(7px, 6px, 0);
          }
        }

        @keyframes reviewOrbit {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes reviewOrbitReverse {
          from {
            transform: rotate(360deg);
          }

          to {
            transform: rotate(0deg);
          }
        }

        @keyframes reviewTriangle {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }

          50% {
            transform: translate3d(5px, -7px, 0) rotate(6deg);
          }
        }

        @keyframes reviewTwinkle {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.92);
          }

          50% {
            opacity: 0.85;
            transform: scale(1.08);
          }
        }
      `}</style>
    </div>
  )
}
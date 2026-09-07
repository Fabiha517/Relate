export function PracticeSessionSummary({
  totalQuestions,
  correctCount,
  score,
  evaluations,
  onPracticeAgain,
  onGenerateMore,
  isGeneratingMore = false,
}) {
  /* =========================================================
     GET INCORRECT ANSWERS
  ========================================================= */

  const incorrectItems = evaluations
    .map((evaluation, idx) => ({
      index: idx,
      ...evaluation,
    }))
    .filter((item) => !item.correct)

  /* =========================================================
     SCORE DESCRIPTOR
  ========================================================= */

  const getScoreDescriptor = (score) => {
    if (score === 100) return 'Perfect! 🎉'
    if (score >= 80) return 'Excellent work'
    if (score >= 60) return 'Good understanding'
    if (score >= 40) return 'Keep practicing'
    return 'Worth another look'
  }

  return (
    <div className="relative overflow-hidden bg-[#F7F0E3] text-[#14213D]">

      {/* =====================================================
          OPEN CANVAS DECORATIONS
      ===================================================== */}
<div className="absolute -top-20 -left-20 w-48 h-48 bg-yellow-300 rounded-full opacity-25 blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-700 rounded-full opacity-20 blur-3xl"></div>
      <div className=" pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl "/>
      <div className=" pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl "/>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >

        {/* soft color fields */}

        <div className="absolute -left-32 top-16 h-64 w-64 rounded-full bg-[#FFD65A]/20 blur-3xl" />

        <div className="absolute -right-28 top-40 h-72 w-72 rounded-full bg-[#8DD8D0]/20 blur-3xl" />

        <div className="absolute bottom-[-120px] left-[38%] h-72 w-72 rounded-full bg-[#B9A7F5]/15 blur-3xl" />


        {/* left orbit */}

        <div className="absolute -left-12 top-32 h-36 w-36 rounded-full border-2 border-dashed border-[#5424C7]/20 rotate-12" />

        <div className="absolute left-0 top-40 h-20 w-20 rounded-full border-2 border-[#E47B62]/25" />


        {/* right orbit */}

        <div className="absolute right-[-20px] top-24 hidden h-36 w-36 rounded-full border-2 border-dashed border-[#4E9EA0]/30 sm:block" />

        <div className="absolute right-8 top-32 hidden h-16 w-16 rounded-full border-[7px] border-[#FFD65A]/40 sm:block" />


        {/* top constellation */}

        <svg
          className="absolute left-1/2 top-4 hidden h-24 w-40 -translate-x-1/2 text-[#5424C7]/35 sm:block"
          viewBox="0 0 160 90"
          fill="none"
        >
          <path
            d="M8 65L42 25L78 48L115 16L151 57"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />

          <circle cx="8" cy="65" r="4" fill="#E47B62" />
          <circle cx="42" cy="25" r="4" fill="#5424C7" />
          <circle cx="78" cy="48" r="4" fill="#FFD65A" />
          <circle cx="115" cy="16" r="4" fill="#4E9EA0" />
          <circle cx="151" cy="57" r="4" fill="#E47B62" />
        </svg>


        {/* star */}

        <svg
          className="absolute right-[16%] top-16 h-9 w-9 rotate-12 text-[#F0A23A]"
          viewBox="0 0 40 40"
          fill="none"
        >
          <path
            d="M20 3L23 15L37 20L23 24L20 37L16 24L3 20L16 15L20 3Z"
            stroke="currentColor"
            strokeWidth="2"
          />
        </svg>


        {/* left zigzag */}

        <svg
          className="absolute left-4 top-[42%] h-24 w-10 text-[#E47B62]/35"
          viewBox="0 0 40 100"
          fill="none"
        >
          <path
            d="M5 5L30 20L7 38L32 55L8 73L30 92"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>


        {/* floating dots */}

        <span className="absolute left-[17%] top-[24%] h-2 w-2 rounded-full bg-[#E47B62]/60" />

        <span className="absolute right-[24%] top-[30%] h-2.5 w-2.5 rounded-full bg-[#FFD65A]/80" />

        <span className="absolute right-[13%] top-[55%] h-2 w-2 rounded-full bg-[#5424C7]/35" />

        <span className="absolute left-[12%] bottom-[25%] h-2.5 w-2.5 rounded-full bg-[#4E9EA0]/45" />


        {/* plus marks */}

        <span className="absolute left-[9%] top-[53%] text-2xl font-light text-[#4E9EA0]/40">
          +
        </span>

        <span className="absolute right-[8%] top-[44%] text-2xl font-light text-[#5424C7]/25">
          +
        </span>


        {/* small triangle */}

        <span className="absolute right-[28%] bottom-[17%] rotate-12 text-3xl text-[#E47B62]/35">
          △
        </span>

      </div>


      {/* =====================================================
          MAIN OPEN CANVAS
      ===================================================== */}

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-14 pt-6 sm:px-8 sm:pb-20 lg:px-12">


        {/* ===================================================
            PAGE LABEL
        =================================================== */}

        <div className="mb-8 flex items-center gap-3">

          <span className="h-2.5 w-2.5 rounded-full bg-[#5424C7]" />

          <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8D8792]">
            Practice recap
          </span>

          <span className="h-px w-10 bg-[#CFC6D9]" />

          <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#AAA3AD]">
            Session complete
          </span>

        </div>


        {/* ===================================================
            SCORE — OPEN CANVAS, NOT A CARD
        =================================================== */}

        <section className="relative mb-14">

          {/* hand-drawn corner decoration */}

          <div
            aria-hidden="true"
            className="absolute -right-4 -top-7 h-20 w-20 rounded-full border-[9px] border-[#FFD65A]/45 sm:right-4"
          />

          <div
            aria-hidden="true"
            className="absolute -bottom-7 left-[20%] h-12 w-12 rounded-full border-2 border-dashed border-[#4E9EA0]/40"
          />


          <div className="relative grid items-center gap-9 md:grid-cols-[auto_1fr] md:gap-12">


            {/* =================================================
                SCORE CIRCLE
            ================================================= */}

            <div className="relative mx-auto flex h-40 w-40 shrink-0 items-center justify-center sm:h-48 sm:w-48">

              {/* outer hand-drawn orbit */}

              <div
                aria-hidden="true"
                className="absolute inset-[-9px] rounded-full border border-dashed border-[#CFC6D9]"
              />

              <svg
                className="absolute inset-0 h-full w-full -rotate-90"
                viewBox="0 0 180 180"
                fill="none"
              >

                <circle
                  cx="90"
                  cy="90"
                  r="73"
                  stroke="#E1DBD2"
                  strokeWidth="9"
                />

                <circle
                  cx="90"
                  cy="90"
                  r="73"
                  stroke="#5424C7"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray="459"
                  strokeDashoffset={
                    459 - (459 * Number(score || 0)) / 100
                  }
                />

              </svg>


              <div className="relative text-center">

                <div className="text-5xl font-black tracking-[-0.07em] text-[#14213D] sm:text-6xl">
                  {score}%
                </div>

                <div className="mt-1 text-[9px] font-black uppercase tracking-[0.18em] text-[#928B98]">
                  understanding
                </div>

              </div>


              {/* decorative star */}

              <span className="absolute -right-3 top-3 rotate-12 text-xl text-[#F0A23A]">
                ✦
              </span>

              {/* decorative plus */}

              <span className="absolute bottom-1 left-[-5px] text-xl text-[#4E9EA0]">
                +
              </span>

            </div>


            {/* =================================================
                SCORE COPY
            ================================================= */}

            <div className="text-center md:text-left">

              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#858B97]">
                Practice complete
              </p>

              <h2 className="text-4xl font-black leading-[0.95] tracking-[-0.055em] text-[#14213D] sm:text-5xl lg:text-6xl">
                {getScoreDescriptor(score)}
              </h2>


              <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 md:justify-start">

                <span className="rounded-full border-2 border-[#D8D0C2] bg-[#FFFDF7]/80 px-4 py-2 text-xs font-bold text-[#5D5664]">
                  {correctCount} of {totalQuestions} correct
                </span>

                <span className="rounded-full border-2 border-[#B9DDD8] bg-[#E5F5F2]/80 px-4 py-2 text-xs font-bold text-[#327C7C]">
                  {score}% understood
                </span>

              </div>


              {/* hand drawn underline */}

              <svg
                className="mx-auto mt-5 h-3 w-40 text-[#FFD65A] md:mx-0"
                viewBox="0 0 150 12"
                fill="none"
              >
                <path
                  d="M3 7C30 2 65 11 95 5C116 1 134 5 147 3"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>


              <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-[#68707D] md:mx-0">
                You worked through {totalQuestions} questions and got{' '}
                {correctCount} right. Here is where your understanding
                held up — and where another pass could help.
              </p>

            </div>

          </div>

        </section>


        {/* ===================================================
            TRICKY QUESTIONS
        =================================================== */}

        {incorrectItems.length > 0 && (
          <section className="relative mb-12">

            <div className="mb-6 flex items-end justify-between gap-4">

              <div>

                <p className="text-[9px] font-black uppercase tracking-[0.15em] text-[#8D8792]">
                  Tiny detours
                </p>

                <h3 className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#14213D] sm:text-3xl">
                  Let's untangle the tricky ones.
                </h3>

              </div>


              <div
                aria-hidden="true"
                className="hidden h-9 w-9 rotate-12 rounded-full border-2 border-dashed border-[#E47B62]/50 sm:block"
              />

            </div>


            <div className="relative space-y-4">

              {/* timeline */}

              <div
                aria-hidden="true"
                className="absolute bottom-5 left-[19px] top-5 border-l border-dashed border-[#C8BFD1]"
              />


              {incorrectItems.map((item) => (
                <div
                  key={item.index}
                  className="relative pl-12"
                >

                  {/* question marker */}

                  <div className="absolute left-0 top-1 flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#E47B62] bg-[#FBE0D9] text-[10px] font-black text-[#B85C49] shadow-[2px_2px_0_#E9B8AC]">
                    Q{item.index + 1}
                  </div>


                  {/* explanation */}

                  <div className="relative rounded-[20px] border-2 border-[#DED5CA] bg-[#FFFDF7]/90 px-5 py-4 shadow-[3px_3px_0_#DED5CA] transition-all duration-200 hover:-translate-y-0.5">

                    <span
                      aria-hidden="true"
                      className="absolute right-4 top-3 h-2 w-2 rounded-full bg-[#FFD65A]"
                    />

                    <p className="text-sm leading-6 text-[#596170]">
                      {item.explanation}
                    </p>

                  </div>

                </div>
              ))}

            </div>

          </section>
        )}


        {/* ===================================================
            ENCOURAGEMENT
        =================================================== */}

        <section className="relative mb-9 overflow-hidden rounded-[24px] border-2 border-[#5424C7] bg-[#EEE7FF]/90 px-5 py-7 text-center sm:px-8">

          {/* yellow orbit */}

          <div
            aria-hidden="true"
            className="absolute -left-5 -top-5 h-16 w-16 rounded-full border-[7px] border-[#FFD65A]/50"
          />


          {/* teal orbit */}

          <div
            aria-hidden="true"
            className="absolute -bottom-6 -right-5 h-20 w-20 rounded-full border-2 border-dashed border-[#4E9EA0]/40"
          />


          {/* star */}

          <svg
            className="absolute left-5 top-4 h-7 w-7 rotate-[-10deg] text-[#F0A23A]"
            viewBox="0 0 40 40"
            fill="none"
          >
            <path
              d="M20 3L23 15L37 20L23 24L20 37L16 24L3 20L16 15L20 3Z"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>


          <p className="relative text-base font-black tracking-[-0.02em] text-[#5424C7] sm:text-lg">
            {score === 100
              ? 'You mastered this analogy! 🎓'
              : 'Great effort! Keep practicing to deepen your understanding.'}
          </p>

        </section>


        {/* ===================================================
            ACTIONS
        =================================================== */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">

          <button
            className="
              rounded-full
              border-2
              border-[#CFC6D9]
              bg-[#FFFDF7]
              px-7
              py-3
              text-sm
              font-black
              text-[#5D5664]
              transition-all
              duration-200
              hover:-translate-y-1
              hover:border-[#5424C7]
              hover:text-[#5424C7]
              hover:shadow-[3px_4px_0_#5424C7]
            "
            onClick={onPracticeAgain}
          >
            Start New Practice
          </button>


          <button
            className="
              group
              relative
              overflow-hidden
              rounded-full
              border-2
              border-[#14213D]
              bg-[#5424C7]
              px-7
              py-3
              text-sm
              font-black
              text-white
              shadow-[3px_4px_0_#14213D]
              transition-all
              duration-200
              hover:-translate-y-1
              hover:bg-[#4320A2]
              hover:shadow-[5px_6px_0_#14213D]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
            onClick={onGenerateMore}
            disabled={isGeneratingMore}
          >

            <span className="relative z-10">
              {isGeneratingMore
                ? 'Generating...'
                : 'Generate More Questions →'}
            </span>

            <span className="absolute -right-5 -top-5 h-14 w-14 rounded-full bg-[#FFD65A]/30 transition-transform duration-300 group-hover:scale-150" />

          </button>

        </div>

      </div>

    </div>
  )
}
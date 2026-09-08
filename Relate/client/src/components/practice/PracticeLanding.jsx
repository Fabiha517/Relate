import PracticeHistory from './PracticeHistory'

export default function PracticeLanding({
  sessions = [],
  onReviewSession,
   onDeleteSession,
}) {
  return (
    <div className="relative w-full bg-transparent text-[#14213D]">

      {/* =========================================================
          HERO
          This is directly on the page canvas.
      ========================================================= */}

      <header className="relative grid min-h-[330px] grid-cols-1 items-center gap-4 lg:grid-cols-[1.08fr_.92fr]">

        {/* =====================================================
            HERO COPY
        ===================================================== */}

        <div className="relative z-10 max-w-3xl">

          {/* eyebrow */}

          <div className="mb-5 flex items-center gap-3">

            <span className="h-2.5 w-9 rotate-[-3deg] rounded-full bg-[#E47B62]" />

            <span className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#77717C]">
              Your practice journal
            </span>

            <span className="text-lg text-[#F0A23A]">
              ✦
            </span>

          </div>


          {/* title */}

          <h1 className="max-w-3xl text-[clamp(3.6rem,7vw,6.8rem)] font-black leading-[0.82] tracking-[-0.07em]">

            <span className="text-[#14213D]">
              SEE WHAT
            </span>

            <br />

            <span className="relative inline-block text-[#5424C7]">

              STUCK

              <svg
                aria-hidden="true"
                className="absolute -bottom-3 left-0 h-5 w-full"
                viewBox="0 0 220 20"
                fill="none"
                preserveAspectRatio="none"
              >
                <path
                  d="M3 13C43 3 92 18 137 8C167 2 192 5 217 9"
                  stroke="#F0A23A"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>

            </span>

            <span className="ml-2 text-[#14213D]">
              .
            </span>

          </h1>


          {/* description */}

          <p className="mt-7 max-w-2xl text-[15px] leading-7 text-[#667085] sm:text-[17px]">
            Revisit what you practiced, spot the connections
            that clicked, and see where your understanding
            still needs another pass.
          </p>

        </div>


        {/* =====================================================
            SESSION VISUAL
        ===================================================== */}

        <div className="relative flex min-h-[290px] items-center justify-center">

          {/* orbit */}

          <div className="absolute h-[275px] w-[275px] rounded-full border border-dashed border-[#5424C7]/20 animate-[practiceOrbit_32s_linear_infinite]" />

          <div className="absolute h-[225px] w-[225px] rounded-full border-2 border-[#F0A23A]/20 animate-[practiceOrbitReverse_25s_linear_infinite]" />

          <div className="absolute h-[185px] w-[185px] rounded-full border border-dashed border-[#4E9EA0]/25" />


          {/* orbit points */}

          <span className="absolute left-[calc(50%-6px)] top-[15px] h-3 w-3 rounded-full bg-[#E47B62]" />

          <span className="absolute bottom-[25px] right-[calc(50%-70px)] h-3 w-3 rounded-full bg-[#4E9EA0]" />

          <span className="absolute left-[calc(50%-105px)] top-[70px] h-2.5 w-2.5 rounded-full bg-[#F0A23A]" />


          {/* count */}

          {sessions.length > 0 && (

            <div className="relative z-10">

              <div className="absolute -right-7 -top-5 h-4 w-4 rounded-full bg-[#E47B62] animate-[practicePulse_4s_ease-in-out_infinite]" />

              <div className="absolute -bottom-3 -left-5 h-3 w-3 rounded-full bg-[#4E9EA0]" />


              <div className="relative flex h-[185px] w-[185px] rotate-[-2deg] flex-col items-center justify-center rounded-full border-2 border-[#14213D] bg-[#FFFDF7] shadow-[7px_8px_0_#14213D]">

                <span className="text-[68px] font-black leading-none tracking-[-0.08em] text-[#5424C7]">
                  {sessions.length}
                </span>

                <span className="mt-3 text-[9px] font-black uppercase tracking-[0.2em] text-[#85808D]">
                  {sessions.length === 1
                    ? 'practice session'
                    : 'practice sessions'}
                </span>

              </div>

            </div>

          )}


          {/* annotation */}

          {sessions.length > 0 && (

            <div className="absolute bottom-[8px] left-[5%] rotate-[-5deg] font-[cursive] text-sm text-[#77717C]">

              things you worked through

              <svg
                className="absolute -bottom-5 left-8 h-7 w-24"
                viewBox="0 0 100 30"
                fill="none"
              >
                <path
                  d="M2 5 C30 18 62 19 95 27"
                  stroke="#77717C"
                  strokeWidth="1.2"
                  strokeDasharray="3 4"
                />
              </svg>

            </div>

          )}

        </div>

      </header>


      {/* =========================================================
          HISTORY SECTION
      ========================================================= */}

      <section className="relative pt-1">

        {/* section intro */}

        <div className="mb-7 flex items-end justify-between gap-6">

          <div>

            <div className="mb-2 flex items-center gap-2">

              <span className="h-2.5 w-2.5 rounded-full bg-[#4E9EA0]" />

              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7A8290]">
                Your learning trail
              </span>

            </div>

            <h2 className="text-3xl font-black tracking-[-0.045em] text-[#14213D] sm:text-4xl">
              Practice results
            </h2>

          </div>


          <p className="hidden max-w-xs text-right font-[cursive] text-sm text-[#77717C] sm:block">
            Every session is another connection made.
          </p>

        </div>


        {/* tiny connector integrated into canvas */}

        <svg
          aria-hidden="true"
          className="pointer-events-none absolute -left-8 top-16 hidden h-24 w-6 md:block"
          viewBox="0 0 24 100"
          fill="none"
        >
          <path
            d="M12 2 C3 20 21 30 12 48 C3 66 21 78 12 98"
            stroke="#B8AECF"
            strokeWidth="1.5"
            strokeDasharray="4 6"
          />
        </svg>


        {/* =====================================================
            EXISTING HISTORY
            Card design remains untouched.
        ===================================================== */}

        <PracticeHistory
          sessions={sessions}
          onReviewSession={onReviewSession}
           onDeleteSession={onDeleteSession}
        />

      </section>


      {/* =========================================================
          LOCAL ANIMATION
      ========================================================= */}

      <style>{`
        @keyframes practicePulse {
          0%, 100% {
            transform: scale(1);
            opacity: .75;
          }

          50% {
            transform: scale(1.25);
            opacity: 1;
          }
        }
      `}</style>

    </div>
  )
}
export default function PracticeHistoryCard({
  session,
  index = 0,
  onClick,
}) {
  const score = Number(session?.score ?? 0)

  const scoreColor =
    score >= 80
      ? '#4E9EA0'
      : score >= 60
        ? '#F0A23A'
        : '#E47B62'

  const scoreLabel =
    score >= 80
      ? 'Strong connection'
      : score >= 60
        ? 'Getting there'
        : 'Worth another look'

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        relative
        w-full
        overflow-hidden
        rounded-[28px]
        border-2 border-[#D8D0C2]
        bg-[#FFFDF7]
        px-5 py-6
        text-left
        shadow-[3px_4px_0_#D8D0C2]
        transition-all duration-300
        hover:-translate-y-1
        hover:rotate-[0.3deg]
        hover:border-[#5424C7]
        hover:shadow-[6px_8px_0_#5424C7]
        focus:outline-none
        focus:ring-2
        focus:ring-[#5424C7]
        focus:ring-offset-4
        focus:ring-offset-[#F7F0E3]
        sm:px-7 sm:py-7
        hover:cursor-pointer
      "
    >

      {/* =====================================================
          DECORATIVE BACKGROUND
      ===================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >

        {/* colored organic shape */}
        <div
          className="
            absolute
            -right-10
            -top-12
            h-36
            w-36
            rounded-[46%_54%_62%_38%]
            opacity-70
            transition-transform
            duration-500
            group-hover:scale-110
          "
          style={{
            backgroundColor:
              index % 3 === 0
                ? '#E8E0FF'
                : index % 3 === 1
                  ? '#D8F1EE'
                  : '#FFE6A5',
          }}
        />

        {/* little dots */}
        <svg
          className="absolute bottom-4 right-5 h-14 w-20 opacity-40"
          viewBox="0 0 80 50"
          fill="none"
        >
          <circle cx="5" cy="5" r="2" fill="#5424C7" />
          <circle cx="25" cy="5" r="2" fill="#5424C7" />
          <circle cx="45" cy="5" r="2" fill="#5424C7" />
          <circle cx="65" cy="5" r="2" fill="#5424C7" />

          <circle cx="15" cy="25" r="2" fill="#5424C7" />
          <circle cx="35" cy="25" r="2" fill="#5424C7" />
          <circle cx="55" cy="25" r="2" fill="#5424C7" />

          <circle cx="25" cy="45" r="2" fill="#5424C7" />
          <circle cx="45" cy="45" r="2" fill="#5424C7" />
        </svg>

        {/* hand-drawn arrow */}
        <svg
          className="
            absolute
            right-6
            top-5
            h-10
            w-16
            text-[#5424C7]
            opacity-0
            transition-all
            duration-300
            group-hover:translate-x-1
            group-hover:opacity-100
          "
          viewBox="0 0 70 40"
          fill="none"
        >
          <path
            d="M3 21C20 11 35 15 56 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            d="M48 11L58 18L48 25"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">

        {/* ===================================================
            SCORE
        =================================================== */}

        <div className="relative flex h-[86px] w-[86px] shrink-0 items-center justify-center">

          {/* SVG ring */}
          <svg
            className="absolute inset-0 h-full w-full -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="#E8E2D8"
              strokeWidth="7"
              fill="none"
            />

            <circle
              cx="50"
              cy="50"
              r="42"
              stroke={scoreColor}
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="264"
              strokeDashoffset={264 - (264 * score) / 100}
              className="transition-all duration-700"
            />
          </svg>

          <div className="relative text-center">
            <div className="text-xl font-black text-[#14213D]">
              {score}%
            </div>

            <div className="text-[8px] font-bold uppercase tracking-[0.1em] text-[#8D919B]">
              score
            </div>
          </div>
        </div>

        {/* ===================================================
            SESSION INFORMATION
        =================================================== */}

        <div className="min-w-0 flex-1">

          <div className="mb-2 flex flex-wrap items-center gap-2">

            <span
              className="rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.1em]"
              style={{
                backgroundColor:
                  score >= 80
                    ? '#D8F1EE'
                    : score >= 60
                      ? '#FFF0C7'
                      : '#FBE0D9',
                color: scoreColor,
              }}
            >
              {scoreLabel}
            </span>

            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#A09AA5]">
              Session {index + 1}
            </span>
          </div>

          <h3
            className="
              max-w-xl
              truncate
              text-lg
              font-black
              tracking-[-0.025em]
              text-[#14213D]
              transition-colors
              group-hover:text-[#5424C7]
              sm:text-xl
            "
          >
            {session?.analogyTitle || 'Practice session'}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#858B97]">

            {session?.analogyWorld && (
              <span className="font-medium">
                {session.analogyWorld}
              </span>
            )}

            {session?.questionCount != null && (
              <>
                <span className="h-1 w-1 rounded-full bg-[#B8B1BC]" />

                <span>
                  {session.questionCount}{' '}
                  {session.questionCount === 1
                    ? 'question'
                    : 'questions'}
                </span>
              </>
            )}

            {session?.completedAt && (
              <>
                <span className="h-1 w-1 rounded-full bg-[#B8B1BC]" />

                <span>
                  {new Date(
                    session.completedAt
                  ).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </>
            )}
          </div>
        </div>

        {/* ===================================================
            REVIEW ACTION
        =================================================== */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-3
            border-t
            border-[#ECE6DC]
            pt-4
            sm:border-t-0
            sm:pt-0
          "
        >
          <span
            className="
              text-xs
              font-bold
              text-[#8A8490]
              transition-colors
              group-hover:text-[#5424C7]
            "
          >
            Review
          </span>

          <span
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              border-2
              border-[#D8D0C2]
              bg-[#FFFDF7]
              text-lg
              text-[#7E7785]
              transition-all
              duration-300
              group-hover:border-[#5424C7]
              group-hover:bg-[#5424C7]
              group-hover:text-white
            "
          >
            →
          </span>
        </div>
      </div>
    </button>
  )
}
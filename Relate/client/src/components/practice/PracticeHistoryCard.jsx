export default function PracticeHistoryCard({
  session,
  onClick,
}) {
  const score = Number(session?.score ?? 0)

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        flex w-full items-center gap-4
        rounded-xl
        border border-[#DED9D1]
        bg-[#FBF8F1]
        px-4 py-3.5
        text-left
        transition-all duration-200
        hover:-translate-y-[1px]
        hover:border-[#CFC5EB]
        hover:bg-[#FCFAF5]
        hover:shadow-[0_5px_18px_rgba(91,79,207,0.06)]
        focus:outline-none
        focus:ring-2
        focus:ring-[#B9ADF0]
        focus:ring-offset-2
        focus:ring-offset-[#F8F2E6]
        sm:px-5
      "
    >
      {/* Score */}
      <div
        className="
          flex h-11 w-11 shrink-0 items-center justify-center
          rounded-xl
          bg-[#EEE9FF]
        "
      >
        <span className="text-sm font-bold text-[#6855C8]">
          {score}%
        </span>
      </div>

      {/* Session information */}
      <div className="min-w-0 flex-1">
        <h3
          className="
            truncate
            text-sm font-semibold
            text-[#34313D]
            sm:text-[15px]
          "
        >
          {session?.analogyTitle || 'Practice session'}
        </h3>

        <div className="mt-1 flex items-center gap-2 text-xs text-[#9994A2]">
          <span className="truncate">
            {session?.analogyWorld || ''}
          </span>

          {session?.questionCount != null && (
            <>
              <span aria-hidden="true">•</span>

              <span className="shrink-0">
                {session.questionCount}{' '}
                {session.questionCount === 1
                  ? 'question'
                  : 'questions'}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Date + review */}
      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-xs text-[#AAA5AE]">
          {session?.completedAt
            ? new Date(session.completedAt).toLocaleDateString(
                'en-US',
                {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                }
              )
            : ''}
        </p>

        <p
          className="
            mt-1
            text-xs font-medium
            text-[#8A8296]
            transition-colors
            group-hover:text-[#6855C8]
          "
        >
          Review
        </p>
      </div>

      {/* Arrow */}
      <span
        aria-hidden="true"
        className="
          shrink-0
          text-base
          text-[#B0AAB8]
          transition-all duration-200
          group-hover:translate-x-1
          group-hover:text-[#6855C8]
        "
      >
        →
      </span>
    </button>
  )
}
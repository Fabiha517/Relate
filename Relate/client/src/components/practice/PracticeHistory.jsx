import PracticeHistoryCard from './PracticeHistoryCard'

export default function PracticeHistory({
  sessions = [],
  onReviewSession,
}) {
  if (!sessions || sessions.length === 0) {
    return (
      <div
        className="
          rounded-2xl
          border border-dashed border-[#D9D2C8]
          bg-[#FBF8F1]
          px-6 py-12
          text-center
        "
      >
        <div
          className="
            mx-auto mb-4
            flex h-11 w-11
            items-center justify-center
            rounded-xl
            bg-[#EEE9FF]
            text-[#6855C8]
          "
        >
          ✦
        </div>

        <h3 className="text-sm font-semibold text-[#34313D]">
          No practice results yet
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8D8893]">
          Complete a practice session from one of your saved analogies
          and your results will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2.5">
      {sessions.map((session) => (
        <PracticeHistoryCard
          key={`${session.analogyId}-${session.sessionId}`}
          session={session}
          onClick={() => onReviewSession?.(session)}
        />
      ))}
    </div>
  )
}
import PracticeHistory from './PracticeHistory'

export default function PracticeLanding({
  sessions = [],
  onReviewSession,
}) {
  return (
    <div className="min-h-full w-full">
      <div
        className="
          mx-auto w-full max-w-5xl
          px-4 py-8
          sm:px-6 sm:py-10
          lg:px-8 lg:py-12
        "
      >
        {/* Page introduction */}
        <header className="mb-10 max-w-2xl">
          <div
            className="
              mb-3 inline-flex
              items-center
              rounded-full
              bg-[#EEE9FF]
              px-3 py-1
              text-[11px] font-semibold
              tracking-[0.08em]
              text-[#6B58C9]
            "
          >
            PRACTICE
          </div>

          <h1
            className="
              text-3xl font-bold
              tracking-tight
              text-[#292733]
              sm:text-4xl
            "
          >
            Practice Your Understanding
          </h1>

          <p
            className="
              mt-3
              max-w-xl
              text-sm leading-6
              text-[#7C7784]
              sm:text-base
            "
          >
            Review how well you understood the analogies you
            practiced from your Library.
          </p>
        </header>

        {/* Results section */}
        <section>
          <div
            className="
              mb-5
              flex items-end justify-between gap-4
            "
          >
            <div>
              <h2
                className="
                  text-xl font-bold
                  tracking-tight
                  text-[#292733]
                "
              >
                Your Practice Results
              </h2>

              <p
                className="
                  mt-1
                  text-sm leading-6
                  text-[#85818F]
                "
              >
                Look back at your previous sessions and see how
                you did.
              </p>
            </div>

            {sessions.length > 0 && (
              <span
                className="
                  hidden shrink-0
                  rounded-full
                  bg-[#F3EFE7]
                  px-3 py-1
                  text-xs font-medium
                  text-[#9994A2]
                  sm:inline-flex
                "
              >
                {sessions.length}{' '}
                {sessions.length === 1
                  ? 'result'
                  : 'results'}
              </span>
            )}
          </div>

          <PracticeHistory
            sessions={sessions}
            onReviewSession={onReviewSession}
          />
        </section>
      </div>
    </div>
  )
}
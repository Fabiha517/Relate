export default function PracticeAnalogySelector({
  analogies = [],
  onSelect,
}) {
  if (!analogies || analogies.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[#D9D2C8] bg-[#FCFAF7] px-6 py-14 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EEE9FF] text-2xl">
          ✦
        </div>

        <h3 className="mt-5 text-lg font-bold text-[#34313D]">
          No analogies to practice yet
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#85818F]">
          Save an analogy to your Library first, then come back here to test
          your understanding.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
      {analogies.map((analogy) => {
        const analogyId = analogy._id || analogy.id

        return (
          <button
            key={analogyId}
            type="button"
            onClick={() => onSelect(analogyId)}
            className="group relative overflow-hidden rounded-3xl border border-[#E6E0D8] bg-white p-6 text-left shadow-[0_2px_8px_rgba(50,45,40,0.04)] transition-all duration-200 hover:-translate-y-1 hover:border-[#CFC4F4] hover:shadow-[0_12px_30px_rgba(91,79,207,0.10)] focus:outline-none focus:ring-2 focus:ring-[#B9ADF0] focus:ring-offset-2"
          >
            {/* Decorative corner */}
            <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#F3EFFF] transition-transform duration-300 group-hover:scale-125" />

            <div className="relative">
              {/* Top row */}
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EEE9FF] text-lg">
                  ✦
                </div>

                <span className="rounded-full bg-[#F7F5F1] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#918B98]">
                  {analogy.analogyWorld || 'Analogy'}
                </span>
              </div>

              {/* Title */}
              <div className="mt-6">
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#9B95A2]">
                  Practice
                </p>

                <h3 className="line-clamp-2 text-xl font-bold leading-7 text-[#302D38]">
                  {analogy.analogyTitle}
                </h3>
              </div>

              {/* Concept */}
              {analogy.concept && (
                <div className="mt-4 rounded-2xl bg-[#FAF8F4] px-4 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[#A09AA5]">
                    Concept
                  </p>

                  <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#625D69]">
                    {analogy.concept}
                  </p>
                </div>
              )}

              {/* CTA */}
              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm font-semibold text-[#6855C8]">
                  Start practice
                </span>

                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6855C8] text-sm text-white transition-transform duration-200 group-hover:translate-x-1">
                  →
                </span>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
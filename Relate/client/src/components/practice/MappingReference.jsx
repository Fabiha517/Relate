/**
 * MappingReference - Renders mapping label as visually distinct callout
 *
 * Derived from structured data — never raw AI text as HTML
 * Shows the mapping label that relates the current question to the analogy mapping
 *
 * Props:
 * - mappingLabel: string (from the analogy mapping data)
 * - icon: string (optional emoji or icon identifier)
 *
 * Requirements: 10.15, 10.16, 10.17
 */
export function MappingReference({ mappingLabel, icon = '🔗' }) {
  if (!mappingLabel) return null

  return (
    <div className="relative inline-flex max-w-full items-center gap-3">
      {/* Decorative connector */}
      <svg
        className="absolute -left-7 top-1/2 hidden h-8 w-7 -translate-y-1/2 overflow-visible sm:block"
        viewBox="0 0 30 30"
        fill="none"
      >
        <path
          d="M1 15 C8 4 17 25 29 14"
          stroke="#B8A4E8"
          strokeWidth="1.5"
          strokeDasharray="3 4"
        />
      </svg>

      {/* Icon */}
      <span className="relative flex h-10 w-10 shrink-0 rotate-[-4deg] items-center justify-center rounded-xl border-2 border-[#D8C7F5] bg-[#EEE5FF] text-base shadow-[2px_3px_0_#D8C7F5]">
        {icon}
      </span>

      {/* Label */}
      <span className="relative border-b-2 border-dashed border-[#C9B8E9] pb-1 text-sm font-bold leading-5 text-[#4B3B69]">
        {mappingLabel}
      </span>
    </div>
  )
}
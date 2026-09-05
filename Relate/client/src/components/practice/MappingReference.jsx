import './MappingReference.css'

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
    <div className="mapping-reference">
      <span className="mapping-reference__icon">{icon}</span>
      <span className="mapping-reference__label">{mappingLabel}</span>
    </div>
  )
}

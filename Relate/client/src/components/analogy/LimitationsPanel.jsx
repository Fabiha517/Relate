/** @jsxImportSource react */

/**
 * LimitationsPanel - Renders limitations where the analogy breaks down
 * Displays each limitation as a separate list item with bullet marker
 * Never shows raw JSON syntax to the user
 * Only rendered when explanation is present
 * 
 * Requirements: 4.2, 4.5, 4.6
 */
export default function LimitationsPanel({ limitations }) {
  // Validate that limitations is an array with items
  if (!limitations || !Array.isArray(limitations) || limitations.length === 0) {
    return null
  }

  return (
    <div className="limitations-panel">
      
      <ul className="limitations-list">
        {limitations.map((limitation, index) => (
          <li key={index} className="limitation-item">
            {limitation}
          </li>
        ))}
      </ul>
    </div>
  )
}

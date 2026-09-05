/** @jsxImportSource react */

/**
 * ExplanationPanel - Renders the AI-generated explanation.
 * Styled entirely by the parent (AnalogyPage) container.
 * Requirements: 4.1, 4.2, 4.5, 4.6
 */
export default function ExplanationPanel({ explanation }) {
  if (!explanation || explanation.trim() === '') {
    return (
      <div className="explanation-panel error-state">
        <div className="error-message">
          <p>The explanation could not be loaded. Please try regenerating the analogy.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="explanation-panel">
      <div className="explanation-content">
        <p>{explanation}</p>
      </div>
    </div>
  )
}

import './PracticeSessionSummary.css'

/**
 * PracticeSessionSummary - Display practice session results
 *
 * Props:
 * - totalQuestions: number
 * - correctCount: number
 * - score: number (0-100, pre-calculated)
 * - understood: array of mapping labels (understood mappings)
 * - struggled: array of mapping labels (struggled with mappings)
 * - evaluations: array of evaluation objects (for per-incorrect explanations)
 * - onPracticeAgain: function
 * - onGenerateMore: function
 * - isGeneratingMore: boolean (optional)
 *
 * Displays:
 * - Final score
 * - What the user understood
 * - Areas worth another look
 * - Explanations for incorrect answers
 * - Actions for starting a new practice or generating more questions
 *
 * Note:
 * - "Answer feedback" is intentionally not displayed here.
 * - "Practice Again" is renamed to "Start New Practice" because it
 *   generates a fresh practice session rather than repeating the same questions.
 */
export function PracticeSessionSummary({
  totalQuestions,
  correctCount,
  score,
  understood,
  struggled,
  evaluations,
  onPracticeAgain,
  onGenerateMore,
  isGeneratingMore = false,
}) {
  // Get incorrect answers with explanations
  const incorrectItems = evaluations
    .map((evaluation, idx) => ({
      index: idx,
      ...evaluation,
    }))
    .filter((item) => !item.correct)

  // Score descriptor based on score
  const getScoreDescriptor = (score) => {
    if (score === 100) return 'Perfect! 🎉'
    if (score >= 80) return 'Excellent work'
    if (score >= 60) return 'Good understanding'
    if (score >= 40) return 'Keep practicing'
    return 'Worth another look'
  }

  return (
    <div className="practice-session-summary">
      {/* Score Display */}
      <div className="practice-session-summary__score-section">
        <div className="practice-session-summary__score-display">
          <div className="practice-session-summary__score-stars">
            ✦ ✦ ✦
          </div>

          <div className="practice-session-summary__score-number">
            {score}%
          </div>

          <div className="practice-session-summary__score-stars">
            ✦ ✦ ✦
          </div>
        </div>

        <div className="practice-session-summary__score-meta">
          <p className="practice-session-summary__score-count">
            {correctCount} of {totalQuestions} correct
          </p>

          <p className="practice-session-summary__score-descriptor">
            {getScoreDescriptor(score)}
          </p>
        </div>
      </div>

      {/* You Understood */}
      {understood && understood.length > 0 && (
        <div className="practice-session-summary__section">
          <h3 className="practice-session-summary__section-title">
            You understood:
          </h3>

          <ul className="practice-session-summary__list">
            {understood.map((mapping, idx) => (
              <li
                key={idx}
                className="practice-session-summary__list-item practice-session-summary__list-item--understood"
              >
                {mapping}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Worth Another Look */}
      {struggled && struggled.length > 0 && (
        <div className="practice-session-summary__section">
          <h3 className="practice-session-summary__section-title">
            Worth another look:
          </h3>

          <ul className="practice-session-summary__list">
            {struggled.map((mapping, idx) => (
              <li
                key={idx}
                className="practice-session-summary__list-item practice-session-summary__list-item--struggled"
              >
                {mapping}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Incorrect Answer Explanations */}
      {incorrectItems.length > 0 && (
        <div className="practice-session-summary__section">
          <h3 className="practice-session-summary__section-title">
            Let's review the tricky ones:
          </h3>

          <div className="practice-session-summary__incorrect-list">
            {incorrectItems.map((item) => (
              <div
                key={item.index}
                className="practice-session-summary__incorrect-item"
              >
                <div className="practice-session-summary__incorrect-header">
                  <span className="practice-session-summary__incorrect-index">
                    Q{item.index + 1}
                  </span>

                  <p className="practice-session-summary__incorrect-explanation">
                    {item.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Encouraging Message */}
      <div className="practice-session-summary__encouragement">
        <p>
          {score === 100
            ? 'You mastered this analogy! 🎓'
            : 'Great effort! Keep practicing to deepen your understanding.'}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="practice-session-summary__actions">
        <button
          className="practice-session-summary__btn practice-session-summary__btn--secondary"
          onClick={onPracticeAgain}
        >
          Start New Practice
        </button>

        <button
          className="practice-session-summary__btn practice-session-summary__btn--primary"
          onClick={onGenerateMore}
          disabled={isGeneratingMore}
        >
          {isGeneratingMore
            ? 'Generating...'
            : 'Generate More Questions'}
        </button>
      </div>
    </div>
  )
}
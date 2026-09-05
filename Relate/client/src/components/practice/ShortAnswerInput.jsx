import { useState } from 'react'
import './ShortAnswerInput.css'

/**
 * ShortAnswerInput - Short answer question input
 *
 * Props:
 * - onSubmit: function(trimmedAnswer)
 * - isAnswered: boolean (read-only after answer submitted)
 * - placeholder: string (optional)
 *
 * Behavior:
 * - Textarea, trims whitespace before submit
 * - Disabled after submission
 * - Visual treatment via className — not inline styles
 *
 * Requirements: 10.11, 10.12
 */
export function ShortAnswerInput({ onSubmit, isAnswered = false, placeholder = 'Type your answer...' }) {
  const [answer, setAnswer] = useState('')

  const handleSubmit = () => {
    const trimmedAnswer = answer.trim()
    if (trimmedAnswer && !isAnswered) {
      onSubmit(trimmedAnswer)
    }
  }

  const handleKeyDown = (e) => {
    // Ctrl+Enter or Cmd+Enter to submit
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="short-answer-input">
      <textarea
        className="short-answer-input__textarea"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isAnswered}
        rows={6}
      />

      {!isAnswered && (
        <div className="short-answer-input__footer">
          <p className="short-answer-input__hint">Press Ctrl+Enter to submit</p>
          <button
            className="short-answer-input__submit-btn"
            onClick={handleSubmit}
            disabled={!answer.trim()}
          >
            Submit Answer
          </button>
        </div>
      )}

      {isAnswered && (
        <div className="short-answer-input__submitted">
          <p className="short-answer-input__submitted-label">Your answer:</p>
          <div className="short-answer-input__submitted-text">{answer}</div>
        </div>
      )}
    </div>
  )
}

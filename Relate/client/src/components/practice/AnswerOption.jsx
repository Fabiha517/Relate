import './AnswerOption.css'

/**
 * AnswerOption - Single answer option for multiple-choice questions
 *
 * States: unselected, selected, correct, incorrect (via className)
 * role="radio" for accessibility, keyboard selectable
 *
 * Props:
 * - letter: string (A, B, C, D)
 * - text: string
 * - isSelected: boolean
 * - isEvaluated: boolean (answer submitted)
 * - isCorrect: boolean (only meaningful when isEvaluated=true)
 * - onClick: function
 *
 * Requirements: 10.11, 10.12
 */
export function AnswerOption({
  letter,
  text,
  isSelected,
  isEvaluated,
  isCorrect,
  onClick,
  disabled = false,
}) {
  let stateClass = 'unselected'

  if (isEvaluated) {
    stateClass = isCorrect ? 'correct' : 'incorrect'
  } else if (isSelected) {
    stateClass = 'selected'
  }

  const handleKeyDown = (e) => {
    // Allow spacebar or enter to select
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (!disabled && !isEvaluated) {
        onClick()
      }
    }
  }

  return (
    <div
      className={`answer-option answer-option--${stateClass}`}
      role="radio"
      aria-checked={isSelected}
      tabIndex={disabled ? -1 : 0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`Option ${letter}: ${text}`}
    >
      <div className="answer-option__letter">{letter}</div>
      <div className="answer-option__text">{text}</div>
    </div>
  )
}

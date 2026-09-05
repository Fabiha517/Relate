import { useState } from 'react'

import './ExplanationDropdown.css'

export function ExplanationDropdown({
  isCorrect,
  correctAnswer,
  explanation,
  encouragement,
}) {
  const [isOpen, setIsOpen] = useState(false)

  const handleToggle = (event) => {
    setIsOpen(event.currentTarget.open)
  }

  return (
    <details
      className="explanation-dropdown"
      onToggle={handleToggle}
    >
      <summary
        className="explanation-dropdown__trigger"
        aria-expanded={isOpen}
      >
        ▾ See explanation
      </summary>

      <div className="explanation-dropdown__content">
        {!isCorrect && correctAnswer && (
          <div className="explanation-dropdown__section">
            <p className="explanation-dropdown__label">
              Correct answer:
            </p>

            <p className="explanation-dropdown__answer">
              {correctAnswer}
            </p>
          </div>
        )}

        {explanation && (
          <div className="explanation-dropdown__section">
            {!isCorrect && (
              <p className="explanation-dropdown__label">
                Why:
              </p>
            )}

            <p className="explanation-dropdown__explanation">
              {explanation}
            </p>
          </div>
        )}

        {encouragement && !isCorrect && (
          <div className="explanation-dropdown__section">
            <p className="explanation-dropdown__encouragement">
              {encouragement}
            </p>
          </div>
        )}
      </div>
    </details>
  )
}
import { useState } from 'react'

import { AnswerOption } from './AnswerOption'

import './MultipleChoiceInput.css'

export function MultipleChoiceInput({
  options,
  onSubmit,
  isAnswered = false,
}) {
  const [selectedOptionId, setSelectedOptionId] =
    useState(null)

  const handleSelectOption = (optionId) => {
    if (!isAnswered) {
      setSelectedOptionId(optionId)
    }
  }

  const getLetterForIndex = (index) => {
    return String.fromCharCode(65 + index)
  }

  const handleSubmit = () => {
    if (!selectedOptionId || isAnswered) {
      return
    }

    const selectedIndex = options.findIndex(
      (option, index) =>
        (option.id || `option-${index}`) ===
        selectedOptionId
    )

    if (selectedIndex < 0) {
      return
    }

    const selectedOption = options[selectedIndex]

    const letter =
      getLetterForIndex(selectedIndex)

    /*
     * Store a human-readable answer:
     * "A (Polling)"
     *
     * This is also what appears in feedback.
     */
    const displayAnswer =
      `${letter} (${selectedOption.text})`

    onSubmit(displayAnswer)
  }

  return (
    <div className="multiple-choice-input">
      <div className="multiple-choice-input__options">
        {options.map((option, index) => {
          const optionId =
            option.id || `option-${index}`

          const letter =
            getLetterForIndex(index)

          return (
            <AnswerOption
              key={optionId}
              letter={letter}
              text={option.text}
              isSelected={
                selectedOptionId === optionId
              }
              isEvaluated={isAnswered}
              isCorrect={false}
              onClick={() =>
                handleSelectOption(optionId)
              }
              disabled={isAnswered}
            />
          )
        })}
      </div>

      {!isAnswered && (
        <div className="multiple-choice-input__submit">
          <button
            className="multiple-choice-input__submit-btn"
            onClick={handleSubmit}
            disabled={!selectedOptionId}
          >
            Submit Answer
          </button>
        </div>
      )}
    </div>
  )
}
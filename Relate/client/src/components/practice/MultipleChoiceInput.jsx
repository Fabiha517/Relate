import { useState } from 'react'

import { AnswerOption } from './AnswerOption'

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

    const selectedOption =
      options[selectedIndex]

    const letter =
      getLetterForIndex(selectedIndex)

    /*
     * Store a human-readable answer:
     * "A (Polling)"
     */
    const displayAnswer =
      `${letter} (${selectedOption.text})`

    onSubmit(displayAnswer)
  }

  return (
    <div className="relative">

      {/* =====================================================
          CANVAS CONNECTOR
      ===================================================== */}

      <svg
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          -left-5
          top-2
          hidden
          h-[calc(100%-20px)]
          w-4
          opacity-45
          sm:block
        "
        viewBox="0 0 20 500"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d="M10 5C3 70 16 110 10 170C4 230 16 290 10 350C4 410 16 450 10 495"
          stroke="#4E9EA0"
          strokeWidth="1.5"
          strokeDasharray="4 8"
        />
      </svg>

      {/* =====================================================
          ANSWER GRID
      ===================================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          sm:gap-5
        "
      >
        {options.map((option, index) => {

          const optionId =
            option.id ||
            `option-${index}`

          const letter =
            getLetterForIndex(index)

          return (
            <div
              key={optionId}
              className="
                relative
                min-w-0
              "
            >

              {/* colorful canvas marker */}

              {index % 2 === 0 ? (

                <span
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    -left-2
                    top-1/2
                    z-10
                    h-2.5
                    w-2.5
                    -translate-y-1/2
                    rounded-full
                    bg-[#E47B62]
                    opacity-80
                  "
                />

              ) : (

                <span
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    -right-1.5
                    top-4
                    z-10
                    h-2.5
                    w-2.5
                    rounded-full
                    bg-[#FFD65A]
                    opacity-85
                  "
                />

              )}

              <AnswerOption
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

            </div>
          )
        })}
      </div>

      {/* =====================================================
          SUBMIT
      ===================================================== */}

      {!isAnswered && (
        <div className="mt-7 flex justify-end">

          <button
            className="
              group
              rounded-full
              border-2
              border-[#14213D]
              bg-[#5424C7]
              px-6
              py-3
              text-sm
              font-black
              text-white
              shadow-[3px_4px_0_#14213D]
              transition-all
              duration-200
              hover:-translate-y-1
              hover:shadow-[5px_6px_0_#14213D]
              disabled:cursor-not-allowed
              disabled:opacity-40
              disabled:hover:translate-y-0
            "
            onClick={handleSubmit}
            disabled={!selectedOptionId}
          >
            Submit Answer

            <span className="ml-2 transition-transform group-hover:translate-x-1">
              →
            </span>
          </button>

        </div>
      )}
    </div>
  )
}
import { ExplanationDropdown } from './ExplanationDropdown'

import './EvaluationFeedback.css'

export function EvaluationFeedback({
  isCorrect,
  userAnswer,
  correctAnswer,
  explanation,
  feedback,
  mappingLabel,
  encouragement,
  questionType = 'multiple-choice',
}) {
  return (
    <div
      className={`evaluation-feedback evaluation-feedback--${
        isCorrect ? 'correct' : 'incorrect'
      }`}
    >
      <div className="evaluation-feedback__indicator">
        {isCorrect ? (
          <>
            <span className="evaluation-feedback__icon evaluation-feedback__icon--correct">
              ✓
            </span>

            <span className="evaluation-feedback__text evaluation-feedback__text--correct">
              Correct ✓
            </span>
          </>
        ) : (
          <>
            <span className="evaluation-feedback__icon evaluation-feedback__icon--incorrect">
              ✕
            </span>

            <span className="evaluation-feedback__text evaluation-feedback__text--incorrect">
              Not quite ✕
            </span>
          </>
        )}
      </div>

      {feedback && (
        <div className="evaluation-feedback__message">
          {feedback}
        </div>
      )}

      <div className="evaluation-feedback__user-answer">
        <p className="evaluation-feedback__label">
          Your answer:
        </p>

        <div
          className={`evaluation-feedback__answer ${
            isCorrect
              ? 'evaluation-feedback__answer--correct'
              : 'evaluation-feedback__answer--incorrect'
          }`}
        >
          {userAnswer || 'No answer provided'}
        </div>
      </div>

      <ExplanationDropdown
        isCorrect={isCorrect}
        correctAnswer={correctAnswer}
        explanation={explanation}
        encouragement={encouragement}
      />
    </div>
  )
}
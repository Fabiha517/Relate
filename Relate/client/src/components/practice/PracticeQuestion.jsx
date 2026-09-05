import { useState, useEffect } from 'react'
import { MultipleChoiceInput } from './MultipleChoiceInput'
import { ShortAnswerInput } from './ShortAnswerInput'
import { EvaluationFeedback } from './EvaluationFeedback'
import LoadingSpinner from '../ui/LoadingSpinner'
import './PracticeQuestion.css'

/**
 * PracticeQuestion - Display and handle a single practice question
 *
 * Props:
 * - question: object with { id, text, type, options[], mappingLabel, explanation, correctAnswer }
 * - questionNumber: number (1-indexed)
 * - totalQuestions: number
 * - evaluation: object (optional, after evaluation)
 * - isLoading: boolean (during evaluation)
 * - isAnswered: boolean (after answer submitted)
 * - onSubmit: function(answer)
 * - onNext: function
 * - error: string (optional, for timeout/error states)
 * - onRetry: function (optional, for retry after timeout)
 *
 * Requirements: 10.11–10.17, 10.20
 */
export function PracticeQuestion({
  question,
  questionNumber,
  totalQuestions,
  evaluation = null,
  isLoading = false,
  isAnswered = false,
  onSubmit,
  onNext,
  error = null,
  onRetry = null,
}) {
  const [userAnswer, setUserAnswer] = useState(null)

  const handleSubmitAnswer = (answer) => {
    setUserAnswer(answer)
    onSubmit(answer)
  }

  if (!question) {
    return <div className="practice-question practice-question--error">No question available</div>
  }

  const isMultipleChoice = question.type === 'multiple-choice'
  const progress = Math.round((questionNumber / totalQuestions) * 100)

  return (
    <div className="practice-question">
      {/* Header */}
      <div className="practice-question__header">
        <div className="practice-question__meta">
          <span className="practice-question__label">Practice Question</span>
          <span className="practice-question__number">
            Question {questionNumber} of {totalQuestions}
          </span>
        </div>

        {/* Progress bar */}
        <div className="practice-question__progress-bar">
          <div
            className="practice-question__progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question text */}
      <h2 className="practice-question__text">{question.text}</h2>

      {/* Input or loading state */}
      <div className="practice-question__content">
        {isLoading ? (
          <div className="practice-question__loading">
            <LoadingSpinner />
            <p>Evaluating your answer...</p>
          </div>
        ) : isAnswered && evaluation ? (
          <>
            {/* Show evaluation feedback */}
            <EvaluationFeedback
              isCorrect={evaluation.correct}
              userAnswer={userAnswer}
              correctAnswer={evaluation.correctAnswer}
              explanation={evaluation.explanation}
              mappingLabel={evaluation.mappingLabel}
              encouragement={evaluation.encouragement}
              questionType={question.type}
            />
          </>
        ) : (
          <>
            {/* Show input based on question type */}
            {isMultipleChoice ? (
              <MultipleChoiceInput
                options={question.options || []}
                onSubmit={handleSubmitAnswer}
                isAnswered={false}
              />
            ) : (
              <ShortAnswerInput onSubmit={handleSubmitAnswer} isAnswered={false} />
            )}
          </>
        )}

        {/* Error message for timeout or other errors */}
        {error && (
          <div className="practice-question__error">
            <p className="practice-question__error-text">{error}</p>
            {onRetry && (
              <button className="practice-question__retry-btn" onClick={onRetry}>
                Try Again
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      {isAnswered && evaluation && !isLoading && (
        <div className="practice-question__nav">
          <button
            className="practice-question__nav-btn practice-question__nav-btn--next"
            onClick={onNext}
          >
            Continue →
          </button>
        </div>
      )}
    </div>
  )
}

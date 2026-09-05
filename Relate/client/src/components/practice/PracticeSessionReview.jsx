import { EvaluationFeedback } from './EvaluationFeedback'
import './PracticeSessionReview.css'

/**
 * PracticeSessionReview - Read-only review of a completed practice session
 *
 * Props:
 * - session: { questions[], answers[], evaluations[], score }
 * - analogyId: string (for navigation)
 * - onPracticeAgain: function
 * - onGenerateMoreQuestions: function
 *
 * Renders:
 * - All questions with their evaluations
 * - Evaluation feedback for each question
 * - ZERO AI calls during render
 */
export default function PracticeSessionReview({
  session,
  analogyId,
  onPracticeAgain,
  onGenerateMoreQuestions,
}) {
  const { questions, answers, evaluations, score } = session

  if (!questions || questions.length === 0) {
    return (
      <div className="practice-session-review">
        No questions in this session.
      </div>
    )
  }

  return (
    <div className="practice-session-review">
      {/* Score summary */}
      <div className="practice-session-review__summary">
        <div className="practice-session-review__score-display">
          <span className="practice-session-review__score-number">
            {score}%
          </span>
        </div>

        <div className="practice-session-review__summary-meta">
          <p>
            {evaluations.filter((e) => e?.correct).length} of{' '}
            {questions.length} correct
          </p>
        </div>
      </div>

      {/* Questions review list */}
      <div className="practice-session-review__questions">
        {questions.map((question, idx) => {
          const evaluation = evaluations[idx]

          // Answers are stored as:
          // { questionIndex, userAnswer }
          const answerEntry = answers[idx]

          const userAnswer =
            typeof answerEntry === 'object'
              ? answerEntry?.userAnswer
              : answerEntry

          return (
            <div
              key={idx}
              className="practice-session-review__question-item"
            >
              <div className="practice-session-review__question-header">
                <span className="practice-session-review__question-number">
                  Question {idx + 1}
                </span>

                <h3 className="practice-session-review__question-text">
                  {question.text}
                </h3>
              </div>

              {/* EvaluationFeedback already displays the user's answer.
                  Do not render a separate "Your answer" block here. */}
              {evaluation && (
                <div className="practice-session-review__feedback">
                  <EvaluationFeedback
                    isCorrect={evaluation.correct}
                    userAnswer={userAnswer}
                    correctAnswer={evaluation.correctAnswer}
                    explanation={evaluation.explanation}
                    mappingLabel={evaluation.mappingLabel}
                    encouragement={evaluation.encouragement}
                    questionType={question.type}
                    options={question.options || []}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>

      
    </div>
  )
}
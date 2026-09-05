/** @jsxImportSource react */

import {
  useState,
  useEffect,
  useRef,
} from 'react'

import {
  useParams,
  useNavigate,
} from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import { usePractice } from '../hooks/usePractice'

import * as analogyApi from '../api/analogy.api'
import * as practiceApi from '../api/practice.api'

import { PracticeQuestion } from '../components/practice/PracticeQuestion'
import { PracticeSessionSummary } from '../components/practice/PracticeSessionSummary'

import LoadingSpinner from '../components/ui/LoadingSpinner'
import BannerError from '../components/ui/BannerError'

import './PracticeSessionPage.css'

/**
 * PracticeSessionPage
 *
 * Flow:
 *
 * 1. Fetch the analogy.
 * 2. Generate the initial questions once.
 * 3. Display one question at a time.
 * 4. Evaluate each answer.
 * 5. Continue through the current question set.
 * 6. Save the completed session.
 * 7. "Start New Practice" generates one fresh question set.
 * 8. "Generate More Questions" generates one new question set
 *    through /questions/more without navigating.
 */
export default function PracticeSessionPage() {
  const { analogyId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const practice = usePractice()

  const sessionSaveStarted =
    useRef(false)

  /**
   * Stores the promise for the initial load.
   *
   * This is important for React StrictMode.
   *
   * StrictMode can execute an effect twice during
   * development. Both executions must share the SAME
   * request instead of generating two question sets.
   */
  const initialLoadRef = useRef({
    analogyId: null,
    promise: null,
  })

  const [analogy, setAnalogy] =
    useState(null)

  const [loading, setLoading] =
    useState(true)

  const [error, setError] =
    useState(null)

  const [isGeneratingMore, setIsGeneratingMore] =
    useState(false)

  /**
   * Load analogy + initial questions.
   *
   * The effect is intentionally tied only to the
   * analogy/user identity.
   *
   * It does NOT depend on practice state/questions.
   */
  useEffect(() => {
    if (!analogyId || !user?.id) {
      return
    }

    /**
     * If this exact analogy already has an
     * initial load in progress or completed,
     * do not generate another question set.
     */
    if (
      initialLoadRef.current.analogyId ===
        analogyId &&
      initialLoadRef.current.promise
    ) {
      return
    }

    setLoading(true)
    setError(null)

    const loadPromise =
      (async () => {
        const response =
          await analogyApi.getAnalogy(
            analogyId
          )

        const analogyData = {
          ...response.analogy,

          id:
            response.analogy.id ||
            response.analogy._id,
        }

        setAnalogy(analogyData)

        /**
         * EXACTLY ONE initial question-generation
         * request for this analogy.
         */
        await practice.loadQuestions(
          analogyData
        )

        return analogyData
      })()

    initialLoadRef.current = {
      analogyId,
      promise: loadPromise,
    }

    loadPromise
      .then(() => {
        /**
         * Only the current initial load is allowed
         * to change the loading state.
         */
        if (
          initialLoadRef.current.promise ===
          loadPromise
        ) {
          setLoading(false)
        }
      })
      .catch((err) => {
        console.error(
          'Failed to load analogy or practice questions:',
          err
        )

        if (
          initialLoadRef.current.promise ===
          loadPromise
        ) {
          const errorMessage =
            err.response?.status === 403
              ? 'You do not have access to this analogy.'
              : err.response?.data?.error?.message ||
                err.message ||
                'Failed to load practice session'

          setError(errorMessage)
          setLoading(false)

          /**
           * Allow the user to retry if the request
           * genuinely failed.
           */
          initialLoadRef.current = {
            analogyId: null,
            promise: null,
          }
        }
      })
  }, [
    analogyId,
    user?.id,
    practice.loadQuestions,
  ])

  /**
   * Save the session exactly once after reaching
   * the summary.
   */
  useEffect(() => {
    if (
      practice.state === 'summary' &&
      analogy &&
      !sessionSaveStarted.current
    ) {
      sessionSaveStarted.current = true

      handleSessionComplete()
    }
  }, [
    practice.state,
    analogy,
  ])

  /**
   * Submit answer.
   */
  async function handleSubmitAnswer(
    userAnswer
  ) {
    try {
      await practice.submitAnswer(
        userAnswer
      )
    } catch (err) {
      console.error(
        'Failed to evaluate answer:',
        err
      )
    }
  }

  /**
   * Move to the next question.
   */
  function handleNext() {
    practice.moveToNextQuestion()
  }

  /**
   * Retry answer evaluation.
   */
  async function handleRetryEvaluation() {
    try {
      await practice.retryEvaluation()
    } catch (err) {
      console.error(
        'Failed to retry evaluation:',
        err
      )
    }
  }

  /**
   * Start New Practice.
   *
   * This is an explicit user action, so it is
   * allowed to make ONE new /questions request.
   *
   * It does not navigate.
   */
  async function handlePracticeAgain() {
    if (!analogy) {
      return
    }

    sessionSaveStarted.current = false
    setError(null)

    try {
      await practice.loadQuestions(
        analogy
      )
    } catch (err) {
      console.error(
        'Failed to start a new practice session:',
        err
      )

      setError(
        err.response?.data?.error?.message ||
        err.message ||
        'Failed to start a new practice session'
      )
    }
  }

  /**
   * Generate More Questions.
   *
   * Exactly ONE /questions/more request.
   *
   * IMPORTANT:
   *
   * - No resetPractice()
   * - No loadQuestions()
   * - No navigation
   * - No second generation after success
   *
   * The returned questions are placed directly
   * into usePractice().
   */
  async function handleGenerateMoreQuestions() {
    if (
      !analogy ||
      isGeneratingMore
    ) {
      return
    }

    setIsGeneratingMore(true)
    setError(null)

    try {
      /**
       * Tell the backend which questions have
       * already been shown.
       */
      const previousQuestions =
        practice.questions
          .map(
            (question) =>
              question?.text
          )
          .filter(Boolean)

      /**
       * EXACTLY ONE /more request.
       */
      const response =
        await practiceApi.generateMorePracticeQuestions(
          {
            analogyId:
              analogy._id ||
              analogy.id,

            concept:
              analogy.concept,

            analogyWorld:
              analogy.analogyWorld,

            nodes:
              analogy.nodes,

            mappings:
              analogy.mappings,

            relationships:
              analogy.relationships,

            explanation:
              analogy.explanation,

            limitations:
              analogy.limitations,

            previousQuestions,
          }
        )

      const newQuestions =
        Array.isArray(response?.questions)
          ? response.questions
          : []

      if (newQuestions.length === 0) {
        throw new Error(
          'No new questions were generated.'
        )
      }

      /**
       * These questions are now a completely
       * new practice run.
       */
      sessionSaveStarted.current = false

      /**
       * This does NOT call the backend.
       *
       * It simply replaces the current state.
       */
      practice.setQuestions(
        newQuestions
      )
    } catch (err) {
      console.error(
        'Failed to generate more questions:',
        err
      )

      setError(
        err.response?.data?.error?.message ||
        err.message ||
        'Failed to generate more questions. Please try again.'
      )
    } finally {
      setIsGeneratingMore(false)
    }
  }

  /**
   * Save completed practice session.
   */
  async function handleSessionComplete() {
    if (!analogy) {
      return
    }

    try {
      await practice.savePracticeSession(
        analogy._id ||
        analogy.id
      )

      console.log(
        'Practice session saved successfully'
      )
    } catch (err) {
      console.error(
        'Failed to save practice session:',
        err
      )
    }
  }

  /**
   * Initial page loading.
   */
  if (loading) {
    return (
      <div className="practice-session-page">
        <div className="practice-session-loading">
          <LoadingSpinner />

          <p>
            Loading practice session...
          </p>
        </div>
      </div>
    )
  }

  /**
   * Page-level error.
   */
  if (error) {
    return (
      <div className="practice-session-page">
        <BannerError
          message={error}
          onDismiss={() => {
            setError(null)
            navigate('/practice')
          }}
          isDismissible={true}
        />
      </div>
    )
  }

  /**
   * No analogy.
   */
  if (!analogy) {
    return (
      <div className="practice-session-page">
        <BannerError
          message="Analogy not found."
          onDismiss={() =>
            navigate('/practice')
          }
          isDismissible={true}
        />
      </div>
    )
  }

  /**
   * Questions are being generated.
   *
   * This also handles Start New Practice,
   * because loadQuestions changes the hook state
   * to loading_questions.
   */
  if (
    practice.state ===
      'loading_questions' ||
    practice.questions.length === 0
  ) {
    return (
      <div className="practice-session-page">
        <div className="practice-session-loading">
          <LoadingSpinner />

          <p>
            Preparing questions...
          </p>
        </div>
      </div>
    )
  }

  /**
   * Summary.
   */
  if (
    practice.state === 'summary' ||
    practice.state === 'saving' ||
    practice.state === 'saved' ||
    practice.state === 'save_error'
  ) {
    const score =
      practice.calculateScore()

    const {
      understood,
      struggled,
    } =
      practice.getMappingsByCorrectness()

    return (
      <div className="practice-session-page">
        <PracticeSessionSummary
          totalQuestions={
            practice.questions.length
          }

          correctCount={
            practice.evaluations.filter(
              (evaluation) =>
                evaluation?.correct
            ).length
          }

          score={score}

          understood={understood}

          struggled={struggled}

          evaluations={
            practice.evaluations
          }

          onPracticeAgain={
            handlePracticeAgain
          }

          onGenerateMore={
            handleGenerateMoreQuestions
          }

          isGeneratingMore={
            isGeneratingMore
          }
        />
      </div>
    )
  }

  /**
   * Current question.
   */
  const currentQuestion =
    practice.questions[
      practice.currentIndex
    ]

  const currentEvaluation =
    practice.evaluations[
      practice.currentIndex
    ]

  const isAnswered =
    practice.answers[
      practice.currentIndex
    ] !== undefined

  return (
    <div className="practice-session-page">
      <div className="practice-session-container">

        <div className="practice-session-header">
          <h1>
            {analogy.analogyTitle} — Practice
          </h1>

          <p className="practice-session-world">
            {analogy.analogyWorld} analogy
          </p>
        </div>

        <div className="practice-session-content">

          {practice.error &&
            !practice.evalLoading && (
              <BannerError
                message={
                  practice.error
                }

                onDismiss={() =>
                  practice.clearError()
                }

                isDismissible={true}
              />
            )}

          <PracticeQuestion
            question={currentQuestion}

            questionNumber={
              practice.currentIndex + 1
            }

            totalQuestions={
              practice.questions.length
            }

            evaluation={
              currentEvaluation
            }

            isLoading={
              practice.evalLoading
            }

            isAnswered={
              isAnswered
            }

            onSubmit={
              handleSubmitAnswer
            }

            onNext={
              handleNext
            }

            error={
              practice.evalLoading
                ? null
                : practice.error
            }

            onRetry={
              practice.error
                ? handleRetryEvaluation
                : null
            }
          />

        </div>
      </div>
    </div>
  )
}
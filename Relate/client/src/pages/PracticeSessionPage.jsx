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

const sessionSaveStarted = useRef(false)

const lastSavedQuestionCount =
  useRef(0)

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

  const [analogy, setAnalogy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
    practice.state !== 'summary' ||
    !analogy
  ) {
    return
  }

  const questionCount =
    practice.questions.length

  if (
    questionCount <=
    lastSavedQuestionCount.current
  ) {
    return
  }

  if (sessionSaveStarted.current) {
    return
  }

  sessionSaveStarted.current = true

  handleSessionComplete()
    .then(() => {
      lastSavedQuestionCount.current =
        questionCount
    })
    .catch(() => {
      // Keep lastSavedQuestionCount unchanged
      // so the session can be retried.
    })
    .finally(() => {
      sessionSaveStarted.current = false
    })

}, [
  practice.state,
  practice.questions.length,
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

  // -------------------------------------------------------
  // This is a genuinely NEW practice session.
  // loadQuestions() uses SET_QUESTIONS, which clears
  // the old sessionId.
  // -------------------------------------------------------

  sessionSaveStarted.current = false
  lastSavedQuestionCount.current = 0

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
     * Exactly ONE /questions/more request.
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
     * IMPORTANT:
     *
     * Do NOT:
     * - reset sessionSaveStarted
     * - call loadQuestions()
     * - call setQuestions()
     *
     * Generate More belongs to the EXISTING session.
     */

    practice.appendQuestions(
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

   
  } catch (err) {
    console.error(
      'Failed to save practice session:',
      err
    )

    throw err
  }
}

  /**
   * Initial page loading.
   */
  if (loading) {
    return (
      <div className="practice-session-page">
        <div className="practice-canvas-decor" aria-hidden="true">
          <span className="canvas-ring canvas-ring-one" />
          <span className="canvas-ring canvas-ring-two" />
          <span className="canvas-dot canvas-dot-one" />
          <span className="canvas-dot canvas-dot-two" />
          <span className="canvas-star canvas-star-one">✦</span>
        </div>

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
        <div className="practice-canvas-decor" aria-hidden="true">
          <span className="canvas-ring canvas-ring-one" />
          <span className="canvas-dot canvas-dot-one" />
        </div>

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
        <div className="practice-canvas-decor" aria-hidden="true">
          <span className="canvas-ring canvas-ring-one" />
          <span className="canvas-ring canvas-ring-two" />
          <span className="canvas-star canvas-star-one">✦</span>
          <span className="canvas-zigzag" />
        </div>

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
      <div className="practice-session-page ">
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
    <div className="relative practice-session-page p-5 pl-10 pr-10">
 <div className="absolute -top-20 -left-20 w-48 h-48 bg-yellow-300 rounded-full opacity-25 blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-700 rounded-full opacity-20 blur-3xl"></div>
      <div className=" pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl "/>
      <div className=" pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl "/>
      <div className=" pointer-events-none absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-purple-800/35 blur-3xl "/>
        
      {/* =====================================================
          SINGLE OPEN CANVAS
      ===================================================== */}
      <div
        className="practice-canvas-decor"
        aria-hidden="true"
      >
        <span className="canvas-ring canvas-ring-one" />
        <span className="canvas-ring canvas-ring-two" />

        <span className="canvas-dot canvas-dot-one" />
        <span className="canvas-dot canvas-dot-two" />
        <span className="canvas-dot canvas-dot-three" />
        <span className="canvas-dot canvas-dot-four" />

        <span className="canvas-star canvas-star-one">
          ✦
        </span>

        <span className="canvas-star canvas-star-two">
          ✦
        </span>

        <span className="canvas-plus canvas-plus-one">
          +
        </span>

        <span className="canvas-plus canvas-plus-two">
          +
        </span>

        <span className="canvas-triangle">
          △
        </span>

        <span className="canvas-zigzag" />

        <svg
          className="canvas-constellation"
          viewBox="0 0 220 120"
          fill="none"
        >
          <path
            d="M15 72L70 25L118 55L174 18L208 66"
            stroke="#5424C7"
            strokeWidth="1.5"
            strokeDasharray="4 7"
          />

          <circle
            cx="15"
            cy="72"
            r="4"
            fill="#E47B62"
          />

          <circle
            cx="70"
            cy="25"
            r="4"
            fill="#FFD65A"
          />

          <circle
            cx="118"
            cy="55"
            r="4"
            fill="#4E9EA0"
          />

          <circle
            cx="174"
            cy="18"
            r="4"
            fill="#E47B62"
          />

          <circle
            cx="208"
            cy="66"
            r="4"
            fill="#5424C7"
          />
        </svg>
      </div>

      <div className="practice-session-container">

        {/* ===================================================
            HEADER
        =================================================== */}
        <div className="practice-session-header">

          <div className="practice-header-kicker">
            <span>Practice</span>

            <span className="practice-header-rule" />

            <span className="practice-header-note">
              Think • connect • remember
            </span>
          </div>

          <h1>
            {analogy.analogyTitle} — Practice
          </h1>

          <p className="practice-session-world">
            {analogy.analogyWorld} analogy
          </p>

          <svg
            aria-hidden="true"
            className="practice-header-underline"
            viewBox="0 0 260 20"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M3 12C45 4 88 17 128 9C170 1 214 7 257 10"
              stroke="#F0A23A"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
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
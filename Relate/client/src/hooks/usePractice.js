import { useReducer, useCallback, useRef } from 'react'

import * as practiceApi from '../api/practice.api'

const initialState = {
  state: 'idle',
  questions: [],
  currentIndex: 0,
  answers: [],
  evaluations: [],
  error: null,
  evalLoading: false,
}

const ACTIONS = {
  START_LOADING_QUESTIONS: 'START_LOADING_QUESTIONS',
  SET_QUESTIONS: 'SET_QUESTIONS',
  QUESTIONS_LOAD_ERROR: 'QUESTIONS_LOAD_ERROR',

  START_EVALUATING: 'START_EVALUATING',
  SET_EVALUATION: 'SET_EVALUATION',
  EVALUATION_TIMEOUT: 'EVALUATION_TIMEOUT',
  RETRY_EVALUATION: 'RETRY_EVALUATION',

  NEXT_QUESTION: 'NEXT_QUESTION',
  MOVE_TO_SUMMARY: 'MOVE_TO_SUMMARY',

  START_SAVING: 'START_SAVING',
  SESSION_SAVED: 'SESSION_SAVED',
  SESSION_SAVE_ERROR: 'SESSION_SAVE_ERROR',

  RESET_PRACTICE: 'RESET_PRACTICE',
  CLEAR_ERROR: 'CLEAR_ERROR',
}

function practiceReducer(state, action) {
  switch (action.type) {
    case ACTIONS.START_LOADING_QUESTIONS:
      return {
        ...initialState,
        state: 'loading_questions',
      }

    case ACTIONS.SET_QUESTIONS: {
      const questions = Array.isArray(action.payload)
        ? action.payload
        : []

      return {
        ...state,
        state: questions.length > 0
          ? 'questions_ready'
          : 'idle',
        questions,
        currentIndex: 0,
        answers: [],
        evaluations: [],
        error: null,
        evalLoading: false,
      }
    }

    case ACTIONS.QUESTIONS_LOAD_ERROR:
      return {
        ...state,
        state: 'idle',
        error: action.payload,
        evalLoading: false,
      }

    case ACTIONS.START_EVALUATING:
      return {
        ...state,
        state: 'evaluating',
        evalLoading: true,
        error: null,
      }

    case ACTIONS.SET_EVALUATION: {
      const updatedAnswers = [...state.answers]

      updatedAnswers[state.currentIndex] =
        action.payload.userAnswer

      const updatedEvaluations = [...state.evaluations]

      updatedEvaluations[state.currentIndex] = {
        ...action.payload.evaluation,
        userAnswer: action.payload.userAnswer,
        questionType: action.payload.questionType,
      }

      return {
        ...state,
        state: 'evaluated',
        answers: updatedAnswers,
        evaluations: updatedEvaluations,
        evalLoading: false,
        error: null,
      }
    }

    case ACTIONS.EVALUATION_TIMEOUT:
      return {
        ...state,
        state: 'evaluated',
        evalLoading: false,
        error: action.payload,
      }

    case ACTIONS.RETRY_EVALUATION:
      return {
        ...state,
        state: 'evaluating',
        evalLoading: true,
        error: null,
      }

    case ACTIONS.NEXT_QUESTION: {
      const nextIndex = state.currentIndex + 1

      const allAnswered =
        nextIndex >= state.questions.length

      return {
        ...state,
        currentIndex: nextIndex,
        state: allAnswered
          ? 'summary'
          : 'questions_ready',
        error: null,
      }
    }

    case ACTIONS.MOVE_TO_SUMMARY:
      return {
        ...state,
        state: 'summary',
        error: null,
      }

    case ACTIONS.START_SAVING:
      return {
        ...state,
        state: 'saving',
        error: null,
      }

    case ACTIONS.SESSION_SAVED:
      return {
        ...state,
        state: 'saved',
        error: null,
      }

    case ACTIONS.SESSION_SAVE_ERROR:
      return {
        ...state,
        state: 'save_error',
        error: action.payload,
      }

    case ACTIONS.RESET_PRACTICE:
      return {
        ...initialState,
        state: 'idle',
      }

    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }

    default:
      return state
  }
}

/**
 * Convert a multiple-choice answer into a user-friendly
 * display string.
 *
 * Supports:
 * - option-0
 * - A (Polling)
 * - Polling
 */
function formatAnswerForDisplay(question, userAnswer) {
  if (
    !question ||
    question.type !== 'multiple-choice'
  ) {
    return typeof userAnswer === 'string'
      ? userAnswer.trim()
      : ''
  }

  if (!Array.isArray(question.options)) {
    return typeof userAnswer === 'string'
      ? userAnswer.trim()
      : ''
  }

  const answer =
    typeof userAnswer === 'string'
      ? userAnswer.trim()
      : ''

  let index = -1

  const optionIdMatch =
    answer.match(/^option-(\d+)$/i)

  if (optionIdMatch) {
    index = Number(optionIdMatch[1])
  }

  const letterMatch =
    answer.match(/^([A-F])\s*\(/i)

  if (index < 0 && letterMatch) {
    index =
      letterMatch[1]
        .toUpperCase()
        .charCodeAt(0) - 65
  }

  if (index < 0) {
    index = question.options.findIndex(
      (option) =>
        typeof option?.text === 'string' &&
        option.text.trim().toLowerCase() ===
          answer.toLowerCase()
    )
  }

  if (
    index >= 0 &&
    index < question.options.length
  ) {
    const option = question.options[index]
    const letter = String.fromCharCode(65 + index)

    return `${letter} (${option.text})`
  }

  return answer
}

export function usePractice() {
  const [state, dispatch] = useReducer(
    practiceReducer,
    initialState
  )

  /**
   * Every question-generation operation gets
   * a unique ID.
   *
   * If an older request finishes after a newer
   * operation has started, its result is ignored.
   */
  const questionsRequestIdRef = useRef(0)

  /**
   * Generate a question set.
   *
   * This function does NOT automatically run.
   * PracticeSessionPage decides when it should
   * be called.
   */
  const loadQuestions = useCallback(
    async (analogyData) => {
      const requestId =
        ++questionsRequestIdRef.current

      dispatch({
        type: ACTIONS.START_LOADING_QUESTIONS,
      })

      try {
        const response =
          await practiceApi.generatePracticeQuestions({
            analogyId:
              analogyData?._id ||
              analogyData?.id,

            concept:
              analogyData?.concept,

            analogyWorld:
              analogyData?.analogyWorld,

            nodes:
              analogyData?.nodes,

            mappings:
              analogyData?.mappings,

            relationships:
              analogyData?.relationships,

            explanation:
              analogyData?.explanation,

            limitations:
              analogyData?.limitations,
          })

        /**
         * A newer question operation has started.
         * Never allow this older response to replace
         * the newer question set.
         */
        if (
          requestId !==
          questionsRequestIdRef.current
        ) {
          return response
        }

        const questions =
          Array.isArray(response?.questions)
            ? response.questions
            : []

        if (questions.length === 0) {
          const error = {
            message:
              'No practice questions were generated.',
          }

          dispatch({
            type: ACTIONS.QUESTIONS_LOAD_ERROR,
            payload: error,
          })

          throw new Error(error.message)
        }

        dispatch({
          type: ACTIONS.SET_QUESTIONS,
          payload: questions,
        })

        return response
      } catch (err) {
        /**
         * Ignore an error belonging to an old
         * generation request.
         */
        if (
          requestId !==
          questionsRequestIdRef.current
        ) {
          throw err
        }

        const errorMessage =
          err.response?.data?.error?.message ||
          err.message ||
          'Failed to load questions'

        dispatch({
          type: ACTIONS.QUESTIONS_LOAD_ERROR,
          payload: {
            message: errorMessage,
          },
        })

        throw err
      }
    },
    []
  )

  /**
   * Replace the current question set directly.
   *
   * Used by Generate More Questions.
   *
   * IMPORTANT:
   * This does NOT make an API request.
   */
  const setQuestions = useCallback(
    (questions) => {
      /**
       * Invalidate every currently running
       * question-generation request.
       */
      ++questionsRequestIdRef.current

      const nextQuestions =
        Array.isArray(questions)
          ? questions
          : []

      dispatch({
        type: ACTIONS.SET_QUESTIONS,
        payload: nextQuestions,
      })
    },
    []
  )

  const submitAnswer = useCallback(
    async (userAnswer) => {
      const currentQuestion =
        state.questions[state.currentIndex]

      if (!currentQuestion) {
        return
      }

      const displayAnswer =
        formatAnswerForDisplay(
          currentQuestion,
          userAnswer
        )

      dispatch({
        type: ACTIONS.START_EVALUATING,
      })

      try {
        const response =
          await practiceApi.evaluateAnswer({
            question: currentQuestion,
            userAnswer,
          })

        dispatch({
          type: ACTIONS.SET_EVALUATION,
          payload: {
            userAnswer: displayAnswer,
            evaluation: response.evaluation,
            questionType: currentQuestion.type,
          },
        })
      } catch (err) {
        const isTimeout =
          err.code === 'ECONNABORTED' ||
          err.message
            ?.toLowerCase()
            .includes('timeout')

      dispatch({
  type: ACTIONS.EVALUATION_TIMEOUT,
  payload: isTimeout
    ? 'Evaluation timed out. Please try again.'
    : err.response?.data?.error?.message ||
      'Failed to evaluate answer',
})

        throw err
      }
    },
    [
      state.questions,
      state.currentIndex,
    ]
  )

  const retryEvaluation = useCallback(
    async () => {
      const currentQuestion =
        state.questions[state.currentIndex]

      const userAnswer =
        state.answers[state.currentIndex]

      if (
        !currentQuestion ||
        !userAnswer
      ) {
        return
      }

      dispatch({
        type: ACTIONS.RETRY_EVALUATION,
      })

      try {
        const response =
          await practiceApi.evaluateAnswer({
            question: currentQuestion,
            userAnswer,
          })

        const displayAnswer =
          formatAnswerForDisplay(
            currentQuestion,
            userAnswer
          )

        dispatch({
          type: ACTIONS.SET_EVALUATION,
          payload: {
            userAnswer: displayAnswer,
            evaluation: response.evaluation,
            questionType: currentQuestion.type,
          },
        })
      } catch (err) {
        const isTimeout =
          err.code === 'ECONNABORTED' ||
          err.message
            ?.toLowerCase()
            .includes('timeout')

        dispatch({
          type: ACTIONS.EVALUATION_TIMEOUT,
          payload: {
            message: isTimeout
              ? 'Evaluation timed out. Please try again.'
              : err.response?.data?.error?.message ||
                'Failed to evaluate answer',
            dismissible: true,
          },
        })

        throw err
      }
    },
    [
      state.answers,
      state.currentIndex,
      state.questions,
    ]
  )

  const nextQuestion = useCallback(() => {
    if (
      state.currentIndex <
      state.questions.length - 1
    ) {
      dispatch({
        type: ACTIONS.NEXT_QUESTION,
      })

      return
    }

    dispatch({
      type: ACTIONS.MOVE_TO_SUMMARY,
    })
  }, [
    state.currentIndex,
    state.questions.length,
  ])

  const moveToNextQuestion =
    useCallback(() => {
      if (
        state.currentIndex <
        state.questions.length - 1
      ) {
        dispatch({
          type: ACTIONS.NEXT_QUESTION,
        })

        return {
          nextIndex:
            state.currentIndex + 1,
          allAnswered: false,
        }
      }

      dispatch({
        type: ACTIONS.MOVE_TO_SUMMARY,
      })

      return {
        allAnswered: true,
      }
    }, [
      state.currentIndex,
      state.questions.length,
    ])

  const calculateScore = useCallback(() => {
    if (state.questions.length === 0) {
      return 0
    }

    const correctCount =
      state.evaluations.filter(
        (evaluation) =>
          evaluation?.correct === true
      ).length

    return Math.round(
      (correctCount /
        state.questions.length) *
        100
    )
  }, [
    state.questions.length,
    state.evaluations,
  ])

  const getMisconceptions =
    useCallback(() => {
      return state.evaluations
        .map((evaluation, index) => ({
          questionIndex: index,

          misconception:
            evaluation?.misconception ||
            null,

          mappingLabel:
            state.questions[index]
              ?.mappingLabel || '',
        }))
        .filter(
          (item) => item.misconception
        )
    }, [
      state.evaluations,
      state.questions,
    ])

  const getMappingsByCorrectness =
    useCallback(() => {
      const understood = new Set()
      const struggled = new Set()

      state.evaluations.forEach(
        (evaluation, index) => {
          const mappingLabel =
            state.questions[index]
              ?.mappingLabel

          if (!mappingLabel) {
            return
          }

          if (evaluation?.correct) {
            understood.add(mappingLabel)
          } else {
            struggled.add(mappingLabel)
          }
        }
      )

      return {
        understood:
          Array.from(understood),

        struggled:
          Array.from(struggled),
      }
    }, [
      state.evaluations,
      state.questions,
    ])

  const savePracticeSession =
    useCallback(
      async (analogyId) => {
        dispatch({
          type: ACTIONS.START_SAVING,
        })

        try {
          const score =
            calculateScore()

          const misconceptions =
            getMisconceptions()

          const formattedAnswers =
            state.answers.map(
              (answer, index) => ({
                questionIndex: index,
                userAnswer: answer,
              })
            )

          const formattedEvaluations =
            state.evaluations.map(
              (evaluation, index) => ({
                questionIndex: index,
                ...evaluation,
              })
            )

          const response =
            await practiceApi.savePracticeSession(
              {
                analogyId,
                questions:
                  state.questions,
                answers:
                  formattedAnswers,
                evaluations:
                  formattedEvaluations,
                score,
                misconceptions,
                completedAt:
                  new Date().toISOString(),
              }
            )

          dispatch({
            type: ACTIONS.SESSION_SAVED,
          })

          return response.sessionId
        } catch (err) {
          const errorMessage =
            err.response?.data?.error?.message ||
            'Failed to save session'

          dispatch({
            type: ACTIONS.SESSION_SAVE_ERROR,
            payload: {
              message: errorMessage,
              showRetry: true,
            },
          })

          throw err
        }
      },
      [
        state.questions,
        state.answers,
        state.evaluations,
        calculateScore,
        getMisconceptions,
      ]
    )

  const retrySaveSession =
    useCallback(
      async (analogyId) => {
        dispatch({
          type: ACTIONS.START_SAVING,
        })

        try {
          const score =
            calculateScore()

          const misconceptions =
            getMisconceptions()

          const formattedAnswers =
            state.answers.map(
              (answer, index) => ({
                questionIndex: index,
                userAnswer: answer,
              })
            )

          const formattedEvaluations =
            state.evaluations.map(
              (evaluation, index) => ({
                questionIndex: index,
                ...evaluation,
              })
            )

          const response =
            await practiceApi.savePracticeSession(
              {
                analogyId,
                questions:
                  state.questions,
                answers:
                  formattedAnswers,
                evaluations:
                  formattedEvaluations,
                score,
                misconceptions,
                completedAt:
                  new Date().toISOString(),
              }
            )

          dispatch({
            type: ACTIONS.SESSION_SAVED,
          })

          return response.sessionId
        } catch (err) {
          const errorMessage =
            err.response?.data?.error?.message ||
            'Failed to save session'

          dispatch({
            type: ACTIONS.SESSION_SAVE_ERROR,
            payload: {
              message: errorMessage,
              showRetry: true,
            },
          })

          throw err
        }
      },
      [
        state.questions,
        state.answers,
        state.evaluations,
        calculateScore,
        getMisconceptions,
      ]
    )

  const resetPractice = useCallback(() => {
    /**
     * Invalidate any question-generation request
     * that is still running.
     */
    ++questionsRequestIdRef.current

    dispatch({
      type: ACTIONS.RESET_PRACTICE,
    })
  }, [])

  const clearError = useCallback(() => {
    dispatch({
      type: ACTIONS.CLEAR_ERROR,
    })
  }, [])

  return {
    state: state.state,

    questions:
      state.questions,

    currentIndex:
      state.currentIndex,

    answers:
      state.answers,

    evaluations:
      state.evaluations,

    error:
      state.error,

    evalLoading:
      state.evalLoading,

    loadQuestions,
    setQuestions,

    submitAnswer,
    retryEvaluation,

    nextQuestion,
    moveToNextQuestion,

    calculateScore,
    getMappingsByCorrectness,

    savePracticeSession,
    retrySaveSession,

    resetPractice,
    clearError,
  }
}
import { useCallback, useReducer } from 'react'

import * as practiceApi from '../api/practice.api'


// =========================================================
// INITIAL STATE
// =========================================================

const initialState = {
  state: 'idle',

  // Current complete question set for this practice session.
  questions: [],

  currentIndex: 0,

  // Answers/evaluations use the same question indexes.
  answers: [],
  evaluations: [],

  error: null,
  evalLoading: false,

  // IMPORTANT:
  // null  = this is a brand-new practice session
  // value = this practice session has already been created
  //         and Generate More must update that same session.
  sessionId: null,
}


// =========================================================
// ACTIONS
// =========================================================

const ACTIONS = {
  LOAD_QUESTIONS: 'LOAD_QUESTIONS',
  SET_QUESTIONS: 'SET_QUESTIONS',
  APPEND_QUESTIONS: 'APPEND_QUESTIONS',

  SET_ANSWER: 'SET_ANSWER',
  SET_EVALUATION: 'SET_EVALUATION',

  NEXT_QUESTION: 'NEXT_QUESTION',

  EVALUATION_LOADING: 'EVALUATION_LOADING',

  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',

  SESSION_SAVING: 'SESSION_SAVING',
  SESSION_SAVED: 'SESSION_SAVED',
  SESSION_SAVE_ERROR: 'SESSION_SAVE_ERROR',

  SET_SESSION_ID:'SET_SESSION_ID',

  RESET: 'RESET',
}


// =========================================================
// REDUCER
// =========================================================

function reducer(state, action) {
  switch (action.type) {

    // -------------------------------------------------------
    // NEW PRACTICE SESSION
    // -------------------------------------------------------
    case ACTIONS.SET_QUESTIONS:
      return {
        ...state,

        state: 'questions_ready',

        questions: Array.isArray(action.questions)
          ? action.questions
          : [],

        currentIndex: 0,

        answers: [],
        evaluations: [],

        error: null,
        evalLoading: false,

        // CRITICAL:
        // SET_QUESTIONS represents a genuinely NEW practice.
        // Therefore the previous session ID must be removed.
        sessionId: null,
      }


    // -------------------------------------------------------
    // GENERATE MORE
    // -------------------------------------------------------
    case ACTIONS.APPEND_QUESTIONS: {
      const existingQuestions = Array.isArray(state.questions)
        ? state.questions
        : []

      const newQuestions = Array.isArray(action.questions)
        ? action.questions
        : []

      if (newQuestions.length === 0) {
        return state
      }

      return {
        ...state,

        state: 'questions_ready',

        // Keep ALL old questions and append the new ones.
        questions: [
          ...existingQuestions,
          ...newQuestions,
        ],

        // IMPORTANT:
        // Start exactly where the old question set ended.
        currentIndex: existingQuestions.length,

        // Do NOT reset old answers.
        answers: state.answers,

        // Do NOT reset old evaluations.
        evaluations: state.evaluations,

        error: null,
        evalLoading: false,

        // IMPORTANT:
        // Keep the existing session ID.
        sessionId: state.sessionId,
      }
    }


    // -------------------------------------------------------
    // SET ANSWER
    // -------------------------------------------------------
    case ACTIONS.SET_ANSWER: {
      const answers = [...state.answers]

      answers[action.index] = {
        questionIndex: action.index,
        userAnswer: action.userAnswer,
      }

      return {
        ...state,
        answers,
      }
    }


    // -------------------------------------------------------
    // SET EVALUATION
    // -------------------------------------------------------
    case ACTIONS.SET_EVALUATION: {
      const evaluations = [...state.evaluations]

      evaluations[action.index] = {
        questionIndex: action.index,
        ...action.evaluation,
      }

      return {
        ...state,
        evaluations,
      }
    }


    // -------------------------------------------------------
    // NEXT QUESTION
    // -------------------------------------------------------
    case ACTIONS.NEXT_QUESTION: {
      const lastQuestion =
        state.currentIndex >= state.questions.length - 1

      if (lastQuestion) {
        return {
          ...state,
          state: 'summary',
          evalLoading: false,
        }
      }

      return {
        ...state,
        currentIndex: state.currentIndex + 1,
        evalLoading: false,
        error: null,
      }
    }


    // -------------------------------------------------------
    // EVALUATION LOADING
    // -------------------------------------------------------
    case ACTIONS.EVALUATION_LOADING:
      return {
        ...state,
        evalLoading: action.loading,
      }


    // -------------------------------------------------------
    // ERROR
    // -------------------------------------------------------
    case ACTIONS.SET_ERROR:
      return {
        ...state,
        state: action.state || state.state,
        error: action.error,
        evalLoading: false,
      }


    case ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      }


    // -------------------------------------------------------
    // SESSION SAVING
    // -------------------------------------------------------
    case ACTIONS.SESSION_SAVING:
      return {
        ...state,
        state: 'saving',
        error: null,
      }


    // -------------------------------------------------------
    // SESSION SAVED
    // -------------------------------------------------------
    case ACTIONS.SESSION_SAVED:
      return {
        ...state,
        state: 'saved',
        sessionId:
          action.sessionId || state.sessionId,
        error: null,
      }


    // -------------------------------------------------------
    // SESSION SAVE ERROR
    // -------------------------------------------------------
    case ACTIONS.SESSION_SAVE_ERROR:
      return {
        ...state,
        state: 'save_error',
        error: action.error,
      }


    // -------------------------------------------------------
    // SET SESSION ID
    // -------------------------------------------------------
    case ACTIONS.SET_SESSION_ID:
      return {
        ...state,
        sessionId: action.sessionId || null,
      }


    // -------------------------------------------------------
    // RESET EVERYTHING
    // -------------------------------------------------------
    case ACTIONS.RESET:
      return {
        ...initialState,
      }


    default:
      return state
  }
}


// =========================================================
// HOOK
// =========================================================

export function usePractice() {
  const [state, dispatch] = useReducer(
    reducer,
    initialState
  )


  // =======================================================
  // LOAD QUESTIONS
  // =======================================================

  const loadQuestions = useCallback(
    async (analogyData) => {
      if (!analogyData) {
        throw new Error('Analogy data is required.')
      }

      dispatch({
        type: ACTIONS.LOAD_QUESTIONS,
      })

      dispatch({
        type: ACTIONS.SET_ERROR,
        error: null,
      })

      try {
        const response =
          await practiceApi.generatePracticeQuestions({
            analogyId:
              analogyData._id ||
              analogyData.id,

            concept:
              analogyData.concept,

            analogyWorld:
              analogyData.analogyWorld,

            nodes:
              analogyData.nodes,

            mappings:
              analogyData.mappings,

            relationships:
              analogyData.relationships,

            explanation:
              analogyData.explanation,

            limitations:
              analogyData.limitations,
          })

        const questions =
          Array.isArray(response?.questions)
            ? response.questions
            : []

        if (questions.length === 0) {
          throw new Error(
            'No practice questions were generated.'
          )
        }

        // SET_QUESTIONS deliberately creates a NEW session.
        dispatch({
          type: ACTIONS.SET_QUESTIONS,
          questions,
        })

        return questions
      } catch (err) {
        const message =
          err.response?.data?.error?.message ||
          err.message ||
          'Failed to generate practice questions.'

        dispatch({
          type: ACTIONS.SET_ERROR,
          state: 'error',
          error: message,
        })

        throw err
      }
    },
    []
  )


  // =======================================================
  // APPEND GENERATED QUESTIONS
  // =======================================================

  const appendQuestions = useCallback(
    (questions) => {
      if (
        !Array.isArray(questions) ||
        questions.length === 0
      ) {
        return
      }

      dispatch({
        type: ACTIONS.APPEND_QUESTIONS,
        questions,
      })
    },
    []
  )


  // =======================================================
  // SET QUESTIONS
  //
  // Kept for compatibility.
  // It now ALWAYS means "new practice".
  // =======================================================

  const setQuestions = useCallback(
    (questions) => {
      dispatch({
        type: ACTIONS.SET_QUESTIONS,
        questions,
      })
    },
    []
  )


  // =======================================================
  // SUBMIT ANSWER
  // =======================================================

  const submitAnswer = useCallback(
    async (userAnswer) => {
      const index = state.currentIndex
      const question = state.questions[index]

      if (!question) {
        throw new Error(
          'Current practice question not found.'
        )
      }

      // Store answer locally first.
      dispatch({
        type: ACTIONS.SET_ANSWER,
        index,
        userAnswer,
      })

      dispatch({
        type: ACTIONS.EVALUATION_LOADING,
        loading: true,
      })

      dispatch({
        type: ACTIONS.CLEAR_ERROR,
      })

      try {
        const response =
          await practiceApi.evaluatePracticeAnswer({
            question,
            userAnswer,
          })

        const evaluation =
          response?.evaluation ||
          response

        dispatch({
          type: ACTIONS.SET_EVALUATION,
          index,
          evaluation,
        })

        dispatch({
          type: ACTIONS.EVALUATION_LOADING,
          loading: false,
        })

        return evaluation
      } catch (err) {
        const message =
          err.response?.data?.error?.message ||
          err.message ||
          'Failed to evaluate answer.'

        dispatch({
          type: ACTIONS.SET_ERROR,
          error: message,
        })

        throw err
      }
    },
    [
      state.currentIndex,
      state.questions,
    ]
  )


  // =======================================================
  // MOVE TO NEXT QUESTION
  // =======================================================

  const moveToNextQuestion = useCallback(() => {
    dispatch({
      type: ACTIONS.NEXT_QUESTION,
    })
  }, [])


  // =======================================================
  // RETRY EVALUATION
  // =======================================================

  const retryEvaluation = useCallback(
    async () => {
      const index = state.currentIndex
      const answer = state.answers[index]
      const question = state.questions[index]

      if (!question || !answer) {
        throw new Error(
          'Question or previous answer not found.'
        )
      }

      dispatch({
        type: ACTIONS.EVALUATION_LOADING,
        loading: true,
      })

      dispatch({
        type: ACTIONS.CLEAR_ERROR,
      })

      try {
        const response =
          await practiceApi.evaluatePracticeAnswer({
            question,
            userAnswer: answer.userAnswer,
          })

        const evaluation =
          response?.evaluation ||
          response

        dispatch({
          type: ACTIONS.SET_EVALUATION,
          index,
          evaluation,
        })

        dispatch({
          type: ACTIONS.EVALUATION_LOADING,
          loading: false,
        })

        return evaluation
      } catch (err) {
        const message =
          err.response?.data?.error?.message ||
          err.message ||
          'Failed to retry evaluation.'

        dispatch({
          type: ACTIONS.SET_ERROR,
          error: message,
        })

        throw err
      }
    },
    [
      state.currentIndex,
      state.answers,
      state.questions,
    ]
  )


  // =======================================================
  // SCORE
  // =======================================================

  const calculateScore = useCallback(() => {
    const total =
      state.questions.length

    if (total === 0) {
      return 0
    }

    const correctCount =
      state.evaluations.filter(
        (evaluation) =>
          evaluation?.correct === true
      ).length

    return Math.round(
      (correctCount / total) * 100
    )
  }, [state.questions, state.evaluations])


  // =======================================================
  // MISCONCEPTIONS
  // =======================================================

  const getMisconceptions = useCallback(() => {
    return state.evaluations
      .filter(
        (evaluation) =>
          evaluation?.correct === false &&
          evaluation?.misconception
      )
      .map(
        (evaluation) =>
          evaluation.misconception
      )
  }, [state.evaluations])


  // =======================================================
  // MAPPINGS BY CORRECTNESS
  // =======================================================

  const getMappingsByCorrectness = useCallback(() => {
    const understood = []
    const struggled = []

    state.evaluations.forEach(
      (evaluation) => {
        if (!evaluation?.mappingLabel) {
          return
        }

        if (evaluation.correct) {
          understood.push(
            evaluation.mappingLabel
          )
        } else {
          struggled.push(
            evaluation.mappingLabel
          )
        }
      }
    )

    return {
      understood: [
        ...new Set(understood),
      ],

      struggled: [
        ...new Set(struggled),
      ],
    }
  }, [state.evaluations])


  // =======================================================
  // SAVE SESSION
  // =======================================================

  const savePracticeSession = useCallback(
    async (analogyId) => {
      if (!analogyId) {
        throw new Error(
          'Analogy ID is required to save a practice session.'
        )
      }

      if (state.questions.length === 0) {
        throw new Error(
          'Cannot save an empty practice session.'
        )
      }

      dispatch({
        type: ACTIONS.SESSION_SAVING,
      })

      const formattedAnswers =
        state.answers
          .filter(Boolean)
          .map((answer, index) => ({
            questionIndex:
              Number.isInteger(
                answer?.questionIndex
              )
                ? answer.questionIndex
                : index,

            userAnswer:
              answer?.userAnswer ?? '',
          }))

      const formattedEvaluations =
        state.evaluations
          .filter(Boolean)
          .map((evaluation, index) => ({
            questionIndex:
              Number.isInteger(
                evaluation?.questionIndex
              )
                ? evaluation.questionIndex
                : index,

            correct:
              evaluation?.correct === true,

            feedback:
              evaluation?.feedback || '',

            correctAnswer:
              evaluation?.correctAnswer || '',

            explanation:
              evaluation?.explanation || '',

            mappingLabel:
              evaluation?.mappingLabel || '',

            encouragement:
              evaluation?.encouragement || '',

            misconception:
              evaluation?.misconception || null,
          }))

      const score = calculateScore()

      const misconceptions =
        getMisconceptions()

      try {
        // ---------------------------------------------------
        // FIRST COMPLETION
        //
        // No session ID means this is a brand-new session.
        // POST creates a new Mongo document.
        // ---------------------------------------------------

        if (!state.sessionId) {
          const response =
            await practiceApi.savePracticeSession({
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
            })

          const sessionId =
            response?.sessionId ||
            response?.session?._id ||
            response?.session?._id?.toString()

          if (!sessionId) {
            throw new Error(
              'Practice session was saved but no session ID was returned.'
            )
          }

          dispatch({
            type: ACTIONS.SESSION_SAVED,
            sessionId,
          })

          return sessionId
        }


        // ---------------------------------------------------
        // GENERATE MORE COMPLETION
        //
        // Existing session ID means:
        // UPDATE THE SAME SESSION.
        // ---------------------------------------------------

        const response =
          await practiceApi.updatePracticeSession(
            state.sessionId,
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

        const sessionId =
          response?.sessionId ||
          state.sessionId

        dispatch({
          type: ACTIONS.SESSION_SAVED,
          sessionId,
        })

        return sessionId

      } catch (err) {
        const message =
          err.response?.data?.error?.message ||
          err.message ||
          'Failed to save practice session.'

        dispatch({
          type: ACTIONS.SESSION_SAVE_ERROR,
          error: message,
        })

        throw err
      }
    },
    [
      state.questions,
      state.answers,
      state.evaluations,
      state.sessionId,
      calculateScore,
      getMisconceptions,
    ]
  )


  // =======================================================
  // RETRY SAVE
  // =======================================================

  const retrySaveSession = useCallback(
    async (analogyId) => {
      // Use the exact same save logic.
      return savePracticeSession(
        analogyId
      )
    },
    [savePracticeSession]
  )


  // =======================================================
  // CLEAR ERROR
  // =======================================================

  const clearError = useCallback(() => {
    dispatch({
      type: ACTIONS.CLEAR_ERROR,
    })
  }, [])


  // =======================================================
  // RESET PRACTICE
  // =======================================================

  const resetPractice = useCallback(() => {
    dispatch({
      type: ACTIONS.RESET,
    })
  }, [])


  // =======================================================
  // RETURN
  // =======================================================

  return {
    ...state,

    loadQuestions,

    setQuestions,

    appendQuestions,

    submitAnswer,

    moveToNextQuestion,

    retryEvaluation,

    calculateScore,

    getMisconceptions,

    getMappingsByCorrectness,

    savePracticeSession,

    retrySaveSession,

    clearError,

    resetPractice,
  }
}
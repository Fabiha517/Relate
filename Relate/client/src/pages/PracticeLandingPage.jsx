import { useState, useEffect } from 'react'

import { useAuth } from '../hooks/useAuth'
import ConfirmModal from '../components/ui/ConfirmModal'
import * as libraryApi from '../api/library.api'
import * as practiceApi from '../api/practice.api'

import PracticeLanding from '../components/practice/PracticeLanding'

import LoadingSpinner from '../components/ui/LoadingSpinner'
import BannerError from '../components/ui/BannerError'

export default function PracticeLandingPage() {
  const { user } = useAuth()

  const [analogies, setAnalogies] = useState([])
  const [practiceHistory, setPracticeHistory] = useState([])
const [sessionToDelete, setSessionToDelete] = useState(null)
const [isDeletingSession, setIsDeletingSession] = useState(false)
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(true)

  const [error, setError] = useState(null)
  const [historyError, setHistoryError] = useState(null)

  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    async function fetchPracticeData() {
      if (!user) return

      setLoading(true)
      setHistoryLoading(true)

      setError(null)
      setHistoryError(null)

      try {
        const response = await libraryApi.getLibrary()

        setAnalogies(response.analogies || [])
      } catch (err) {
        console.error('Failed to fetch practice library:', err)

        setError(
          'Failed to load your analogies. Please try again.'
        )
      } finally {
        setLoading(false)
      }

      try {
        const response = await practiceApi.getPracticeHistory()

        console.log('=== PRACTICE HISTORY ===')
        console.log(response)

        setPracticeHistory(response.sessions || [])
      } catch (err) {
        console.error(
          'Failed to fetch practice history:',
          err
        )

        setHistoryError(
          'Failed to load your practice history.'
        )
      } finally {
        setHistoryLoading(false)
      }
    }

    fetchPracticeData()
  }, [user, retryCount])

  function handleRetry() {
    setRetryCount((prev) => prev + 1)
  }

  function handleReviewSession(session) {
    if (!session?.analogyId || !session?.sessionId) {
      return
    }

    window.location.href =
      `/practice/${session.analogyId}/session/${session.sessionId}`
  }
function handleDeleteSession(session) {
  if (!session?.sessionId) {
    return
  }

  setSessionToDelete(session)
}

async function handleConfirmDeleteSession() {
  if (!sessionToDelete?.sessionId) {
    return
  }

  const deletedSessionId = sessionToDelete.sessionId
  const sessionBeingDeleted = sessionToDelete

  // Remove immediately from UI
  setPracticeHistory((prev) =>
    prev.filter(
      (session) =>
        session.sessionId !== deletedSessionId
    )
  )

  setSessionToDelete(null)
  setIsDeletingSession(true)

  try {
    await practiceApi.deletePracticeSession(
      deletedSessionId
    )
  } catch (err) {
    console.error(
      'Failed to delete practice session:',
      err
    )

    // Put it back if server deletion failed
    setPracticeHistory((prev) => {
      if (
        prev.some(
          (session) =>
            session.sessionId === deletedSessionId
        )
      ) {
        return prev
      }

      return [...prev, sessionBeingDeleted]
    })

    setHistoryError(
      err.response?.data?.error?.message ||
      err.message ||
      'Failed to delete practice session. Please try again.'
    )
  } finally {
    setIsDeletingSession(false)
  }
}
  return (
    <div className="relative min-h-full w-full overflow-hidden bg-[#F7F0E3] text-[#14213D]">
<div className="absolute -top-20 -left-20 w-48 h-48 bg-yellow-300 rounded-full opacity-25 blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-700 rounded-full opacity-20 blur-3xl"></div>
      <div className=" pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl "/>
      <div className=" pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl "/>


      {/* =========================================================
          ONE SINGLE VISUAL CANVAS
      ========================================================= */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >

        {/* -------------------------------------------------------
            SOFT COLOR ATMOSPHERE
        ------------------------------------------------------- */}

        <div className="absolute -left-32 top-24 h-80 w-80 rounded-full bg-[#FFD65A]/16 blur-3xl" />

        <div className="absolute right-[-100px] top-16 h-96 w-96 rounded-full bg-[#8DD8D0]/16 blur-3xl" />

        <div className="absolute left-[42%] top-[42%] h-80 w-80 rounded-full bg-[#B9A7F5]/10 blur-3xl" />

        <div className="absolute bottom-[-140px] right-[25%] h-96 w-96 rounded-full bg-[#E47B62]/8 blur-3xl" />


        {/* -------------------------------------------------------
            SUBTLE PAPER DOT FIELD
        ------------------------------------------------------- */}

        <svg
          className="absolute right-0 top-0 h-[520px] w-[520px] opacity-[0.18]"
          viewBox="0 0 520 520"
          fill="none"
        >
          <defs>
            <pattern
              id="practicePageDots"
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <circle
                cx="2"
                cy="2"
                r="1.25"
                fill="#5424C7"
              />
            </pattern>
          </defs>

          <rect
            width="520"
            height="520"
            fill="url(#practicePageDots)"
          />
        </svg>


        {/* -------------------------------------------------------
            LEFT NESTED ORBIT
        ------------------------------------------------------- */}

        <div className="absolute left-[-35px] top-[18%] h-56 w-56 animate-[practiceFloat_9s_ease-in-out_infinite]">

          <div className="absolute inset-0 rounded-full border border-dashed border-[#5424C7]/20" />

          <div className="absolute inset-8 rounded-full border-2 border-[#F0A23A]/25" />

          <div className="absolute inset-16 rounded-full border border-dashed border-[#E47B62]/30" />

          <span className="absolute right-8 top-7 h-3 w-3 rounded-full bg-[#E47B62]" />

          <span className="absolute bottom-8 left-16 h-2.5 w-2.5 rounded-full bg-[#4E9EA0]" />

        </div>


        {/* -------------------------------------------------------
            RIGHT LARGE ORBIT
        ------------------------------------------------------- */}

        <div className="absolute -right-24 top-[15%] h-[460px] w-[460px]">

          <div className="absolute inset-0 rounded-full border border-dashed border-[#5424C7]/15 animate-[practiceOrbit_34s_linear_infinite]" />

          <div className="absolute inset-10 rounded-full border border-[#F0A23A]/15 animate-[practiceOrbitReverse_28s_linear_infinite]" />

          <div className="absolute inset-20 rounded-full border border-dashed border-[#4E9EA0]/15" />

          <span className="absolute left-[22%] top-5 h-4 w-4 rounded-full bg-[#E47B62] animate-[practiceFloat_7s_ease-in-out_infinite]" />

          <span className="absolute right-[25%] top-[40%] h-3 w-3 rounded-full bg-[#4E9EA0] animate-[practiceFloatReverse_8s_ease-in-out_infinite]" />

          <span className="absolute bottom-[17%] left-[35%] h-3 w-3 rounded-full bg-[#F0A23A] animate-[practiceFloat_6s_ease-in-out_infinite]" />

        </div>


        {/* -------------------------------------------------------
            CONSTELLATION
        ------------------------------------------------------- */}

        <svg
          className="absolute left-[43%] top-[8%] h-28 w-48 animate-[practiceFloatReverse_10s_ease-in-out_infinite] opacity-60"
          viewBox="0 0 190 110"
          fill="none"
        >
          <path
            d="M12 70 L52 28 L91 59 L130 18 L175 52"
            stroke="#8A68D8"
            strokeWidth="1.2"
            strokeDasharray="3 6"
          />

          <path
            d="M52 28 L91 59 L130 18"
            stroke="#4E9EA0"
            strokeWidth="1"
            strokeDasharray="2 6"
          />

          <circle
            cx="52"
            cy="28"
            r="3"
            fill="#E47B62"
          />

          <circle
            cx="91"
            cy="59"
            r="3"
            fill="#4E9EA0"
          />

          <circle
            cx="130"
            cy="18"
            r="3"
            fill="#F0A23A"
          />

          <circle
            cx="175"
            cy="52"
            r="3"
            fill="#5424C7"
          />

          <path
            d="M12 70 l3 7 l7 3 l-7 3 l-3 7 l-3-7 l-7-3 l7-3 z"
            fill="#F0A23A"
          />

          <path
            d="M130 6 l2.5 6 l6 2.5 l-6 2.5 l-2.5 6 l-2.5-6 l-6-2.5 l6-2.5 z"
            fill="#5424C7"
          />
        </svg>
 <svg
          className="absolute left-[46%] top-[2%] h-28 w-48 animate-[practiceFloatReverse_10s_ease-in-out_infinite] opacity-60"
          viewBox="0 0 190 110"
          fill="none"
        >
          <path
            d="M12 70 L52 28 L91 59 L130 18 L175 52"
            stroke="#8A68D8"
            strokeWidth="1.2"
            strokeDasharray="3 6"
          />

          <path
            d="M52 28 L91 59 L130 18"
            stroke="#4E9EA0"
            strokeWidth="1"
            strokeDasharray="2 6"
          />

          <circle
            cx="52"
            cy="28"
            r="3"
            fill="#E47B62"
          />

          <circle
            cx="91"
            cy="59"
            r="3"
            fill="#4E9EA0"
          />

          <circle
            cx="130"
            cy="18"
            r="3"
            fill="#F0A23A"
          />

          <circle
            cx="175"
            cy="52"
            r="3"
            fill="#5424C7"
          />

          <path
            d="M12 70 l3 7 l7 3 l-7 3 l-3 7 l-3-7 l-7-3 l7-3 z"
            fill="#F0A23A"
          />

          <path
            d="M130 6 l2.5 6 l6 2.5 l-6 2.5 l-2.5 6 l-2.5-6 l-6-2.5 l6-2.5 z"
            fill="#5424C7"
          />
        </svg>


        {/* -------------------------------------------------------
            LEFT ZIGZAG
        ------------------------------------------------------- */}

        <svg
          className="absolute left-[4%] top-[48%] h-24 w-32 animate-[practiceFloat_8s_ease-in-out_infinite] opacity-55"
          viewBox="0 0 130 90"
          fill="none"
        >
          <path
            d="M5 64 L23 40 L40 57 L57 24 L76 44 L96 12 L124 30"
            stroke="#5424C7"
            strokeWidth="2"
            strokeDasharray="5 7"
            strokeLinecap="round"
          />
        </svg>
          <svg
          className="absolute left-[5%] top-[45%] h-24 w-32 animate-[practiceFloat_8s_ease-in-out_infinite] opacity-55"
          viewBox="0 0 130 90"
          fill="none"
        >
          <path
            d="M5 64 L23 40 L40 57 L57 24 L76 44 L96 12 L124 30"
            stroke="#5424C7"
            strokeWidth="2"
            strokeDasharray="5 7"
            strokeLinecap="round"
          />
        </svg>


        {/* -------------------------------------------------------
            RIGHT ZIGZAG
        ------------------------------------------------------- */}

        <svg
          className="absolute right-[4%] top-[54%] hidden h-28 w-36 animate-[practiceFloatReverse_9s_ease-in-out_infinite] opacity-50 lg:block"
          viewBox="0 0 140 100"
          fill="none"
        >
          <path
            d="M4 24 L23 47 L41 27 L59 69 L78 42 L98 76 L136 16"
            stroke="#E47B62"
            strokeWidth="2"
            strokeDasharray="4 7"
            strokeLinecap="round"
          />
        </svg>
  <svg
          className="absolute right-[6%] top-[50%] hidden h-28 w-36 animate-[practiceFloatReverse_9s_ease-in-out_infinite] opacity-50 lg:block"
          viewBox="0 0 140 100"
          fill="none"
        >
          <path
            d="M4 24 L23 47 L41 27 L59 69 L78 42 L98 76 L136 16"
            stroke="#E47B62"
            strokeWidth="2"
            strokeDasharray="4 7"
            strokeLinecap="round"
          />
        </svg>


        {/* -------------------------------------------------------
            FLOATING TRIANGLE
        ------------------------------------------------------- */}

        <svg
          className="absolute left-[18%] top-[30%] h-14 w-14 animate-[practiceFloatReverse_7s_ease-in-out_infinite] opacity-55"
          viewBox="0 0 60 60"
          fill="none"
        >
          <path
            d="M30 5 L55 50 L5 50 Z"
            stroke="#4E9EA0"
            strokeWidth="2"
            strokeDasharray="4 5"
          />
        </svg>


        {/* -------------------------------------------------------
            SECOND TRIANGLE
        ------------------------------------------------------- */}

        <svg
          className="absolute right-[21%] top-[34%] h-16 w-16 animate-[practiceFloat_8s_ease-in-out_infinite] opacity-50"
          viewBox="0 0 60 60"
          fill="none"
        >
          <path
            d="M30 5 L55 50 L5 50 Z"
            stroke="#F0A23A"
            strokeWidth="2"
          />

          <path
            d="M30 17 L43 40 L17 40 Z"
            stroke="#E47B62"
            strokeWidth="1.5"
            strokeDasharray="3 4"
          />
        </svg>


        {/* -------------------------------------------------------
            FLOATING DOTS
        ------------------------------------------------------- */}

        <span className="absolute left-[26%] top-[18%] h-2.5 w-2.5 rounded-full bg-[#E47B62] animate-[practiceFloat_5s_ease-in-out_infinite]" />

        <span className="absolute left-[67%] top-[12%] h-3 w-3 rounded-full bg-[#4E9EA0] animate-[practiceFloatReverse_6s_ease-in-out_infinite]" />

        <span className="absolute left-[13%] top-[70%] h-2 w-2 rounded-full bg-[#5424C7] animate-[practiceFloat_7s_ease-in-out_infinite]" />

        <span className="absolute right-[14%] top-[76%] h-3 w-3 rounded-full bg-[#F0A23A] animate-[practiceFloatReverse_7s_ease-in-out_infinite]" />


        {/* -------------------------------------------------------
            LITTLE PLUS MARKS
        ------------------------------------------------------- */}

        <span className="absolute left-[28%] top-[64%] text-2xl font-light text-[#E47B62]/50 animate-[practiceFloat_8s_ease-in-out_infinite]">
          +
        </span>

        <span className="absolute right-[28%] top-[68%] text-2xl font-light text-[#5424C7]/45 animate-[practiceFloatReverse_8s_ease-in-out_infinite]">
          +
        </span>


        {/* -------------------------------------------------------
            BOTTOM CONNECTION ARC
        ------------------------------------------------------- */}

        <svg
          className="absolute bottom-[-50px] left-1/2 h-40 w-[650px] -translate-x-1/2 opacity-25"
          viewBox="0 0 650 160"
          fill="none"
        >
          <path
            d="M20 130 C160 0 490 0 630 130"
            stroke="#5424C7"
            strokeWidth="1.5"
            strokeDasharray="6 9"
          />

          <path
            d="M110 140 C210 50 440 50 540 140"
            stroke="#4E9EA0"
            strokeWidth="1"
            strokeDasharray="3 8"
          />
        </svg>

      </div>


      {/* =========================================================
          ERROR
      ========================================================= */}

      {error && (
        <div className="relative z-30 mx-auto w-full max-w-7xl px-5 pt-4 sm:px-8 lg:px-12">
          <BannerError
            message={error}
            onDismiss={() => setError(null)}
            onRetry={handleRetry}
            isDismissible={true}
          />
        </div>
      )}


      {/* =========================================================
          CONTENT
          No second background.
          No second canvas.
          No nested cream layer.
      ========================================================= */}

      {loading && analogies.length === 0 ? (

        <div className="relative z-10 flex min-h-[65vh] items-center justify-center">

          <div className="relative flex flex-col items-center">

            <div className="absolute -inset-12 animate-[practiceOrbit_14s_linear_infinite]">
              <span className="absolute left-1/2 top-0 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-[#F0A23A]" />
              <span className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-[#4E9EA0]" />
              <span className="absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[#E47B62]" />
            </div>

            <div className="relative h-20 w-20">

              <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-[#DDD5EA] border-t-[#5424C7]" />

              <div className="absolute inset-3 rounded-full border border-dashed border-[#E47B62]/50 animate-[practiceOrbitReverse_8s_linear_infinite]" />

              <div className="absolute inset-5 flex items-center justify-center rounded-full bg-[#FFFDF7]/80">
                <span className="text-lg text-[#5424C7]">
                  ✦
                </span>
              </div>

            </div>

            <p className="mt-6 text-xs font-black uppercase tracking-[0.16em] text-[#85808D]">
              Gathering your trail
            </p>

          </div>

        </div>

      ) : (

        <main className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-5 sm:px-8 lg:px-12">

          <PracticeLanding
            sessions={practiceHistory}
            onReviewSession={handleReviewSession}
              onDeleteSession={handleDeleteSession}
          />

        </main>

      )}


      {/* =========================================================
          HISTORY ERROR
      ========================================================= */}

      {historyError && (
        <div className="relative z-30 mx-auto w-full max-w-7xl px-5 pb-5 sm:px-8 lg:px-12">
          <BannerError
            message={historyError}
            onDismiss={() => setHistoryError(null)}
            onRetry={handleRetry}
            isDismissible={true}
          />
        </div>
      )}


      {/* =========================================================
          HISTORY LOADING
      ========================================================= */}

      {historyLoading && !loading && (
        <div className="relative z-30 mx-auto flex w-full max-w-7xl justify-center px-5 pb-8 sm:px-8 lg:px-12">

          <div className="relative">

            <div className="absolute -inset-5 animate-[practiceOrbit_10s_linear_infinite] rounded-full border border-dashed border-[#5424C7]/20" />

            <LoadingSpinner />

          </div>

        </div>
      )}

<ConfirmModal
  isOpen={Boolean(sessionToDelete)}
  title="Delete practice session?"
  message={
    sessionToDelete
      ? `This will permanently remove your practice session for "${sessionToDelete.analogyTitle || 'this analogy'}".`
      : ''
  }
  confirmLabel={
    isDeletingSession
      ? 'Deleting...'
      : 'Delete session'
  }
  cancelLabel="Keep session"
  confirmVariant="danger"
  onConfirm={handleConfirmDeleteSession}
  onCancel={() => {
    if (!isDeletingSession) {
      setSessionToDelete(null)
    }
  }}
/>
      {/* =========================================================
          ANIMATIONS
      ========================================================= */}

      <style>{`
        @keyframes practiceFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }

          50% {
            transform: translate3d(0, -10px, 0) rotate(3deg);
          }
        }

        @keyframes practiceFloatReverse {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }

          50% {
            transform: translate3d(0, 9px, 0) rotate(-3deg);
          }
        }

        @keyframes practiceOrbit {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @keyframes practiceOrbitReverse {
          from {
            transform: rotate(360deg);
          }

          to {
            transform: rotate(0deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>

    </div>
  )
}
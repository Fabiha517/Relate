import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import * as practiceApi from '../api/practice.api'
import * as analogyApi from '../api/analogy.api'

import PracticeSessionReview from '../components/practice/PracticeSessionReview'
import BannerError from '../components/ui/BannerError'

export default function PracticeSessionReviewPage() {
  const { analogyId, sessionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [session, setSession] = useState(null)
  const [analogy, setAnalogy] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load session and analogy on mount
  useEffect(() => {
    async function loadSessionAndAnalogy() {
      if (!analogyId || !sessionId || !user) return

      try {
        setLoading(true)
        setError(null)

        // Fetch the session
        const sessionResponse =
          await practiceApi.getPracticeSession(
            analogyId,
            sessionId
          )

        setSession(sessionResponse.session)

        // Fetch the analogy for context
        const analogyResponse =
          await analogyApi.getAnalogy(analogyId)

        setAnalogy(analogyResponse.analogy)
      } catch (err) {
        console.error(
          'Failed to load session or analogy:',
          err
        )

        const errorMessage =
          err.response?.status === 403
            ? 'You do not have access to this session.'
            : err.response?.status === 404
              ? 'Session not found.'
              : err.response?.data?.error?.message ||
                'Failed to load session review'

        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    loadSessionAndAnalogy()
  }, [analogyId, sessionId, user])

  // Handle practice again
  function handlePracticeAgain() {
    navigate(`/practice/${analogyId}`)
  }

  // Handle generate more questions
  async function handleGenerateMoreQuestions() {
    if (!session) return

    // Navigate back to session page, it will trigger generate more
    navigate(`/practice/${analogyId}`)
  }

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="relative flex min-h-full w-full items-center justify-center overflow-hidden bg-[#F7F0E3]">

        {/* Ambient color fields */}
        <div className="absolute -left-24 top-[18%] h-72 w-72 rounded-full bg-[#FFD65A]/20 blur-3xl" />
        <div className="absolute -right-24 bottom-[15%] h-80 w-80 rounded-full bg-[#4E9EA0]/15 blur-3xl" />

        {/* Orbit */}
        <svg
          aria-hidden="true"
          viewBox="0 0 260 260"
          className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 opacity-30 animate-[pageOrbit_20s_linear_infinite]"
          fill="none"
        >
          <circle
            cx="130"
            cy="130"
            r="98"
            stroke="#5424C7"
            strokeWidth="1.5"
            strokeDasharray="5 9"
          />
          <circle
            cx="130"
            cy="130"
            r="68"
            stroke="#E47B62"
            strokeWidth="1.5"
            strokeDasharray="3 8"
          />
          <circle
            cx="35"
            cy="105"
            r="6"
            fill="#FFD65A"
          />
          <circle
            cx="208"
            cy="61"
            r="5"
            fill="#4E9EA0"
          />
        </svg>

        {/* Constellation */}
        <svg
          aria-hidden="true"
          viewBox="0 0 240 120"
          className="absolute left-[12%] top-[18%] h-24 w-48 opacity-45 animate-[pageFloat_8s_ease-in-out_infinite]"
          fill="none"
        >
          <path
            d="M12 77L58 34L108 67L157 25L225 58"
            stroke="#B8AFBF"
            strokeWidth="1"
            strokeDasharray="4 8"
          />
          <circle cx="12" cy="77" r="4" fill="#E47B62" />
          <circle cx="58" cy="34" r="5" fill="#FFD65A" />
          <circle cx="108" cy="67" r="4" fill="#4E9EA0" />
          <circle cx="157" cy="25" r="5" fill="#5424C7" />
          <circle cx="225" cy="58" r="4" fill="#E47B62" />
        </svg>

        {/* Floating star */}
        <svg
          aria-hidden="true"
          viewBox="0 0 60 60"
          className="absolute right-[14%] top-[24%] h-10 w-10 opacity-60 animate-[pageTwinkle_4s_ease-in-out_infinite]"
          fill="none"
        >
          <path
            d="M30 4L35 23L55 30L35 36L30 56L25 36L5 30L25 23L30 4Z"
            stroke="#F0A23A"
            strokeWidth="2"
          />
        </svg>

        {/* Loading mark */}
        <div className="relative flex flex-col items-center">
          <div className="relative h-24 w-24">
            <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-[#DDD5EA] border-t-[#5424C7]" />

            <div className="absolute inset-5 flex items-center justify-center rounded-full border border-[#D8D0C2] bg-[#FFFDF7] shadow-[2px_3px_0_#D8D0C2]">
              <span className="text-xl text-[#5424C7]">
                ✦
              </span>
            </div>
          </div>

          <p className="mt-6 text-[11px] font-black uppercase tracking-[0.18em] text-[#777F8D]">
            Reconstructing your trail
          </p>

          <p className="mt-2 text-sm text-[#A09AA5]">
            Loading session review…
          </p>
        </div>

        <style>{`
          @keyframes pageFloat {
            0%, 100% {
              transform: translate3d(0, 0, 0);
            }
            50% {
              transform: translate3d(0, -8px, 0);
            }
          }

          @keyframes pageOrbit {
            from {
              transform: translate(-50%, -50%) rotate(0deg);
            }
            to {
              transform: translate(-50%, -50%) rotate(360deg);
            }
          }

          @keyframes pageTwinkle {
            0%, 100% {
              opacity: 0.35;
              transform: scale(0.92);
            }
            50% {
              opacity: 0.85;
              transform: scale(1.08);
            }
          }
        `}</style>
      </div>
    )
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (error) {
    return (
      <div className="relative min-h-full w-full overflow-hidden bg-[#F7F0E3]">

        {/* Decorative canvas */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute -left-16 top-8 h-44 w-44 opacity-40"
          viewBox="0 0 180 180"
          fill="none"
        >
          <circle
            cx="90"
            cy="90"
            r="62"
            stroke="#5424C7"
            strokeWidth="1.5"
            strokeDasharray="5 8"
          />
          <circle
            cx="90"
            cy="90"
            r="40"
            stroke="#E47B62"
            strokeWidth="1.5"
            strokeDasharray="3 7"
          />
          <circle
            cx="31"
            cy="70"
            r="5"
            fill="#FFD65A"
          />
        </svg>

        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-[25%] h-44 w-40 opacity-40"
          viewBox="0 0 160 180"
          fill="none"
        >
          <path
            d="M20 22C75 2 42 61 105 76C145 87 75 112 112 141C128 154 108 170 70 176"
            stroke="#4E9EA0"
            strokeWidth="2"
            strokeDasharray="4 8"
          />
          <circle
            cx="20"
            cy="22"
            r="5"
            fill="#E47B62"
          />
        </svg>

        <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center px-5 sm:px-8 lg:px-12">
          <div className="relative w-full">

            <div className="absolute -left-5 -top-5 h-12 w-12 rotate-12 rounded-[45%_55%_60%_40%] bg-[#FFD65A]" />

            <div className="absolute -bottom-4 right-[15%] h-8 w-8 rounded-full bg-[#4E9EA0]" />

            <div className="relative rounded-[28px] border-2 border-[#D8D0C2] bg-[#FFFDF7] p-6 shadow-[5px_6px_0_#D8D0C2]">
              <BannerError
                message={error}
                onDismiss={() => {
                  setError(null)
                  navigate(`/practice/${analogyId}`)
                }}
                isDismissible={true}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================
  // NO SESSION
  // =========================================================

  if (!session || !analogy) {
    return (
      <div className="relative min-h-full w-full overflow-hidden bg-[#F7F0E3]">

        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-[8%] top-[20%] h-20 w-20 opacity-50 animate-[pageFloat_7s_ease-in-out_infinite]"
          viewBox="0 0 80 80"
          fill="none"
        >
          <path
            d="M40 7L73 66H7L40 7Z"
            stroke="#4E9EA0"
            strokeWidth="2"
            strokeDasharray="4 5"
          />
          <circle
            cx="40"
            cy="40"
            r="4"
            fill="#FFD65A"
          />
        </svg>

        <svg
          aria-hidden="true"
          className="pointer-events-none absolute right-[10%] top-[58%] h-12 w-12 opacity-55"
          viewBox="0 0 60 60"
          fill="none"
        >
          <path
            d="M30 4L35 23L55 30L35 36L30 56L25 36L5 30L25 23L30 4Z"
            stroke="#E47B62"
            strokeWidth="2"
          />
        </svg>

        <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center px-5 sm:px-8 lg:px-12">
          <div className="relative w-full">

            <div className="absolute right-10 top-[-30px] h-16 w-16 rounded-full bg-[#4E9EA0]" />

            <div className="relative rounded-[28px] border-2 border-[#D8D0C2] bg-[#FFFDF7] p-6 shadow-[5px_6px_0_#D8D0C2]">
              <BannerError
                message="Session or analogy not found."
                onDismiss={() => navigate('/practice')}
                isDismissible={true}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="relative min-h-full w-full overflow-hidden bg-[#F7F0E3] text-[#14213D]">
      
    <div className="absolute -top-20 -left-20 w-48 h-48 bg-yellow-300 rounded-full opacity-25 blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-700 rounded-full opacity-20 blur-3xl"></div>
      <div className=" pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl "/>
      <div className=" pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl "/>
      <div className=" pointer-events-none absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-purple-800/35 blur-3xl "/>
        
      {/* =====================================================
          PAGE DECORATION
      ===================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
         <div className="library-page__shape library-page__shape--yellow" />
        <div className="library-page__shape library-page__shape--purple" />
        <div className="library-page__shape library-page__shape--teal" />
        <div className="library-page__dots" />

 <svg className="lib-bg__svg lib-bg__svg--tl" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="25"  cy="35"  r="4"   fill="#ffb800" opacity="0.85"/>
          <circle cx="85"  cy="12"  r="3"   fill="#5424c7" opacity="0.75"/>
          <circle cx="155" cy="55"  r="4.5" fill="#17aaa7" opacity="0.80"/>
          <circle cx="65"  cy="90"  r="2.5" fill="#f27d6b" opacity="0.70"/>
          <circle cx="185" cy="22"  r="3.5" fill="#ffb800" opacity="0.65"/>
          <circle cx="120" cy="150" r="3"   fill="#5424c7" opacity="0.60"/>
          <path d="M25 35 L85 12"   stroke="#ffb800" strokeWidth="1.2" opacity="0.35" strokeDasharray="3 5"/>
          <path d="M85 12 L155 55"  stroke="#5424c7" strokeWidth="1.2" opacity="0.35" strokeDasharray="3 5"/>
          <path d="M155 55 L185 22" stroke="#17aaa7" strokeWidth="1.2" opacity="0.35" strokeDasharray="3 5"/>
        </svg>
        {/* Soft color fields */}
        <div className="absolute -left-28 top-36 h-80 w-80 rounded-full bg-[#FFD65A]/10 blur-3xl" />
        <div className="absolute -right-28 top-20 h-96 w-96 rounded-full bg-[#4E9EA0]/10 blur-3xl" />

        {/* Top-left orbit */}
        <svg
          viewBox="0 0 180 180"
          className="absolute -left-14 top-4 h-44 w-44 opacity-45 animate-[pageOrbit_24s_linear_infinite]"
          fill="none"
        >
          <circle
            cx="90"
            cy="90"
            r="65"
            stroke="#5424C7"
            strokeWidth="1.5"
            strokeDasharray="5 8"
          />
          <circle
            cx="90"
            cy="90"
            r="42"
            stroke="#E47B62"
            strokeWidth="1.5"
            strokeDasharray="2 8"
          />
          <circle cx="28" cy="73" r="5" fill="#FFD65A" />
          <circle cx="145" cy="42" r="4" fill="#4E9EA0" />
        </svg>

        {/* Top constellation */}
        <svg
          viewBox="0 0 260 120"
          className="absolute left-1/2 top-2 h-24 w-56 -translate-x-1/2 opacity-50 animate-[pageFloat_9s_ease-in-out_infinite]"
          fill="none"
        >
          <path
            d="M12 74L58 31L110 65L162 23L236 59"
            stroke="#B8AFBF"
            strokeWidth="1"
            strokeDasharray="4 8"
          />
          <path
            d="M58 31L82 101L110 65"
            stroke="#B8AFBF"
            strokeWidth="1"
            strokeDasharray="3 7"
          />
          <circle cx="12" cy="74" r="3" fill="#E47B62" />
          <circle cx="58" cy="31" r="5" fill="#FFD65A" />
          <circle cx="110" cy="65" r="4" fill="#4E9EA0" />
          <circle cx="162" cy="23" r="5" fill="#5424C7" />
          <circle cx="236" cy="59" r="3" fill="#E47B62" />
          <circle cx="82" cy="101" r="3" fill="#5424C7" />
        </svg>
         <div className="lib-bg__spark lib-bg__spark--1">&#10022;</div>
        <div className="lib-bg__spark lib-bg__spark--2">&#10022;</div>
        <div className="lib-bg__spark lib-bg__spark--3">+</div>
        <div className="lib-bg__spark lib-bg__spark--4">&#9670;</div>

  <svg
          className="absolute left-[43%] top-[4%] h-28 w-48 animate-[practiceFloatReverse_10s_ease-in-out_infinite] opacity-60"
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
        {/* Top-right rings */}
        <svg
          viewBox="0 0 180 180"
          className="absolute -right-14 top-10 h-44 w-44 opacity-40 animate-[pageOrbitReverse_27s_linear_infinite]"
          fill="none"
        >
          <circle
            cx="90"
            cy="90"
            r="67"
            stroke="#4E9EA0"
            strokeWidth="1.5"
            strokeDasharray="6 9"
          />
          <circle
            cx="90"
            cy="90"
            r="44"
            stroke="#5424C7"
            strokeWidth="1"
            strokeDasharray="3 7"
          />
          <circle cx="143" cy="48" r="5" fill="#FFD65A" />
        </svg>
 <svg className="lib-bg__svg lib-bg__svg--bl" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="150,15 285,265 15,265" stroke="#ffb800" strokeWidth="2.5" opacity="0.50" fill="none"/>
          <polygon points="150,65 245,245 55,245" stroke="#f27d6b" strokeWidth="1.5" opacity="0.38" fill="none"/>
          <circle cx="150" cy="15"  r="6" fill="#ffb800" opacity="0.75"/>
          <circle cx="285" cy="265" r="6" fill="#f27d6b" opacity="0.75"/>
          <circle cx="15"  cy="265" r="6" fill="#17aaa7" opacity="0.75"/>
        </svg>
<svg className="lib-bg__svg lib-bg__svg--tr" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="140" cy="140" r="130" stroke="#5424c7" strokeWidth="2"   strokeDasharray="10 8" opacity="0.55"/>
          <circle cx="140" cy="140" r="90"  stroke="#17aaa7" strokeWidth="1.5" strokeDasharray="5 12" opacity="0.45"/>
          <circle cx="140" cy="140" r="50"  stroke="#ffb800" strokeWidth="2"   opacity="0.55"/>
          <circle cx="140" cy="140" r="18"  fill="#ffb800" opacity="0.20"/>
          <line x1="10"  y1="140" x2="270" y2="140" stroke="#5424c7" strokeWidth="1" opacity="0.18"/>
          <line x1="140" y1="10"  x2="140" y2="270" stroke="#5424c7" strokeWidth="1" opacity="0.18"/>
        </svg>
        {/* Left squiggle */}
        <svg
          viewBox="0 0 90 220"
          className="absolute left-0 top-[38%] h-48 w-20 opacity-40 animate-[pageFloatReverse_10s_ease-in-out_infinite]"
          fill="none"
        >
          <path
            d="M43 8C7 31 76 52 32 80C1 100 72 121 29 150C10 163 24 190 63 211"
            stroke="#E47B62"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="3 7"
          />
          <circle cx="43" cy="8" r="4" fill="#FFD65A" />
        </svg>

        {/* Right squiggle */}
        <svg
          viewBox="0 0 90 220"
          className="absolute right-0 top-[52%] h-48 w-20 opacity-40 animate-[pageFloat_11s_ease-in-out_infinite]"
          fill="none"
        >
          <path
            d="M48 8C83 30 15 53 60 82C90 102 19 125 62 151C80 164 67 191 30 211"
            stroke="#5424C7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="4 8"
          />
          <circle cx="48" cy="8" r="4" fill="#4E9EA0" />
        </svg>

        {/* Star */}
        <svg
          viewBox="0 0 60 60"
          className="absolute left-[7%] top-[55%] h-9 w-9 opacity-60 animate-[pageTwinkle_4s_ease-in-out_infinite]"
          fill="none"
        >
          <path
            d="M30 4L35 23L55 30L35 36L30 56L25 36L5 30L25 23L30 4Z"
            stroke="#F0A23A"
            strokeWidth="2"
          />
        </svg>

        {/* Triangle */}
        <svg
          viewBox="0 0 80 80"
          className="absolute right-[9%] top-[63%] h-11 w-11 opacity-50 animate-[pageTriangle_8s_ease-in-out_infinite]"
          fill="none"
        >
          <path
            d="M40 7L73 66H7L40 7Z"
            stroke="#4E9EA0"
            strokeWidth="2"
            strokeDasharray="4 5"
          />
          <circle cx="40" cy="40" r="4" fill="#FFD65A" />
        </svg>

        {/* Plus marks */}
        <span className="absolute left-[17%] top-[68%] text-2xl font-light text-[#4E9EA0] animate-[pageTwinkle_6s_ease-in-out_infinite]">
          +
        </span>

        <span className="absolute right-[19%] top-[77%] text-2xl font-light text-[#E47B62] animate-[pageTwinkle_7s_ease-in-out_infinite_1s]">
          +
        </span>

        {/* Dot clusters */}
        <div className="absolute left-[11%] top-[78%] flex gap-2 animate-[pageFloat_8s_ease-in-out_infinite]">
          <span className="h-2 w-2 rounded-full bg-[#5424C7]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#FFD65A]" />
          <span className="h-2 w-2 rounded-full bg-[#4E9EA0]" />
        </div>

        <div className="absolute right-[12%] top-[86%] flex gap-2 animate-[pageFloatReverse_9s_ease-in-out_infinite]">
          <span className="h-1.5 w-1.5 rounded-full bg-[#E47B62]" />
          <span className="h-2 w-2 rounded-full bg-[#5424C7]" />
          <span className="h-1.5 w-1.5 rounded-full bg-[#FFD65A]" />
        </div>

        {/* Bottom path */}
        <svg
          viewBox="0 0 700 140"
          className="absolute bottom-[-25px] left-1/2 h-28 w-[650px] -translate-x-1/2 opacity-30"
          fill="none"
        >
          <path
            d="M20 110C135 12 270 130 360 65C455 0 555 115 680 35"
            stroke="#5424C7"
            strokeWidth="1.5"
            strokeDasharray="5 10"
          />
          <circle cx="145" cy="65" r="4" fill="#FFD65A" />
          <circle cx="360" cy="65" r="4" fill="#4E9EA0" />
          <circle cx="555" cy="78" r="4" fill="#E47B62" />
        </svg>
      </div>

      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}

      <div className="relative mx-auto w-full max-w-6xl px-5 pb-20 pt-7 sm:px-8 lg:px-12 lg:pt-10">

        {/* Header */}
        <header className="relative mb-10">

          <div className="mb-5 flex flex-wrap items-center gap-3">
            <span className="rotate-[-2deg] rounded-full border-2 border-[#5424C7] bg-[#EEE7FF] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#5424C7] shadow-[2px_2px_0_#D8D0C2]">
              Practice review
            </span>

            <span className="text-xs font-medium text-[#97919D]">
              {analogy.analogyWorld} world
            </span>
          </div>

          <h1 className="max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.05em] text-[#14213D] sm:text-5xl lg:text-6xl">
            {analogy.analogyTitle}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-[#7D8490]">
            <span className="rounded-full border border-[#DED7CC] bg-[#FFFDF7] px-3 py-1.5 shadow-[2px_2px_0_#E2DBD1]">
              Session review
            </span>

            <span className="text-[#B1AAB4]">
              •
            </span>

            <span>
              {new Date(
                session.completedAt
              ).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Hand-drawn underline */}
          <svg
            aria-hidden="true"
            className="mt-3 h-5 w-72 text-[#E47B62]"
            viewBox="0 0 290 20"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M3 11C55 3 102 18 151 9C198 1 241 5 286 9"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </header>

        <div className="relative">
          <PracticeSessionReview
            session={session}
            analogyId={analogyId}
            onPracticeAgain={handlePracticeAgain}
            onGenerateMoreQuestions={handleGenerateMoreQuestions}
          />
        </div>
      </div>

      <style>{`
        @keyframes pageFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -8px, 0);
          }
        }

        @keyframes pageFloatReverse {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(7px, 6px, 0);
          }
        }

        @keyframes pageOrbit {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pageOrbitReverse {
          from {
            transform: rotate(360deg);
          }
          to {
            transform: rotate(0deg);
          }
        }

        @keyframes pageTriangle {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          50% {
            transform: translate3d(5px, -7px, 0) rotate(6deg);
          }
        }

        @keyframes pageTwinkle {
          0%, 100% {
            opacity: 0.35;
            transform: scale(0.92);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.08);
          }
        }
      `}</style>
    </div>
  )
}
/** @jsxImportSource react */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import * as practiceApi from '../api/practice.api'
import * as analogyApi from '../api/analogy.api'
import PracticeSessionReview from '../components/practice/PracticeSessionReview'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import BannerError from '../components/ui/BannerError'
import './PracticeSessionReviewPage.css'

/**
 * PracticeSessionReviewPage - Read-only review of a completed practice session
 * 
 * Flow:
 * 1. Extract analogyId and sessionId from route params
 * 2. Fetch full session via GET /api/practice/sessions/:analogyId/:sessionId
 * 3. Render PracticeSessionReview (no AI calls)
 * 
 * Requirements: 12.4, 12.5, 12.6
 */
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
        const sessionResponse = await practiceApi.getPracticeSession(analogyId, sessionId)
        setSession(sessionResponse.session)

        // Fetch the analogy for context
        const analogyResponse = await analogyApi.getAnalogy(analogyId)
        setAnalogy(analogyResponse.analogy)
      } catch (err) {
        console.error('Failed to load session or analogy:', err)
        const errorMessage =
          err.response?.status === 403
            ? 'You do not have access to this session.'
            : err.response?.status === 404
              ? 'Session not found.'
              : err.response?.data?.error?.message || 'Failed to load session review'
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

  // Loading state
  if (loading) {
    return (
      <div className="practice-session-review-page">
        <div className="practice-session-review-loading">
          <LoadingSpinner />
          <p>Loading session review...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="practice-session-review-page">
        <BannerError
          message={error}
          onDismiss={() => {
            setError(null)
            navigate(`/practice/${analogyId}`)
          }}
          isDismissible={true}
        />
      </div>
    )
  }

  // No session found
  if (!session || !analogy) {
    return (
      <div className="practice-session-review-page">
        <BannerError
          message="Session or analogy not found."
          onDismiss={() => navigate('/practice')}
          isDismissible={true}
        />
      </div>
    )
  }

  return (
    <div className="practice-session-review-page">
      <div className="practice-session-review-container">
        <div className="practice-session-review-header">
          <h1>{analogy.analogyTitle} — Session Review</h1>
          <p className="practice-session-review-world">{analogy.analogyWorld} analogy</p>
          <p className="practice-session-review-date">
            {new Date(session.completedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        <div className="practice-session-review-content">
          <PracticeSessionReview
            session={session}
            analogyId={analogyId}
            onPracticeAgain={handlePracticeAgain}
            onGenerateMoreQuestions={handleGenerateMoreQuestions}
          />
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'

import { useAuth } from '../hooks/useAuth'

import * as libraryApi from '../api/library.api'
import * as practiceApi from '../api/practice.api'

import PracticeLanding from '../components/practice/PracticeLanding'

import LoadingSpinner from '../components/ui/LoadingSpinner'
import BannerError from '../components/ui/BannerError'

export default function PracticeLandingPage() {
  const { user } = useAuth()

  const [analogies, setAnalogies] = useState([])
  const [practiceHistory, setPracticeHistory] = useState([])

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

      /*
       * Keep the existing Library request.
       *
       * The data is intentionally not rendered on this page.
       * Library owns analogy selection + "Practice" actions.
       */
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

      /*
       * Practice history remains the actual content of this page.
       */
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

  return (
    <div className="min-h-full w-full">
      {/* Page-level error */}
      {error && (
        <div className="mx-auto w-full max-w-5xl px-4 pt-6 sm:px-6 lg:px-8">
          <BannerError
            message={error}
            onDismiss={() => setError(null)}
            onRetry={handleRetry}
            isDismissible={true}
          />
        </div>
      )}

      {/* Loading */}
      {loading && analogies.length === 0 ? (
        <div
          className="
            flex min-h-[60vh]
            items-center justify-center
          "
        >
          <LoadingSpinner />
        </div>
      ) : (
        <PracticeLanding
          sessions={practiceHistory}
          onReviewSession={handleReviewSession}
        />
      )}

      {/* History loading/error is handled here so the existing
          separate API flow remains intact. */}
      {historyError && (
        <div className="mx-auto w-full max-w-5xl px-4 pb-6 sm:px-6 lg:px-8">
          <BannerError
            message={historyError}
            onDismiss={() => setHistoryError(null)}
            onRetry={handleRetry}
            isDismissible={true}
          />
        </div>
      )}

      {historyLoading && !loading && (
        <div
          className="
            mx-auto flex w-full max-w-5xl
            justify-center
            px-4 pb-10
            sm:px-6 lg:px-8
          "
        >
          <LoadingSpinner />
        </div>
      )}
    </div>
  )
}
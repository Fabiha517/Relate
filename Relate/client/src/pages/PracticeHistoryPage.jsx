/** @jsxImportSource react */
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import * as practiceApi from '../api/practice.api'
import PracticeHistory from '../components/practice/PracticeHistory'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import BannerError from '../components/ui/BannerError'
import EmptyState from '../components/ui/EmptyState'
import { useNavigate } from 'react-router-dom'
import './PracticeHistoryPage.css'

/**
 * PracticeHistoryPage - View all past practice sessions
 * Supports deleting individual sessions.
 *
 * Requirements: 12.5, 12.7, 12.8, 12.9
 */
export default function PracticeHistoryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [deleteToast, setDeleteToast] = useState(null) // 'success' | 'error'

  useEffect(() => {
    async function fetchHistory() {
      if (!user) return

      setLoading(true)
      setError(null)

      try {
        const response = await practiceApi.getPracticeHistory()
        setSessions(response.sessions || [])
      } catch (err) {
        console.error('Failed to fetch practice history:', err)
        setError(
          err.response?.status === 401
            ? 'Your session has expired. Please log in again.'
            : 'Failed to load your practice history. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [user, retryCount])

  function handleRetry() {
    setRetryCount((prev) => prev + 1)
  }

  async function handleDeleteSession(sessionId) {
    const previous = sessions
    // Optimistic removal
    setSessions((prev) => prev.filter((s) => s.sessionId.toString() !== sessionId.toString()))
    setDeleteToast(null)

    try {
      await practiceApi.deletePracticeSession(sessionId)
      setDeleteToast('success')
      setTimeout(() => setDeleteToast(null), 3000)
    } catch (err) {
      console.error('Failed to delete session:', err)
      setSessions(previous)
      setDeleteToast('error')
      setTimeout(() => setDeleteToast(null), 4000)
    }
  }

  return (
    <div className="practice-history-page">
      {/* Fixed toast notifications - no layout shift */}
      <div className="practice-history-toast-area" aria-live="polite" aria-atomic="true">
        {deleteToast === 'success' && (
          <div className="practice-history-toast practice-history-toast--success">
            <span>✓</span> Practice session deleted.
          </div>
        )}
        {deleteToast === 'error' && (
          <div className="practice-history-toast practice-history-toast--error">
            <span>✕</span> Failed to delete session. Please try again.
          </div>
        )}
      </div>

      <div className="practice-history-header">
        <h1>Practice History</h1>
        <p className="practice-history-subtitle">All your past practice sessions</p>
      </div>

      {/* Page-level error banner */}
      {error && (
        <BannerError
          message={error}
          onDismiss={() => setError(null)}
          onRetry={handleRetry}
          isDismissible={true}
        />
      )}

      {/* Loading state */}
      {loading && sessions.length === 0 && (
        <div className="practice-history-loading">
          <LoadingSpinner />
        </div>
      )}

      {/* Empty state */}
      {!loading && sessions.length === 0 && !error && (
        <EmptyState
          title="No practice sessions yet"
          message="Start practicing to see your session history."
          action={() => navigate('/practice')}
          actionLabel="Start practicing"
        />
      )}

      {/* Main history grid */}
      {!loading && sessions.length > 0 && (
        <PracticeHistory
          sessions={sessions}
          onDelete={handleDeleteSession}
        />
      )}
    </div>
  )
}

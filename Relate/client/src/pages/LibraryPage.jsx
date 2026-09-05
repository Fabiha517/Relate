/** @jsxImportSource react */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import * as libraryApi from '../api/library.api'

import LibraryGrid from '../components/library/LibraryGrid'

import BannerError from '../components/ui/BannerError'
import LoadingSpinner from '../components/ui/LoadingSpinner'

import './LibraryPage.css'

/**
 * LibraryPage
 *
 * Relate's saved analogy "idea wall".
 * Supports deleting saved analogies with optimistic UI removal.
 */
export default function LibraryPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [analogies, setAnalogies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [retryCount, setRetryCount] = useState(0)
  const [deleteError, setDeleteError] = useState(null)
  const [deleteSuccess, setDeleteSuccess] = useState(false)

  useEffect(() => {
    async function fetchLibrary() {
      if (!user) return

      setLoading(true)
      setError(null)

      try {
        const response = await libraryApi.getLibrary()
        setAnalogies(response.analogies || [])
      } catch (err) {
        console.error('Failed to fetch library:', err)
        setError(
          err.response?.status === 401
            ? 'Your session has expired. Please log in again.'
            : 'Failed to load your library. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchLibrary()
  }, [user, retryCount])

  function handleRetry() {
    setRetryCount((prev) => prev + 1)
  }

  async function handleDeleteAnalogy(analogyId) {
    // Optimistic removal
    const previous = analogies
    setAnalogies((prev) => prev.filter((a) => (a._id || a.id) !== analogyId))
    setDeleteError(null)
    setDeleteSuccess(false)

    try {
      await libraryApi.deleteAnalogy(analogyId)
      setDeleteSuccess(true)
      setTimeout(() => setDeleteSuccess(false), 3000)
    } catch (err) {
      console.error('Failed to delete analogy:', err)
      // Restore on failure
      setAnalogies(previous)
      setDeleteError('Failed to delete analogy. Please try again.')
      setTimeout(() => setDeleteError(null), 4000)
    }
  }

  return (
    <main className="library-page pl-10 pr-10 ">

      {/* ── Rich decorative background ── */}
      <div className="lib-bg" aria-hidden="true">
 <div className="absolute -top-20 -left-20 w-48 h-48 bg-yellow-300 rounded-full opacity-25 blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-700 rounded-full opacity-20 blur-3xl"></div>
      <div className=" pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl "/>
      <div className=" pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl "/>
      <div className=" pointer-events-none absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-purple-800/35 blur-3xl "/>
        
        {/* legacy shapes kept for CSS compat */}
        <div className="library-page__shape library-page__shape--yellow" />
        <div className="library-page__shape library-page__shape--purple" />
        <div className="library-page__shape library-page__shape--teal" />
        <div className="library-page__dots" />

        {/* Extra blobs */}
        <div className="lib-bg__blob lib-bg__blob--green" />
        <div className="lib-bg__blob lib-bg__blob--coral" />

        {/* Floating rings */}
        <div className="lib-bg__ring lib-bg__ring--1" />
        <div className="lib-bg__ring lib-bg__ring--2" />
        <div className="lib-bg__ring lib-bg__ring--3" />
        <div className="lib-bg__ring lib-bg__ring--4" />

        {/* Floating dots */}
        <div className="lib-bg__dot lib-bg__dot--1" />
        <div className="lib-bg__dot lib-bg__dot--2" />
        <div className="lib-bg__dot lib-bg__dot--3" />
        <div className="lib-bg__dot lib-bg__dot--4" />
        <div className="lib-bg__dot lib-bg__dot--5" />
        <div className="lib-bg__dot lib-bg__dot--6" />

        {/* Floating sparkles */}
        <div className="lib-bg__spark lib-bg__spark--1">&#10022;</div>
        <div className="lib-bg__spark lib-bg__spark--2">&#10022;</div>
        <div className="lib-bg__spark lib-bg__spark--3">+</div>
        <div className="lib-bg__spark lib-bg__spark--4">&#9670;</div>

        {/* SVG: top-right — concentric dashed circles */}
        <svg className="lib-bg__svg lib-bg__svg--tr" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="140" cy="140" r="130" stroke="#5424c7" strokeWidth="2"   strokeDasharray="10 8" opacity="0.55"/>
          <circle cx="140" cy="140" r="90"  stroke="#17aaa7" strokeWidth="1.5" strokeDasharray="5 12" opacity="0.45"/>
          <circle cx="140" cy="140" r="50"  stroke="#ffb800" strokeWidth="2"   opacity="0.55"/>
          <circle cx="140" cy="140" r="18"  fill="#ffb800" opacity="0.20"/>
          <line x1="10"  y1="140" x2="270" y2="140" stroke="#5424c7" strokeWidth="1" opacity="0.18"/>
          <line x1="140" y1="10"  x2="140" y2="270" stroke="#5424c7" strokeWidth="1" opacity="0.18"/>
        </svg>

        {/* SVG: bottom-left — nested triangles */}
        <svg className="lib-bg__svg lib-bg__svg--bl" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="150,15 285,265 15,265" stroke="#ffb800" strokeWidth="2.5" opacity="0.50" fill="none"/>
          <polygon points="150,65 245,245 55,245" stroke="#f27d6b" strokeWidth="1.5" opacity="0.38" fill="none"/>
          <circle cx="150" cy="15"  r="6" fill="#ffb800" opacity="0.75"/>
          <circle cx="285" cy="265" r="6" fill="#f27d6b" opacity="0.75"/>
          <circle cx="15"  cy="265" r="6" fill="#17aaa7" opacity="0.75"/>
        </svg>

        {/* SVG: mid-left — zigzag */}
        <svg className="lib-bg__svg lib-bg__svg--ml" viewBox="0 0 60 320" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polyline points="10,0 50,55 10,110 50,165 10,220 50,275 10,320"
            stroke="#17aaa7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.60"/>
        </svg>

        {/* SVG: top-left — star constellation */}
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

        {/* SVG: bottom-right — wavy lines */}
        <svg className="lib-bg__svg lib-bg__svg--br" viewBox="0 0 320 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 110 C65 35 130 160 195 80 C260 0 320 120 390 55"
            stroke="#9b7fe8" strokeWidth="2.5" strokeLinecap="round" opacity="0.55"/>
          <path d="M0 145 C65 70 130 185 195 115 C260 45 320 155 390 90"
            stroke="#17aaa7" strokeWidth="1.5" strokeLinecap="round" opacity="0.38"/>
        </svg>

      </div>

      {/* Fixed-position toast notifications (no layout shift) */}
      <div className="library-toast-area" aria-live="polite" aria-atomic="true">
        {deleteSuccess && (
          <div className="library-toast library-toast--success">
            <span>✓</span> Analogy deleted successfully.
          </div>
        )}
        {deleteError && (
          <div className="library-toast library-toast--error">
            <span>✕</span> {deleteError}
          </div>
        )}
      </div>

      <div className="library-page__content">

        {/* =====================================================
            HERO
            ===================================================== */}
        <section className="library-hero">
          <div className="library-hero__copy">
            <div className="library-hero__eyebrow">
              <span className="library-hero__eyebrow-dot" />
              YOUR SAVED IDEAS
            </div>

            <h1 className="library-hero__title">
              KEEP
              <br />
              <span>IT</span>{' '}
              <em>RELATABLE.</em>
            </h1>

            <p className="library-hero__subtitle">
              The explanations that finally made a difficult idea
              click — saved so you can come back to them anytime.
            </p>
          </div>

          <div className="library-hero__visual">
            <div className="library-hero__count-card">
              <span className="library-hero__count-number">
                {String(analogies.length).padStart(2, '0')}
              </span>

              <span className="library-hero__count-label">
                saved
                <br />
                connections
              </span>
            </div>

            <button
              type="button"
              className="library-hero__create"
              onClick={() => navigate('/')}
            >
              <span className="library-hero__create-plus">+</span>
              <span className="library-hero__create-text">
                make another
                <br />
                connection
              </span>
              <span className="library-hero__create-arrow">↘</span>
            </button>
          </div>

          <div className="library-hero__note" aria-hidden="true">
            <span>things that made sense</span>
            <svg viewBox="0 0 150 50" fill="none">
              <path
                d="M6 8 C45 5 78 16 112 38"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              />
              <path
                d="M105 27 L112 38 L99 37"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </section>

        {/* =====================================================
            ERROR
            ===================================================== */}
        {error && (
          <div className="library-error">
            <BannerError
              message={error}
              onDismiss={() => setError(null)}
              onRetry={handleRetry}
              isDismissible={true}
            />
          </div>
        )}

        {/* =====================================================
            LOADING
            ===================================================== */}
        {loading && analogies.length === 0 && (
          <div className="library-loading">
            <LoadingSpinner />
            <p>Gathering your ideas...</p>
          </div>
        )}

        {/* =====================================================
            LIBRARY
            ===================================================== */}
        {!loading && (
          <LibraryGrid
            analogies={analogies}
            onDelete={handleDeleteAnalogy}
          />
        )}

      </div>
    </main>
  )
}

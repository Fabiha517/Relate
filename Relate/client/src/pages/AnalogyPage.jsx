/** @jsxImportSource react */

import { useState, useEffect } from 'react'

import { useLocation, useParams, useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'

import { useAnalogy } from '../hooks/useAnalogy'

import { useGuestSession } from '../hooks/useGuestSession'

import * as analogyApi from '../api/analogy.api'

import * as worldsApi from '../api/worlds.api'

import VisualModel from '../components/analogy/VisualModel'

import ExplanationPanel from '../components/analogy/ExplanationPanel'

import LimitationsPanel from '../components/analogy/LimitationsPanel'

import ModificationControls from '../components/analogy/ModificationControls'


import BannerError from '../components/ui/BannerError'
import AuthModal from '../components/ui/AuthModal'

import '../pages/AnalogyPage.css'

export default function AnalogyPage() {

  const location = useLocation()
  const navigate = useNavigate()
  const { id: analogyId } = useParams()

  const { user } = useAuth()

  const guestSession = useGuestSession()

  const {
    analogy,
    loading: hookLoading,
    error: hookError,
    modifying,
    modify,
    save,
    update,
  } = useAnalogy()


  const [analogyData, setAnalogyData] = useState(null)

  const [savedData, setSavedData] = useState(null)

  const [isModified, setIsModified] = useState(false)

  const [saveLoading, setSaveLoading] = useState(false)

  const [saveError, setSaveError] = useState(null)

  const [saveSuccess, setSaveSuccess] = useState(false)

  const [worlds, setWorlds] = useState([])

  const [modifyError, setModifyError] = useState(null)

  const [showGuestPrompt, setShowGuestPrompt] = useState(false)

  const [promptDismissed, setPromptDismissed] = useState(false)

  const [conceptFormDisabled, setConceptFormDisabled] = useState(false)


  // =========================================================
  // FETCH WORLDS
  // =========================================================

  useEffect(() => {

    async function fetchWorlds() {

      try {

        const response = await worldsApi.getWorlds()

        setWorlds(response.worlds || [])

      } catch (err) {

        console.error('Failed to fetch worlds:', err)

      }

    }

    fetchWorlds()

  }, [])


  // =========================================================
  // LOAD ANALOGY
  // =========================================================

  useEffect(() => {

    async function loadAnalogy() {

      // Existing saved analogy

      if (analogyId && user) {

        try {

          const retrieved =
            await analogyApi.getAnalogy(analogyId)

          const loadedAnalogy =
            retrieved.analogy || retrieved

          setAnalogyData(loadedAnalogy)

          setSavedData(loadedAnalogy)

          setIsModified(false)

        } catch (err) {

          console.error(
            'Failed to load analogy:',
            err
          )

          setSaveError(
            'Failed to load analogy. Please try again.'
          )

        }

        return
      }


      // Newly generated analogy

      if (location.state?.analogy) {

        const incomingAnalogy =
          location.state.analogy

        const completeAnalogy = {

          ...incomingAnalogy,

          concept:
            incomingAnalogy.concept ||
            location.state.concept ||
            '',

          analogyWorld:
            incomingAnalogy.analogyWorld ||
            location.state.analogyWorld ||
            '',

        }

        setAnalogyData(completeAnalogy)


        if (
          completeAnalogy.id ||
          completeAnalogy._id
        ) {

          setSavedData(completeAnalogy)

        } else {

          setSavedData(null)

        }

        setIsModified(false)

      }

    }

    loadAnalogy()

  }, [
    location.state,
    analogyId,
    user
  ])


  // =========================================================
  // GUEST PROMPT
  // =========================================================

 useEffect(() => {
  if (
    !analogyData ||
    user ||
    promptDismissed ||
    !guestSession.get()
  ) {
    return
  }

  const timer = setTimeout(() => {
    setShowGuestPrompt(true)
  }, 5000)

  return () => clearTimeout(timer)
}, [
  analogyData,
  user,
  promptDismissed,
  guestSession
])

  // =========================================================
  // SAVE
  // =========================================================

  async function handleSave() {

    if (!analogyData || !user) return

    setSaveLoading(true)

    setSaveError(null)

    setSaveSuccess(false)


    try {

      const savedAnalogyId =
        savedData?.id ||
        savedData?._id


      // Update existing analogy

      if (
        savedAnalogyId &&
        isModified
      ) {

        await update(
          savedAnalogyId,
          {
            analogyTitle:
              analogyData.analogyTitle,

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
          }
        )


        setSavedData(prev => ({

          ...prev,

          ...analogyData,

          id:
            prev?.id ||
            prev?._id ||
            savedAnalogyId,

          _id:
            prev?._id ||
            savedAnalogyId,

        }))

      }


      // Save new analogy

      else if (!savedAnalogyId) {

        const savedAnalogy =
          await save({

            analogyTitle:
              analogyData.analogyTitle,

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


        setSavedData(savedAnalogy)


        setAnalogyData(prev => ({

          ...prev,

          ...savedAnalogy,

        }))

      }


      setSaveSuccess(true)

      setIsModified(false)


      setTimeout(
        () => setSaveSuccess(false),
        2000
      )

    } catch (err) {

      console.error(
        'Save error:',
        err
      )


      if (err.fields) {

        const fieldMessages =
          Object.entries(err.fields)
            .map(
              ([field, message]) =>
                `${field}: ${message}`
            )
            .join(' | ')

        setSaveError(
          fieldMessages
        )

      } else {

        setSaveError(
          err.message ||
          'Failed to save analogy. Please try again.'
        )

      }

    } finally {

      setSaveLoading(false)

    }

  }


  // =========================================================
  // MODIFY ANALOGY
  // =========================================================

  async function handleModify(
    modificationType,
    params
  ) {

    const savedAnalogyId =
      savedData?.id ||
      savedData?._id


    if (!savedAnalogyId) {

      console.error(
        'Cannot modify analogy: no saved analogy ID found'
      )

      return

    }


    setModifyError(null)


    try {

      const modifiedAnalogy =
        await modify(
          savedAnalogyId,
          modificationType,
          params
        )


      const completeModifiedAnalogy = {

        ...modifiedAnalogy,

        concept:
          modifiedAnalogy.concept ||
          analogyData.concept ||
          savedData.concept ||
          '',

        analogyWorld:

          modificationType ===
          'switchWorld'

            ? params?.analogyWorld

            : modifiedAnalogy.analogyWorld ||
              analogyData.analogyWorld ||
              savedData.analogyWorld ||
              '',

      }


      setAnalogyData(
        completeModifiedAnalogy
      )


      setSavedData(prev => ({

        ...prev,

        ...completeModifiedAnalogy,

        id:
          prev?.id ||
          prev?._id ||
          savedAnalogyId,

        _id:
          prev?._id ||
          savedAnalogyId,

      }))


      setIsModified(true)

    } catch (err) {

      console.error(
        'Modification error:',
        err
      )

      setModifyError(err)

    }

  }



  // =========================================================
  // LOADING
  // =========================================================

  if (!analogyData) {
    return (
      <div className="ap-loading">
        <div className="ap-loading__blob ap-loading__blob--1" />
        <div className="ap-loading__blob ap-loading__blob--2" />
        <div className="ap-loading__card">
          <div className="ap-loading__ring" />
          <p className="ap-loading__label">Building your analogy&hellip;</p>
        </div>
      </div>
    )
  }

  const isSaved = !!(savedData?.id || savedData?._id)
  const showSaveButton = user && (!isSaved || isModified)
  const buttonText = isSaved && isModified ? 'Save Updated Version' : 'Save to Library'

  return (
    <div className="ap-root">

      {/* ── AMBIENT BACKGROUND ───────────────────────── */}
      <div className="ap-bg" aria-hidden="true">
        {/* Blobs */}
        <div className="ap-bg__blob ap-bg__blob--yellow" />
        <div className="ap-bg__blob ap-bg__blob--purple" />
        <div className="ap-bg__blob ap-bg__blob--teal" />
        <div className="ap-bg__blob ap-bg__blob--pink" />
        <div className="ap-bg__blob ap-bg__blob--green" />

        {/* Orbiting rings */}
        <div className="ap-bg__ring ap-bg__ring--1" />
        <div className="ap-bg__ring ap-bg__ring--2" />
        <div className="ap-bg__ring ap-bg__ring--3" />
        <div className="ap-bg__ring ap-bg__ring--4" />

        {/* Floating dots */}
        <div className="ap-bg__dot ap-bg__dot--1" />
        <div className="ap-bg__dot ap-bg__dot--2" />
        <div className="ap-bg__dot ap-bg__dot--3" />
        <div className="ap-bg__dot ap-bg__dot--4" />
        <div className="ap-bg__dot ap-bg__dot--5" />
        <div className="ap-bg__dot ap-bg__dot--6" />
        <div className="ap-bg__dot ap-bg__dot--7" />

        {/* Sparkle / cross chars */}
        <div className="ap-bg__cross ap-bg__cross--1">&#10022;</div>
        <div className="ap-bg__cross ap-bg__cross--2">&#10022;</div>
        <div className="ap-bg__cross ap-bg__cross--3">+</div>
        <div className="ap-bg__cross ap-bg__cross--4">&#9670;</div>
        <div className="ap-bg__cross ap-bg__cross--5">&#9675;</div>

        {/* SVG: top-left geometric squiggle */}
        <svg className="ap-bg__svg ap-bg__svg--tl" viewBox="0 0 260 260" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="130" cy="130" r="120" stroke="#5424c7" strokeWidth="2.5" strokeDasharray="12 10" opacity="0.55" />
          <circle cx="130" cy="130" r="80"  stroke="#17aaa7" strokeWidth="1.5" strokeDasharray="6 14" opacity="0.40" />
          <circle cx="130" cy="130" r="40"  stroke="#ffb800" strokeWidth="2"   opacity="0.50" />
          <line x1="10"  y1="130" x2="250" y2="130" stroke="#5424c7" strokeWidth="1" opacity="0.20" />
          <line x1="130" y1="10"  x2="130" y2="250" stroke="#5424c7" strokeWidth="1" opacity="0.20" />
        </svg>

        {/* SVG: bottom-right triangle constellation */}
        <svg className="ap-bg__svg ap-bg__svg--br" viewBox="0 0 300 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="150,20 280,260 20,260" stroke="#ffb800" strokeWidth="2.5" opacity="0.45" fill="none" />
          <polygon points="150,70 240,240 60,240"  stroke="#f27d6b" strokeWidth="1.5" opacity="0.35" fill="none" />
          <circle cx="150" cy="20"  r="5" fill="#ffb800" opacity="0.70" />
          <circle cx="280" cy="260" r="5" fill="#f27d6b" opacity="0.70" />
          <circle cx="20"  cy="260" r="5" fill="#17aaa7" opacity="0.70" />
          <circle cx="150" cy="150" r="10" stroke="#5424c7" strokeWidth="2" opacity="0.40" fill="none" />
        </svg>

        {/* SVG: mid-right zigzag line */}
        <svg className="ap-bg__svg ap-bg__svg--mr" viewBox="0 0 60 300" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polyline points="10,0 50,50 10,100 50,150 10,200 50,250 10,300"
            stroke="#17aaa7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
        </svg>

        {/* SVG: top-right scattered stars */}
        <svg className="ap-bg__svg ap-bg__svg--tr" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="20"  cy="30"  r="3.5" fill="#ffb800" opacity="0.80" />
          <circle cx="80"  cy="10"  r="2.5" fill="#5424c7" opacity="0.70" />
          <circle cx="150" cy="50"  r="4"   fill="#17aaa7" opacity="0.75" />
          <circle cx="60"  cy="80"  r="2"   fill="#f27d6b" opacity="0.65" />
          <circle cx="180" cy="20"  r="3"   fill="#ffb800" opacity="0.60" />
          <circle cx="120" cy="140" r="2.5" fill="#5424c7" opacity="0.55" />
          <path d="M20 30 L80 10" stroke="#ffb800" strokeWidth="1" opacity="0.30" strokeDasharray="3 5" />
          <path d="M80 10 L150 50" stroke="#5424c7" strokeWidth="1" opacity="0.30" strokeDasharray="3 5" />
          <path d="M150 50 L180 20" stroke="#17aaa7" strokeWidth="1" opacity="0.30" strokeDasharray="3 5" />
        </svg>

        {/* SVG: bottom-left wavy arc */}
        <svg className="ap-bg__svg ap-bg__svg--bl" viewBox="0 0 300 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120 C60 40 120 160 180 80 C240 0 300 120 360 60"
            stroke="#9b7fe8" strokeWidth="2.5" strokeLinecap="round" opacity="0.50" />
          <path d="M0 150 C60 70 120 180 180 110 C240 40 300 150 360 90"
            stroke="#17aaa7" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
        </svg>
      </div>

      <main className="ap-main">

        {/* ── HERO ─────────────────────────────────────── */}
        <header className="ap-hero">
          <div className="ap-hero__left">
            <div className="ap-hero__badge">
              <span className="ap-hero__badge-dot" />
              <span>Analogy Map</span>
            </div>
            <h1 className="ap-hero__title">
              {analogyData.analogyTitle || analogyData.concept || 'Your Analogy'}
            </h1>
            {analogyData.concept && analogyData.analogyTitle && (
              <p className="ap-hero__concept">{analogyData.concept}</p>
            )}
          </div>
          <div className="ap-hero__right">
            {analogyData.analogyWorld && (
              <div className="ap-hero__world-pill">
                <span className="ap-hero__world-icon">&#9675;</span>
                <span>{analogyData.analogyWorld}</span>
              </div>
            )}
            <div className="ap-hero__orbit" aria-hidden="true">
              <span className="ap-hero__orbit-ring ap-hero__orbit-ring--1" />
              <span className="ap-hero__orbit-ring ap-hero__orbit-ring--2" />
            </div>
          </div>
        </header>

        {/* ── SAVE BANNER ──────────────────────────────── */}
        {showSaveButton && (
          <div className="ap-save-banner">
            <div className="ap-save-banner__inner">
              <div className="ap-save-banner__icon">&#10022;</div>
              <p className="ap-save-banner__text">Keep this idea in your collection.</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saveLoading}
              className="ap-save-banner__btn"
            >
              {saveLoading ? 'Saving\u2026' : saveSuccess ? '\u2713\u00a0Saved!' : buttonText}
            </button>
          </div>
        )}

        {saveError && (
          <div className="ap-error-bar">
            <span>{saveError}</span>
            <button onClick={handleSave} disabled={saveLoading} className="ap-error-bar__retry">Retry</button>
          </div>
        )}

        {/* ── MAIN CANVAS ──────────────────────────────── */}
        <div className="ap-canvas">

          {/* LEFT — explanation + limitations */}
          <aside className="ap-left">

            <div className="ap-explanation">
              <span className="ap-explanation__ring" aria-hidden="true" />
              <div className="ap-explanation__header">
                <span className="ap-explanation__icon">&#128161;</span>
                <div>
                  <p className="ap-explanation__eyebrow">Think of it like this</p>
                  <p className="ap-explanation__subtitle">The familiar connection</p>
                </div>
              </div>
              <div className="ap-explanation__body">
                <ExplanationPanel explanation={analogyData.explanation} />
              </div>
            </div>

            {analogyData.explanation && analogyData.explanation.trim() && (
              <div className="ap-limitations">
                <span className="ap-limitations__tape" aria-hidden="true" />
                <p className="ap-limitations__eyebrow">But keep in mind&hellip;</p>
                <div className="ap-limitations__body">
                  <LimitationsPanel limitations={analogyData.limitations} />
                </div>
              </div>
            )}

          </aside>

          {/* RIGHT — visual + remix + cta */}
          <section className="ap-right">

            <div className="ap-visual-wrap">
              <div className="ap-visual-wrap__deco-tl" aria-hidden="true" />
              <div className="ap-visual-wrap__deco-br" aria-hidden="true" />

              {/* SVG corners inside visual card */}
              <svg className="ap-visual-wrap__svg-corner ap-visual-wrap__svg-corner--tl" aria-hidden="true"
                viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="16" stroke="#5424c7" strokeWidth="2.5" opacity="0.40" />
                <circle cx="20" cy="20" r="8"  fill="#5424c7" opacity="0.20" />
                <circle cx="60" cy="10" r="5"  fill="#ffb800" opacity="0.60" />
                <circle cx="10" cy="65" r="4"  fill="#17aaa7" opacity="0.55" />
                <line x1="36" y1="20" x2="55" y2="8" stroke="#5424c7" strokeWidth="1.2" opacity="0.30" />
              </svg>

              <svg className="ap-visual-wrap__svg-corner ap-visual-wrap__svg-corner--br" aria-hidden="true"
                viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="100" cy="100" r="18" stroke="#17aaa7" strokeWidth="2.5" opacity="0.40" />
                <circle cx="100" cy="100" r="9"  fill="#17aaa7" opacity="0.20" />
                <circle cx="60"  cy="110" r="5"  fill="#f27d6b" opacity="0.60" />
                <circle cx="110" cy="55"  r="4"  fill="#ffb800" opacity="0.55" />
                <line x1="82" y1="100" x2="65" y2="112" stroke="#17aaa7" strokeWidth="1.2" opacity="0.30" />
              </svg>

              <div className="ap-visual-header">
                <div className="ap-visual-header__label">
                  <span className="ap-visual-header__spark">&#10022;</span>
                  <div>
                    <p className="ap-visual-header__eyebrow">Visual model</p>
                    <p className="ap-visual-header__sub">Explore the connections</p>
                  </div>
                </div>
                <div className="ap-visual-header__count">
                  <span className="ap-visual-header__count-num">{(analogyData.nodes || []).length}</span>
                  <span className="ap-visual-header__count-label">nodes</span>
                </div>
              </div>

              <div className="ap-visual-canvas">
                <VisualModel
                  nodes={analogyData.nodes || []}
                  mappings={analogyData.mappings || []}
                  analogyWorld={analogyData.analogyWorld}
                    concept={analogyData.concept}
                />
              </div>

              <div className="ap-visual-footer">
                <span className="ap-visual-footer__dot" />
                <span>Interactive map</span>
                <span className="ap-visual-footer__sep">/</span>
                <span>Follow the relationship, not the arrows.</span>
              </div>
            </div>

            {user && (savedData?.id || savedData?._id) && (
              <div className="ap-remix">
                <div className="ap-remix__header">
                  <div>
                    <p className="ap-remix__eyebrow">Remix the idea</p>
                    <p className="ap-remix__title">Change how the connection clicks.</p>
                  </div>
                  <span className="ap-remix__icon" aria-hidden="true">&#10022;</span>
                </div>
                {modifying && (
                  <div className="ap-remix__loading">
                    <div className="ap-remix__spinner" />
                    <span>Remixing&hellip;</span>
                  </div>
                )}
                <ModificationControls
                  analogy={analogyData}
                  onModify={handleModify}
                  modifying={modifying}
                  error={modifyError}
                  onError={setModifyError}
                  worlds={worlds}
                />
              </div>
            )}

            {user && (savedData?.id || savedData?._id) && (
              <button
                onClick={() => navigate(`/practice/${savedData.id || savedData._id}`)}
                className="ap-practice-cta"
              >
                <div className="ap-practice-cta__text">
                  <p className="ap-practice-cta__eyebrow">Next step</p>
                  <p className="ap-practice-cta__heading">Does it actually click?</p>
                  <p className="ap-practice-cta__sub">Test what you just learned.</p>
                </div>
                <span className="ap-practice-cta__arrow">&rarr;</span>
              </button>
            )}

          </section>
        </div>

        <div className="ap-footer-note" aria-hidden="true">
          <span className="ap-footer-note__line" />
          <span className="ap-footer-note__text">Same idea &middot; different perspective</span>
          <span className="ap-footer-note__line" />
        </div>

      </main>

      <AuthModal
        isOpen={!user && showGuestPrompt && !promptDismissed}
        title="Enjoyed learning through Relate?"
        message="Create an account to save your analogies, practice your understanding, and track your progress."
        showMaybeLater={true}
        onClose={() => {
          setShowGuestPrompt(false)
          setPromptDismissed(true)
        }}
      />

    </div>
  )
}
  
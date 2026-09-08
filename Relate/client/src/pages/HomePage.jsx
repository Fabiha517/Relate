

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import { useAnalogy } from '../hooks/useAnalogy'
import { useGuestSession } from '../hooks/useGuestSession'

import ConceptForm from '../components/analogy/ConceptForm'
import WorldSelector from '../components/analogy/WorldSelector'
import AuthModal from '../components/ui/AuthModal'
import InfoModal from '../components/ui/InfoModal'

import Restaurant from '../assets/Restaurant.png'
import sports from '../assets/sports.png'
import movies from '../assets/movies.png'

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const {
    analogy,
    loading,
    error,
    generate,
    clearError,
  } = useAnalogy()

  const { set: setGuestSession } = useGuestSession()

  const [step, setStep] = useState(1)
  const [concept, setConcept] = useState('')
  const [analogyWorld, setAnalogyWorld] = useState(null)
  const [showGuestLimitModal, setShowGuestLimitModal] = useState(false)
  const [showMeaninglessModal, setShowMeaninglessModal] = useState(false)
  const [meaninglessMessage, setMeaninglessMessage] = useState('')

  async function handleConceptSubmit(conceptText) {
    setConcept(conceptText)
    setStep(2)
  }

  async function handleWorldSubmit(world) {
  
    setAnalogyWorld(world)

    try {
      const generatedAnalogy = await generate(concept, world)

      if (!user) {
        setGuestSession(generatedAnalogy)
      }

      navigate('/analogy', {
        state: {
          analogy: generatedAnalogy,
          concept,
          analogyWorld: world,
        },
      })
    } catch (err) {
      if (err.code === 'GUEST_LIMIT_REACHED') {
        setShowGuestLimitModal(true)
      } else if (err.code === 'MEANINGFULNESS_REJECTED') {
        setMeaninglessMessage(err.message || "That doesn't look like a concept we can explain yet. Try entering a meaningful topic, question, or concept.")
        setShowMeaninglessModal(true)
        // Go back to step 1 so user can re-enter
        setStep(1)
      }
      // AI_FAILURE is shown inline via error state in ConceptForm/WorldSelector
    }
  }

  function handleBack() {
    setStep(1)
    clearError()
  }

  /*
   * =========================================================
   * WORLD CARD CLICK
   * =========================================================
   */


  return (
    <div className="min-h-screen overflow-hidden bg-[#f8f1e5] text-[#071a38]">

      {/* =====================================================
          STEP 1
      ===================================================== */}

      {step === 1 && (
        <div className="relative min-h-screen overflow-hidden pb-6">

          {/* BACKGROUND DECORATION */}

          <div
            className="
              pointer-events-none
              absolute
              -left-32
              -top-32
              h-[420px]
              w-[420px]
              rounded-full
              bg-[#ffd84d]/20
              blur-3xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -right-40
              top-[30%]
              h-[500px]
              w-[500px]
              rounded-full
              bg-[#b89cff]/10
              blur-3xl
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-[245px]
              -left-[230px]
              h-[520px]
              w-[520px]
              rounded-full
              bg-[#ffb800]
            "
          />

          <div
            className="
              pointer-events-none
              absolute
              -bottom-[150px]
              -left-[90px]
              h-[320px]
              w-[320px]
              rounded-full
              bg-[#ffb800]
            "
          />

          {/* MAIN LAYOUT */}

          <div
            className="
              relative
              z-10
              mx-auto
              grid
              w-full
              max-w-[1700px]
              grid-cols-1
              px-6
              pt-8
              pb-10
              sm:px-10
              sm:pt-10
              lg:grid-cols-[1.05fr_0.95fr]
              lg:items-start
              lg:gap-8
              lg:px-14
              lg:pt-8
              lg:pb-16
              xl:gap-4
              xl:px-20
            "
          >

            {/* =================================================
                LEFT SIDE
            ================================================= */}

            <div
              className="
                flex
                min-w-0
                flex-col
                justify-start
                lg:pt-8
                xl:pt-10
              "
            >

              {/* HERO */}

              <section>
                <div className="relative lg:w-fit">

                  <h1
                    className="
                      m-0
                      font-black
                      uppercase
                      leading-[0.72]
                      tracking-[-0.08em]
                      text-[#071a38]
                      text-[clamp(5.5rem,12vw,10.5rem)]
                    "
                  >
                    MAKE IT
                  </h1>

                  <span
                    className="
                      absolute
                      bottom-[2%]
                      right-[-5%]
                      h-[24px]
                      w-[24px]
                      rounded-full
                      bg-[#ffb800]
                      sm:h-[30px]
                      sm:w-[30px]
                      lg:h-[34px]
                      lg:w-[34px]
                    "
                  />

                  <span
                    className="
                      absolute
                      left-[-5%]
                      top-[10%]
                      h-[24px]
                      w-[24px]
                      rounded-full
                      bg-[#ffb800]
                      sm:h-[30px]
                      sm:w-[30px]
                      lg:h-[34px]
                      lg:w-[34px]
                    "
                  />

                  <div
                    className="
                      relate-card
                      relate-card-sports
                      pointer-events-none
                      absolute
                      right-[25%]
                      top-[72%]
                      z-[3]
                      hidden
                      h-20
                      w-20
                      rounded-full
                      border-[3px]
                      border-[#20aaa7]
                      bg-transparent
                      md:block
                    "
                  />

                  <h1
                    className="
                      m-0
                      mt-4
                      font-black
                      uppercase
                      leading-[0.72]
                      tracking-[-0.08em]
                      text-[#5424c7]
                      font-semibold
                      text-[clamp(5.5rem,12vw,10.5rem)]
                    "
                  >
                    CLICK
                  </h1>
                </div>

                <p
                  className="
                    mt-7
                    max-w-[500px]
                    text-[18px]
                    font-medium
                    leading-[1.35]
                    text-[#162b48]
                    sm:text-[20px]
                    lg:mt-8
                    lg:text-[23px]
                    xl:text-[24px]
                  "
                >
                  Understand difficult ideas
                  <br />
                  through things you already know.
                </p>
              </section>

              {/* PROMPT */}

              <section
                className="
                  relative
                  mt-8
                  w-full
                  max-w-[580px]
                  sm:mt-9
                  lg:mt-10
                  xl:max-w-[620px]
                "
              >

                <div
                  className="
                    relative
                    z-10
                    rounded-[14px]
                    border-2
                    border-[#53677c]
                    bg-[#f8f1e5]/95
                    p-6
                    shadow-[5px_6px_0_rgba(7,26,56,0.10)]
                    sm:p-7
                  "
                >

                  <label
                    htmlFor="concept"
                    className="
                      mb-5
                      block
                      text-[20px]
                      font-bold
                      leading-tight
                      text-[#071a38]
                      sm:text-[21px]
                      lg:text-[22px]
                    "
                  >
                    What are you trying
                    <br />
                    to understand?
                  </label>

                  <ConceptForm
                    value={concept}
                    onChange={setConcept}
                    onSubmit={handleConceptSubmit}
                    loading={loading}
                    error={error}
                    disabled={false}
                  />

                  <div className="mt-5">

                    <p
                      className="
                        mb-3
                        text-[10px]
                        font-black
                        uppercase
                        tracking-widest
                        text-[#526477]
                      "
                    >
                      Example Questions
                    </p>

                    <div className="flex flex-wrap gap-2">

                      {[
                        'recursion',
                        'black holes',
                        'blockchain',
                        'photosynthesis',
                      ].map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => setConcept(topic)}
                          className="
                            rounded-full
                            border
                            border-[#c9c5bb]
                            bg-[#f5f0e6]
                            px-4
                            py-1.5
                            text-[11px]
                            font-medium
                            text-[#263953]
                            transition
                            hover:-translate-y-0.5
                            hover:bg-white
                          "
                        >
                          {topic}
                        </button>
                      ))}

                    </div>
                  </div>
                </div>

                {!user && (
                  <p
                    className="
                      mt-3
                      text-center
                      text-[11px]
                      font-medium
                      leading-relaxed
                      text-[#526477]
                    "
                  >
                    You get 1 free analogy. Create an account 
                    <br className="hidden sm:block" />
                     {' '}to save and practice!
                  </p>
                )}
              </section>

            </div>

            {/* =================================================
                RIGHT SIDE â€” WORLD CARDS
            ================================================= */}

            <section
              className="
                relative
                mt-8
                flex
                min-w-0
                items-start
                justify-center
                lg:mt-0
                lg:pt-0
                xl:pt-2
                
              "
            >

              {/* DECORATIVE RING */}

              <div
                className="
                  relate-card
                  relate-card-movies
                  pointer-events-none
                  absolute
                  right-[5%]
                  top-[5%]
                  z-[3]
                  hidden
                  h-20
                  w-20
                  rounded-full
                  border-[3px]
                  border-[#20aaa7]
                  bg-transparent
                  lg:block
                "
              />

              {/* =================================================
                  WORLD CARDS CONTAINER

                  MOBILE  = vertical
                  TABLET  = ONE LINE
                  DESKTOP = vertical
              ================================================= */}

              <div
                className="
                  relative
  flex
  w-full
  max-w-[520px]
  flex-col
  items-center
  justify-center
  gap-5
  py-2
  md:max-w-[760px]
  md:flex-row
  md:gap-5
  lg:max-w-[680px]
  lg:flex-col
  lg:gap-10
  lg:scale-[1.08]
  xl:scale-[1.12]
                "
              >

{/* =========================================================
    NETWORK SVG
    Responsive curved network
    Desktop artwork preserved
========================================================= */}
<svg
  className="
    pointer-events-none
    absolute
    inset-0
    z-0
    block
    h-full
    w-full
  "
  viewBox="0 0 600 620"
  fill="none"
  preserveAspectRatio="none"
  aria-hidden="true"
>

  {/* =======================================================
      MOBILE
      Vertical card stack
      Large curved network surrounding the cards
  ======================================================= */}
  <g className="block md:hidden">

    {/* -------------------------------------------------------
        LEFT OUTER SWEEP
    ------------------------------------------------------- */}
    <path
      className="relate-network-path"
      d="
        M 125 120
        C 55 155, 45 230, 105 260
        C 155 285, 185 300, 145 340
        C 105 380, 55 410, 95 455
        C 130 495, 175 510, 155 570
      "
      stroke="#536777"
      strokeWidth="2"
      strokeDasharray="3 8"
      strokeLinecap="round"
      fill="none"
      opacity="0.82"
    />

    {/* -------------------------------------------------------
        RIGHT OUTER SWEEP
    ------------------------------------------------------- */}
    <path
      className="relate-network-path"
      d="
        M 470 105
        C 545 145, 555 215, 500 250
        C 455 280, 420 300, 470 335
        C 520 370, 555 420, 505 455
        C 470 480, 425 505, 455 565
      "
      stroke="#536777"
      strokeWidth="2"
      strokeDasharray="2 9"
      strokeLinecap="round"
      fill="none"
      opacity="0.78"
    />

    {/* -------------------------------------------------------
        UPPER CROSSING CURVE
    ------------------------------------------------------- */}
    <path
      className="relate-network-path"
      d="
        M 105 155
        C 180 115, 270 135, 325 175
        C 370 208, 420 205, 495 155
      "
      stroke="#536777"
      strokeWidth="1.7"
      strokeDasharray="2 9"
      strokeLinecap="round"
      fill="none"
      opacity="0.88"
    />

    {/* -------------------------------------------------------
        MAIN CENTRAL WAVE
    ------------------------------------------------------- */}
    <path
      className="relate-network-path"
      d="
        M 105 205
        C 170 165, 235 180, 285 225
        C 335 270, 390 270, 495 215
      "
      stroke="#536777"
      strokeWidth="2"
      strokeDasharray="3 8"
      strokeLinecap="round"
      fill="none"
      opacity="0.88"
    />

    {/* -------------------------------------------------------
        SECOND CENTRAL WAVE
    ------------------------------------------------------- */}
    <path
      className="relate-network-path"
      d="
        M 495 285
        C 430 250, 370 285, 330 320
        C 290 355, 220 350, 105 295
      "
      stroke="#536777"
      strokeWidth="1.7"
      strokeDasharray="2 9"
      strokeLinecap="round"
      fill="none"
      opacity="0.84"
    />

    {/* -------------------------------------------------------
        DIAGONAL CROSSOVER
    ------------------------------------------------------- */}
    <path
      className="relate-network-path"
      d="
        M 130 325
        C 205 285, 255 300, 300 345
        C 345 390, 405 405, 475 350
      "
      stroke="#536777"
      strokeWidth="2"
      strokeDasharray="3 8"
      strokeLinecap="round"
      fill="none"
      opacity="0.78"
    />

    {/* -------------------------------------------------------
        LOWER LOOP
    ------------------------------------------------------- */}
    <path
      className="relate-network-path"
      d="
        M 105 405
        C 170 370, 235 385, 285 430
        C 335 475, 405 475, 495 405
      "
      stroke="#536777"
      strokeWidth="1.7"
      strokeDasharray="2 9"
      strokeLinecap="round"
      fill="none"
      opacity="0.90"
    />

    {/* -------------------------------------------------------
        LOWER RETURN ARC
    ------------------------------------------------------- */}
    <path
      className="relate-network-path"
      d="
        M 155 470
        C 215 440, 270 455, 315 495
        C 355 530, 405 540, 455 500
      "
      stroke="#536777"
      strokeWidth="2"
      strokeDasharray="3 8"
      strokeLinecap="round"
      fill="none"
      opacity="0.78"
    />

    {/* -------------------------------------------------------
        SMALL FLOATING CURVE
    ------------------------------------------------------- */}
    <path
      className="relate-network-path"
      d="
        M 450 175
        C 405 195, 390 225, 415 250
        C 440 275, 455 290, 440 315
      "
      stroke="#536777"
      strokeWidth="1.5"
      strokeDasharray="2 9"
      strokeLinecap="round"
      fill="none"
      opacity="0.70"
    />

    {/* -------------------------------------------------------
        MOBILE NODES
    ------------------------------------------------------- */}
    <circle
      cx="125"
      cy="120"
      r="6"
      fill="#071a38"
    />

    <circle
      cx="495"
      cy="215"
      r="6"
      fill="#071a38"
    />

    <circle
      cx="105"
      cy="405"
      r="6"
      fill="#071a38"
    />

    <circle
      cx="455"
      cy="500"
      r="7"
      fill="#071a38"
    />

    <circle
      cx="300"
      cy="345"
      r="9"
      fill="#f8f1e5"
      stroke="#19aaa7"
      strokeWidth="3"
    />

  </g>


  {/* =======================================================
      TABLET / LAPTOP
      Horizontal card row
      Curves travel ABOVE + BELOW + BETWEEN cards
  ======================================================= */}
  <g className="hidden md:block lg:hidden">

    {/* -------------------------------------------------------
        LARGE TOP ARC
    ------------------------------------------------------- */}
    <path
      className="relate-network-path"
      d="
        M 65 315
        C 90 235, 175 190, 265 230
        C 330 260, 375 255, 440 220
        C 510 185, 555 225, 570 300
      "
      stroke="#536777"
      strokeWidth="2"
      strokeDasharray="3 8"
      strokeLinecap="round"
      fill="none"
      opacity="0.82"
    />

    {/* -------------------------------------------------------
        TOP INNER WAVE
    ------------------------------------------------------- */}
    <path
      className="relate-network-path"
      d="
        M 80 330
        C 150 280, 205 275, 260 310
        C 315 345, 370 345, 430 295
        C 480 255, 525 265, 565 315
      "
      stroke="#536777"
      strokeWidth="1.7"
      strokeDasharray="2 9"
      strokeLinecap="round"
      fill="none"
      opacity="0.90"
    />

    {/* -------------------------------------------------------
        MAIN CENTRAL WAVE
    ------------------------------------------------------- */}
    <path
      className="relate-network-path"
      d="
        M 65 355
        C 125 390, 185 385, 235 345
        C 285 305, 330 300, 380 340
        C 430 380, 485 390, 565 350
      "
      stroke="#536777"
      strokeWidth="2"
      strokeDasharray="3 8"
      strokeLinecap="round"
      fill="none"
      opacity="0.88"
    />

    {/* -------------------------------------------------------
        LARGE LOWER ARC
    ------------------------------------------------------- */}
    <path
      className="relate-network-path"
      d="
        M 55 385
        C 100 470, 190 490, 255 445
        C 315 405, 365 400, 430 445
        C 485 480, 540 455, 570 390
      "
      stroke="#536777"
      strokeWidth="1.7"
      strokeDasharray="2 9"
      strokeLinecap="round"
      fill="none"
      opacity="0.80"
    />

    {/* -------------------------------------------------------
        LOWER CROSSOVER
    ------------------------------------------------------- */}
    <path
      className="relate-network-path"
      d="
        M 95 420
        C 155 375, 215 375, 270 420
        C 325 465, 380 465, 440 410
        C 485 370, 530 370, 560 415
      "
      stroke="#536777"
      strokeWidth="2"
      strokeDasharray="3 8"
      strokeLinecap="round"
      fill="none"
      opacity="0.78"
    />

    {/* -------------------------------------------------------
        LONG DIAGONAL SWEEP
    ------------------------------------------------------- */}
    <path
      className="relate-network-path"
      d="
        M 115 270
        C 175 350, 235 375, 300 315
        C 355 265, 420 275, 485 350
        C 510 380, 535 385, 565 365
      "
      stroke="#536777"
      strokeWidth="1.5"
      strokeDasharray="2 9"
      strokeLinecap="round"
      fill="none"
      opacity="0.86"
    />

    {/* -------------------------------------------------------
        RIGHT-SIDE LOOP
    ------------------------------------------------------- */}
    <path
      className="relate-network-path"
      d="
        M 430 245
        C 470 270, 485 300, 465 330
        C 445 360, 425 380, 450 405
        C 475 430, 510 425, 535 400
      "
      stroke="#536777"
      strokeWidth="1.5"
      strokeDasharray="2 9"
      strokeLinecap="round"
      fill="none"
      opacity="0.72"
    />

    {/* -------------------------------------------------------
        TABLET NODES
    ------------------------------------------------------- */}
    <circle
      cx="65"
      cy="315"
      r="6"
      fill="#071a38"
    />

    <circle
      cx="265"
      cy="230"
      r="6"
      fill="#071a38"
    />

    <circle
      cx="380"
      cy="340"
      r="7"
      fill="#071a38"
    />

    <circle
      cx="560"
      cy="415"
      r="6"
      fill="#071a38"
    />

    <circle
      cx="300"
      cy="315"
      r="9"
      fill="#f8f1e5"
      stroke="#19aaa7"
      strokeWidth="3"
    />

  </g>


  {/* =======================================================
      DESKTOP
      ORIGINAL NETWORK — UNCHANGED
  ======================================================= */}
  <g className="hidden lg:block">

    <path
      className="relate-network-path"
      d="M 235 105 C 330 120, 390 150, 455 220 C 500 275, 485 330, 430 365"
      stroke="#536777"
      strokeWidth="2"
      strokeDasharray="3 8"
      strokeLinecap="round"
      opacity="0.80"
    />

    <path
      className="relate-network-path"
      d="M 455 270 C 390 310, 350 360, 400 430"
      stroke="#536777"
      strokeWidth="2"
      strokeDasharray="3 8"
      strokeLinecap="round"
      opacity="0.80"
    />

    <path
      className="relate-network-path"
      d="M 350 90 C 210 100, 110 190, 110 330 C 110 470, 210 550, 350 570"
      stroke="#536777"
      strokeWidth="2"
      strokeDasharray="2 9"
      strokeLinecap="round"
      fill="none"
      opacity="0.75"
    />

    <path
      className="relate-network-path"
      d="M 280 100 C 360 80, 485 120, 410 210 C 350 280, 300 330, 335 410"
      stroke="#536777"
      strokeWidth="1.5"
      strokeDasharray="2 9"
      strokeLinecap="round"
      opacity="0.90"
    />

    <circle
      cx="235"
      cy="105"
      r="7"
      fill="#071a38"
    />

    <circle
      cx="455"
      cy="220"
      r="7"
      fill="#071a38"
    />

    <circle
      cx="400"
      cy="430"
      r="7"
      fill="#071a38"
    />

    <circle
      cx="310"
      cy="335"
      r="9"
      fill="#f8f1e5"
      stroke="#19aaa7"
      strokeWidth="3"
    />

  </g>

</svg>  
                {/* =================================================
                    RESTAURANT CARD
                ================================================= */}

                <button
                  type="button"
            
                  disabled={loading}
                  className="
                    relate-card
                    relate-card-restaurant
                    relative
                    z-10
                    mr-0
                    h-[175px]
                    w-[270px]
                    shrink-0
                    rotate-[-5deg]
                    rounded-[16px]
                    bg-[#ff5755]
                    p-6
                    text-left
                    shadow-[0_7px_0_rgba(7,26,56,0.08)]
                    transition
                    duration-200
                    hover:-translate-y-2
                    hover:rotate-[-3deg]
                    hover:shadow-[0_12px_0_rgba(7,26,56,0.12)]
                    active:translate-y-0
                    disabled:cursor-wait
                    disabled:opacity-70

                    md:h-[145px]
                    md:w-[205px]
                    md:p-5

                    lg:h-[175px]
                    lg:w-[270px]
                    lg:mr-[18%]
                    lg:mt-8
                    lg:p-6
                  "
                >

                  <div className="relate-card-shine" />

                  <h3
                    className="
                      text-[21px]
                      font-black
                      uppercase
                      tracking-tight
                      text-[#071a38]

                      md:text-[17px]

                      lg:text-[21px]
                    "
                  >
                    RESTAURANT
                  </h3>

                  <p
                    className="
                      mt-2
                      w-[145px]
                      text-[13px]
                      font-medium
                      leading-[1.35]
                      text-[#15213a]

                      md:w-[115px]
                      md:text-[11px]

                      lg:w-[145px]
                      lg:text-[13px]
                    "
                  >
                    Orders, Chefs,
                    <br />
                    Kitchen, Service
                  </p>

                  <img
                    src={Restaurant}
                    alt=""
                    className="
                      relate-card-image
                      absolute
                      bottom-1
                      right-2
                      h-[130px]
                      w-[135px]
                      object-contain

                      md:h-[105px]
                      md:w-[105px]

                      lg:h-[130px]
                      lg:w-[135px]
                    "
                  />

                </button>

                {/* =================================================
                    SPORTS CARD
                ================================================= */}

                <button
                  type="button"
             
                  disabled={loading}
                  className="
                    relate-card
                    relate-card-sports
                    relative
                    z-10
                    ml-0
                    h-[175px]
                    w-[270px]
                    shrink-0
                    rotate-[2deg]
                    rounded-[16px]
                    bg-[#17aaa7]
                    p-6
                    text-left
                    shadow-[0_7px_0_rgba(7,26,56,0.08)]
                    transition
                    duration-200
                    hover:-translate-y-2
                    hover:rotate-[3deg]
                    hover:shadow-[0_12px_0_rgba(7,26,56,0.12)]
                    active:translate-y-0
                    disabled:cursor-wait
                    disabled:opacity-70

                    md:h-[145px]
                    md:w-[205px]
                    md:p-5

                    lg:h-[175px]
                    lg:w-[270px]
                    lg:ml-[18%]
                    lg:p-6
                  "
                >

                  <div className="relate-card-shine" />

                  <h3
                    className="
                      text-[21px]
                      font-black
                      uppercase
                      tracking-tight
                      text-[#071a38]

                      md:text-[17px]

                      lg:text-[21px]
                    "
                  >
                    SPORTS
                  </h3>

                  <p
                    className="
                      mt-2
                      w-[145px]
                      text-[13px]
                      font-medium
                      leading-[1.35]
                      text-[#15213a]

                      md:w-[115px]
                      md:text-[11px]

                      lg:w-[145px]
                      lg:text-[13px]
                    "
                  >
                    Teams, Plays,
                    <br />
                    Strategy, Wins
                  </p>

                  <img
                    src={sports}
                    alt=""
                    className="
                      relate-card-image
                      absolute
                      bottom-0
                      right-2
                      h-[135px]
                      w-[135px]
                      object-contain

                      md:h-[110px]
                      md:w-[110px]

                      lg:h-[135px]
                      lg:w-[135px]
                    "
                  />

                </button>

                {/* =================================================
                    MOVIES CARD
                ================================================= */}

                <button
                  type="button"
                 
                  disabled={loading}
                  className="
                    relate-card
                    relate-card-movies
                    relative
                    z-10
                    mr-0
                    h-[175px]
                    w-[270px]
                    shrink-0
                    rotate-[-3deg]
                    rounded-[16px]
                    bg-[#5b38d1]
                    p-6
                    text-left
                    shadow-[0_7px_0_rgba(7,26,56,0.08)]
                    transition
                    duration-200
                    hover:-translate-y-2
                    hover:rotate-[-2deg]
                    hover:shadow-[0_12px_0_rgba(7,26,56,0.12)]
                    active:translate-y-0
                    disabled:cursor-wait
                    disabled:opacity-70

                    md:h-[145px]
                    md:w-[205px]
                    md:p-5

                    lg:h-[175px]
                    lg:w-[270px]
                    lg:mr-[5%]
                    lg:p-6
                  "
                >

                  <div className="relate-card-shine" />

                  <h3
                    className="
                      text-[21px]
                      font-black
                      uppercase
                      tracking-tight
                      text-[#071a38]

                      md:text-[17px]

                      lg:text-[21px]
                    "
                  >
                    MOVIES
                  </h3>

                  <p
                    className="
                      mt-2
                      w-[145px]
                      text-[13px]
                      font-medium
                      leading-[1.35]
                      text-[#15213a]

                      md:w-[115px]
                      md:text-[11px]

                      lg:w-[145px]
                      lg:text-[13px]
                    "
                  >
                    Scenes, Roles,
                    <br />
                    Plot, Direction
                  </p>

                  <img
                    src={movies}
                    alt=""
                    className="
                      relate-card-image
                      absolute
                      bottom-1
                      right-2
                      h-[135px]
                      w-[135px]
                      object-contain

                      md:h-[110px]
                      md:w-[110px]

                      lg:h-[135px]
                      lg:w-[135px]
                    "
                  />

                </button>

              </div>
            </section>
 <div
                className="
                  relative
                  mt-8
                  hidden
                  w-fit
                  items-center
                  gap-3
                  pb-8
                  lg:flex
                  lg:absolute
                  lg:bottom-[-1%]
                  lg:left-[6%]
                  lg:mt-0
                  
                  lg:pb-0
                "
              >

                <div
                  className="
                    flex
                    h-[58px]
                    w-[58px]
                    flex-shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#e5edf3]
                    text-[27px]
                    sm:h-[65px]
                    sm:w-[65px]
                    sm:text-[29px]
                    lg:h-[72px]
                    lg:w-[72px]
                    lg:text-[32px]
                  "
                >
                  ✨
                </div>

                <p
                  className="
                    max-w-[180px]
                    font-serif
                    text-[14px]
                    italic
                    leading-[1.25]
                    text-[#162b48]
                    sm:text-[16px]
                    lg:text-[17px]
                  "
                >
                  AI turns
                  <br />
                  complex into
                  <br />
                  relatable.
                </p>

                <svg
                  className="
                    pointer-events-none
                    absolute
                    left-[100px]
                    top-[45px]
                    hidden
                    w-[125px]
                    lg:left-[155px]
                    lg:top-[40px]
                    lg:block
                    lg:w-[145px]
                  "
                  viewBox="0 0 150 60"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 8 C35 50, 100 55, 135 20"
                    stroke="#536777"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />

                  <path
                    d="M125 18 L138 18 L133 30"
                    stroke="#536777"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

              </div>
          </div>
        </div>
      )}

     

    {/* =========================================================
    STEP 2 — CHOOSE YOUR WORLD
========================================================= */}
{step === 2 && (
  <div
    className="
      relative
      min-h-screen
      overflow-hidden
      bg-[#f8f1e5]
      text-[#071a38]
    "
  >
    {/* =====================================================
        BACKGROUND DECORATION
    ===================================================== */}

    {/* Soft yellow sun */}
    <div
      className="
        pointer-events-none
        absolute
        -right-28
        -top-28
        h-[360px]
        w-[360px]
        rounded-full
        bg-[#ffb800]
        opacity-70
        sm:h-[470px]
        sm:w-[470px]
      "
    />

       <div
                className="
                  relate-card
                  relate-card-movies
                  pointer-events-none
                  absolute
                  left-[35%]
                  top-[5%]
                  z-[3]
                  hidden
                  h-20
                  w-20
                  rounded-full
                  border-[3px]
                  border-[#DC95FF]
                  bg-transparent
                  lg:block
                "
              />
              <div
                className="
                  relate-card
                  relate-card-movies
                  pointer-events-none
                  absolute
right-[45%]
top-[1%]
                  md:left-[37%]
                  md:top-[4%]
                  z-[3]
                  
                  h-20
                  w-20
                  rounded-full
                  border-[3px]
                  border-[#DC95FF]
                  bg-transparent
                  
                "
              />
                 <div
                className="
                  relate-card
                  relate-card-sports
                  pointer-events-none
                  absolute
                  left-[45%]
                  top-[15%]
                  z-[3]
                  hidden
                  h-20
                  w-20
                  rounded-full
                  border-[3px]
                  border-[#FF7F50]
                  bg-transparent
                  lg:block
                "
              />
    {/* Soft purple organic glow */}
    <div
      className="
        pointer-events-none
        absolute
        -bottom-40
        -left-40
        h-[460px]
        w-[460px]
        rounded-full
        bg-[#5424c7]
        opacity-[0.06]
        blur-3xl
        sm:h-[560px]
        sm:w-[560px]
      "
    />

    {/* Decorative teal ring */}
    <div
      className="
      relate-card
      relate-card-movies
        pointer-events-none
        absolute
        left-[3%]
        top-[30%]
        hidden
        h-20
        w-20
        rounded-full
        border-[3px]
        border-[#17aaa7]
        opacity-70
        lg:block
      "
    />

    {/* =====================================================
        MAIN
    ===================================================== */}

    <div
      className="
        relative
        z-10
        mx-auto
        flex
        min-h-screen
        w-full
        max-w-[1500px]
        flex-col
        px-5
        py-6
        sm:px-8
        sm:py-8
        md:px-12
        lg:px-16
        lg:py-9
        xl:px-20
      "
    >
      {/* ===================================================
          TOP BAR
      =================================================== */}

      <div className="flex items-center justify-between gap-4">
        {/* BACK */}

        <button
          type="button"
          onClick={handleBack}
          disabled={loading}
          className="
            group
            inline-flex
            items-center
            gap-2
            rounded-full
            border-2
            border-[#071a38]
            bg-[#f8f1e5]
            px-4
            py-2
            text-xs
            font-black
            text-[#071a38]
            shadow-[3px_3px_0_#071a38]
            transition-all
            hover:-translate-y-0.5
            hover:shadow-[4px_4px_0_#071a38]
            active:translate-y-0
            active:shadow-[1px_1px_0_#071a38]
            disabled:cursor-not-allowed
            disabled:opacity-50
            sm:px-5
            sm:py-2.5
            sm:text-sm
          "
        >
          <span
            className="
              text-lg
              leading-none
              transition-transform
              group-hover:-translate-x-1
            "
          >
            ←
          </span>

          Back
        </button>

        {/* STEP INDICATOR */}

        <div className="flex items-center gap-2 sm:gap-3">
          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              border-2
              border-[#071a38]
              bg-[#071a38]
              text-xs
              font-black
              text-white
            "
          >
            1
          </div>

          <div className="h-[3px] w-8 rounded-full bg-[#071a38] sm:w-12" />

          <div
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-full
              border-2
              border-[#5424c7]
              bg-[#5424c7]
              text-xs
              font-black
              text-white
              sm:h-9
              sm:w-9
            "
          >
            2
          </div>
        </div>
      </div>

      {/* ===================================================
          HERO
      =================================================== */}

      <section
        className="
          relative
          mt-7
          mb-8
          overflow-hidden
         min-h-[250px]
sm:mt-7
sm:min-h-[260px]
lg:mb-7
lg:min-h-[270px]
        "
      >
        {/* -------------------------------------------------
            ORGANIC YELLOW SHAPE
        ------------------------------------------------- */}

        <div
          className="
            pointer-events-none
            absolute
            right-[2%]
            top-[3%]
            h-[210px]
            w-[210px]
            rounded-[42%_58%_61%_39%/47%_42%_58%_53%]
            bg-[#ffb800]
            opacity-85
            sm:h-[250px]
            sm:w-[250px]
            lg:h-[285px]
            lg:w-[285px]
          "
        />

        {/* -------------------------------------------------
            ORGANIC PURPLE SHAPE
        ------------------------------------------------- */}

        <div
          className="
            pointer-events-none
            absolute
            right-[20%]
            bottom-[2%]
            h-20
            w-28
            rotate-[-12deg]
            rounded-[48%_52%_42%_58%/60%_40%_60%_40%]
            bg-[#5424c7]
            opacity-10
            sm:h-24
            sm:w-36
          "
        />

        {/* -------------------------------------------------
            TEAL DOT
        ------------------------------------------------- */}

        <div
          className="
            pointer-events-none
            absolute
            right-[7%]
            top-[30%]
            h-4
            w-4
            rounded-full
            bg-[#17aaa7]
            sm:h-5
            sm:w-5
          "
        />

        {/* -------------------------------------------------
            LITTLE YELLOW DOT
        ------------------------------------------------- */}

        <div
          className="
            pointer-events-none
            absolute
            left-[45%]
            bottom-[8%]
            h-3
            w-3
            rounded-full
            bg-[#ffb800]
          "
        />

        {/* -------------------------------------------------
            LITTLE SPARKLE
        ------------------------------------------------- */}

        <div
          className="
            pointer-events-none
            absolute
            right-[30%]
            top-[10%]
            text-xl
            font-black
            text-[#5424c7]
            opacity-70
            sm:text-2xl
          "
        >
          ✦
        </div>

        {/* -------------------------------------------------
            HERO CONTENT
        ------------------------------------------------- */}

        <div
          className="
            relative
            z-10
            grid
            h-full
            min-h-[250px]
            grid-cols-1
            items-center
            gap-5
            sm:min-h-[260px]
            lg:grid-cols-[1fr_0.9fr]
            lg:gap-8
          "
        >
          {/* ===============================================
              LEFT — MESSAGE
          =============================================== */}

          <div className="relative">
            {/* Floating step label */}

            <div
              className="
                mb-5
                inline-flex
                rotate-[-2deg]
                items-center
                gap-2
                rounded-full
                bg-[#071a38]
                px-4
                py-2
                text-[9px]
                font-black
                uppercase
                tracking-[0.18em]
                text-white
                shadow-[3px_3px_0_#5424c7]
                sm:px-5
                sm:py-2.5
                sm:text-[10px]
              "
            >
              <span className="h-2 w-2 rounded-full bg-[#ffb800]" />
              Step 02
            </div>

            {/* Main heading */}

            <h1
              className="
                max-w-[650px]
                text-[clamp(3.4rem,7vw,6.4rem)]
                font-black
                uppercase
                leading-[0.8]
                tracking-[-0.075em]
                text-[#071a38]
              "
            >
              LET'S FIND
              <br />

              <span className="relative inline-block text-[#5424c7] font-semibold">
                A WAY IN.
              </span>
            </h1>

            {/* Subtitle */}

            <p
              className="
                mt-5
                max-w-[470px]
                text-sm
                font-medium
                leading-[1.55]
                text-[#526477]
                sm:text-base
                lg:text-lg
              "
            >
              Pick something familiar and we'll use it
              to make your idea click.
            </p>
          </div>

          {/* ===============================================
              RIGHT — ILLUSTRATED CONCEPT
          =============================================== */}

          <div
            className="
              relative
              flex
              min-h-[230px]
              items-center
              justify-center
              lg:min-h-[280px]
            "
          >
            {/* ---------------------------------------------
                FLOATING "9 WORLDS" LABEL
            --------------------------------------------- */}

            <div
              className="
                absolute
                left-[2%]
                top-[8%]
                z-20
                rotate-[-7deg]
                rounded-[18px]
                border-2
                border-[#071a38]
                bg-[#fffaf1]
                px-4
                py-3
                shadow-[4px_4px_0_#071a38]
                sm:px-5
                sm:py-3.5
                lg:left-0
              "
            >
              <p
                className="
                  text-2xl
                  font-black
                  leading-none
                  tracking-[-0.04em]
                  text-[#071a38]
                  sm:text-3xl
                "
              >
                09
              </p>

              <p
                className="
                  mt-1
                  text-[8px]
                  font-black
                  uppercase
                  tracking-[0.16em]
                  text-[#526477]
                  sm:text-[9px]
                "
              >
                familiar worlds
              </p>
            </div>

            {/* ---------------------------------------------
                MAIN ORGANIC CONCEPT SHAPE
            --------------------------------------------- */}

            <div
              className="
                relative
                z-10
                flex
                h-[190px]
                w-[270px]
                rotate-[3deg]
                items-center
                justify-center
                rounded-[48%_52%_44%_56%/52%_43%_57%_48%]
                bg-[#fffaf1]
                shadow-[8px_9px_0_rgba(7,26,56,0.12)]
                sm:h-[220px]
                sm:w-[320px]
                lg:h-[245px]
                lg:w-[355px]
              "
            >
              {/* inner yellow blob */}

              <div
                className="
                  pointer-events-none
                  absolute
                  right-[-10px]
                  top-[-12px]
                  h-16
                  w-16
                  rounded-full
                  bg-[#ffb800]
                  opacity-60
                  sm:h-20
                  sm:w-20
                "
              />

              {/* concept content */}

              <div className="relative z-10 w-[72%] -rotate-[3deg]">
                <p
                  className="
                    text-[8px]
                    font-black
                    uppercase
                    tracking-[0.2em]
                    text-[#526477]
                    sm:text-[9px]
                  "
                >
                  You're exploring
                </p>

                <div className="mt-2 flex items-start gap-2.5">
                  <span
                    className="
                      mt-1.5
                      h-3
                      w-3
                      shrink-0
                      rounded-full
                      bg-[#5424c7]
                      sm:h-3.5
                      sm:w-3.5
                    "
                  />

                  <p
                    className="
                      break-words
                      text-xl
                      font-black
                      leading-[1.05]
                      tracking-[-0.03em]
                      text-[#071a38]
                      sm:text-2xl
                      lg:text-[1.75rem]
                    "
                  >
                    {concept}
                  </p>
                </div>
              </div>
            </div>

            {/* ---------------------------------------------
                FLOATING "PICK ONE" TAG
            --------------------------------------------- */}

            <div
              className="
                absolute
                bottom-[3%]
                right-[4%]
                z-20
                rotate-[5deg]
                rounded-full
                bg-[#17aaa7]
                px-4
                py-2
                text-[9px]
                font-black
                uppercase
                tracking-[0.14em]
                text-[#071a38]
                shadow-[3px_3px_0_#071a38]
                sm:px-5
                sm:py-2.5
                sm:text-[10px]
              "
            >
              Pick one →
            </div>

            {/* ---------------------------------------------
                FLOATING PURPLE DOT
            --------------------------------------------- */}

            <div
              className="
                absolute
                bottom-[18%]
                left-[12%]
                h-5
                w-5
                rounded-full
                border-[3px]
                border-[#5424c7]
                bg-transparent
                sm:h-6
                sm:w-6
              "
            />

            {/* ---------------------------------------------
                FLOATING STAR
            --------------------------------------------- */}

            <div
              className="
                absolute
                bottom-[12%]
                right-[22%]
                z-20
                text-lg
                font-black
                text-[#ffb800]
                sm:text-2xl
              "
            >
              ✦
            </div>
          </div>
        </div>
      </section>

      {/* =================================================
          WORLD SELECTION
          EVERYTHING BELOW HERE IS KEPT AS-IS
      ================================================= */}

      <div className="flex flex-1 flex-col">
        <section>
          <div
            className="
              mb-4
              flex
              items-end
              justify-between
              gap-4
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-black
                  uppercase
                  tracking-[0.2em]
                  text-[#526477]
                  sm:text-xs
                "
              >
                Pick your lens
              </p>

              <p className="mt-1 text-sm font-medium text-[#34465d]">
                Nine familiar ways to make it click.
              </p>
            </div>

            {analogyWorld && (
              <div
                className="
                  shrink-0
                  rounded-full
                  bg-[#17aaa7]
                  px-3
                  py-1.5
                  text-[9px]
                  font-black
                  uppercase
                  tracking-wider
                  text-[#071a38]
                  shadow-[2px_2px_0_#071a38]
                  sm:px-4
                  sm:py-2
                  sm:text-[10px]
                "
              >
                ✓ Selected
              </div>
            )}
          </div>

          {/* WorldSelector fetches and displays all 9 worlds */}

          <div
            className="
              relative
              rounded-[24px]
              border-2
              border-[#071a38]
              bg-[#fffaf1]/75
              p-4
              shadow-[7px_8px_0_rgba(7,26,56,0.10)]
              backdrop-blur-sm
              sm:p-5
              md:p-6
              lg:p-7
            "
          >
            <WorldSelector
              value={analogyWorld}
              onChange={setAnalogyWorld}
              onSubmit={handleWorldSubmit}
              loading={loading}
              error={error}
              disabled={false}
            />
          </div>

          {/* SELECTED WORLD */}

          {analogyWorld && !loading && (
            <div
              className="
                mt-5
                flex
                items-center
                gap-3
                rounded-[16px]
                border-2
                border-[#17aaa7]
                bg-[#dff8f6]
                px-4
                py-3
                shadow-[4px_4px_0_rgba(23,170,167,0.18)]
                sm:px-5
              "
            >
              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#17aaa7]
                  text-sm
                  font-black
                  text-[#071a38]
                "
              >
                ✓
              </div>

              <div className="min-w-0">
                <p
                  className="
                    text-[9px]
                    font-black
                    uppercase
                    tracking-[0.16em]
                    text-[#28716f]
                  "
                >
                  World selected
                </p>

                <p
                  className="
                    mt-0.5
                    truncate
                    text-base
                    font-black
                    text-[#071a38]
                    sm:text-lg
                  "
                >
                  {analogyWorld}
                </p>
              </div>
            </div>
          )}

          {/* LOADING */}

          {loading && (
            <div
              className="
                mt-5
                flex
                items-center
                justify-center
                gap-3
                rounded-[16px]
                border-2
                border-[#5424c7]
                bg-[#eee8ff]
                px-5
                py-4
                text-sm
                font-black
                text-[#5424c7]
              "
            >
              <div
                className="
                  h-5
                  w-5
                  animate-spin
                  rounded-full
                  border-[3px]
                  border-[#cfc4f7]
                  border-t-[#5424c7]
                "
              />

              Creating your analogy...
            </div>
          )}
        </section>
      </div>

      {/* ===================================================
          BOTTOM NOTE
      =================================================== */}

      <div
        className="
          hidden
          items-center
          justify-between
          border-t
          border-[#d8d0c4]
          pt-4
          lg:flex
        "
      >
        <p
          className="
            text-[10px]
            font-black
            uppercase
            tracking-[0.16em]
            text-[#7a817f]
          "
        >
          One idea · Many ways to see it
        </p>

        <div
          className="
            flex
            items-center
            gap-2
            text-[10px]
            font-bold
            text-[#526477]
          "
        >
          <span className="h-2 w-2 rounded-full bg-[#17aaa7]" />
          Pick a world to continue
        </div>
      </div>
    </div>
  </div>
)}


    {/* Guest limit reached modal */}
    <AuthModal
      isOpen={showGuestLimitModal}
      title="You've used your free analogy."
      message="Sign in or create an account to get more from Relate — save your favorite analogies, practice what you’ve learned, and keep exploring new concepts."
      showMaybeLater={false}
      onClose={() => setShowGuestLimitModal(false)}
    />

    {/* Meaningless / invalid concept modal */}
   <InfoModal
  isOpen={showMeaninglessModal}
  title="TRY A MORE SPECIFIC IDEA."
  message={
    meaninglessMessage ||
    "Please enter a specific concept, topic, or question you'd like to understand."
  }
  buttonText="Try again"
  onClose={() => {
    setShowMeaninglessModal(false)
    clearError()
    setStep(1)
  }}
/>

    </div>
  )
}




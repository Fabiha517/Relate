/** @jsxImportSource react */

import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import * as authApi from '../api/auth.api'

/**
 * ProfilePage - User profile management page.
 *
 * Logic/API behavior preserved.
 * Visual redesign only, with password change presented as a modal.
 */
export default function ProfilePage() {
  const { user } = useAuth()

  // Profile form state
  const [name, setName] = useState('')
  const [profileErrors, setProfileErrors] = useState({})
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState('')

  // Password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setName(user.name || '')
    }
  }, [user])

  function getUserInitial() {
    if (!user?.name) return 'U'
    return user.name.charAt(0).toUpperCase()
  }

  function validateProfileForm() {
    const newErrors = {}
    const nameStr =
      typeof name === 'string'
        ? name.trim()
        : ''

    if (nameStr.length === 0) {
      newErrors.name = 'Please enter your name.'
    } else if (nameStr.length > 100) {
      newErrors.name =
        'Name must be no more than 100 characters.'
    }

    setProfileErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function validatePasswordForm() {
    const newErrors = {}

    if (!currentPassword.trim()) {
      newErrors.currentPassword =
        'Current password is required.'
    }

    if (!newPassword.trim()) {
      newErrors.newPassword =
        'New password is required.'
    } else if (newPassword.length < 8) {
      newErrors.newPassword =
        'Password must be at least 8 characters.'
    } else if (newPassword.length > 128) {
      newErrors.newPassword =
        'Password must be no more than 128 characters.'
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword =
        'Please confirm your password.'
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword =
        'Passwords do not match.'
    }

    setPasswordErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleProfileSubmit(e) {
    e.preventDefault()

    if (!validateProfileForm()) {
      return
    }

    setProfileLoading(true)
    setProfileSuccess('')

    try {
      await authApi.updateProfile({ name })

      setProfileSuccess(
        'Profile updated successfully.'
      )

      setTimeout(
        () => setProfileSuccess(''),
        5000
      )
    } catch (error) {
      if (error.response?.data?.error?.fields) {
        setProfileErrors(
          error.response.data.error.fields
        )
      } else {
        setProfileErrors({
          general:
            error.response?.data?.error?.message ||
            'Profile update failed. Please try again.',
        })
      }
    } finally {
      setProfileLoading(false)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()

    if (!validatePasswordForm()) {
      return
    }

    setPasswordLoading(true)
    setPasswordSuccess('')

    try {
      await authApi.changePassword({
        currentPassword,
        newPassword,
      })

      setPasswordSuccess(
        'Password changed successfully.'
      )

      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')

      setTimeout(() => {
        setPasswordSuccess('')
        setShowPasswordModal(false)
      }, 1500)
    } catch (error) {
      if (error.response?.data?.error?.fields) {
        setPasswordErrors(
          error.response.data.error.fields
        )
      } else if (
        error.response?.data?.error?.code ===
        'INVALID_CURRENT_PASSWORD'
      ) {
        setPasswordErrors({
          currentPassword:
            'Current password is incorrect.',
        })
      } else {
        setPasswordErrors({
          general:
            error.response?.data?.error?.message ||
            'Password change failed. Please try again.',
        })
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  function closePasswordModal() {
    if (passwordLoading) return

    setShowPasswordModal(false)
    setPasswordErrors({})
    setPasswordSuccess('')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8f1e5] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-black text-[#071a38] mb-4">
            Loading...
          </h1>
          <p className="text-[#526477]">
            Please wait while we load your profile.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f8f1e5] text-[#071a38]">

      {/* =====================================================
          ATMOSPHERIC BACKGROUND
      ====================================================== */}
 <div
      className="
      relate-card
      relate-card-movies
        pointer-events-none
        absolute
        left-[53%]
        top-[3%]
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
    <div
      className="
      relate-card
      relate-card-sports
        pointer-events-none
        absolute
        left-[57%]
        top-[6%]
        hidden
        h-20
        w-20
        rounded-full
        border-[3px]
        border-red
        opacity-70
        lg:block
      "
    />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-28 top-24 h-72 w-72 rounded-full bg-[#FFD65A]/30 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 top-40 h-[30rem] w-[30rem] rounded-full bg-[#5424C7]/20 blur-3xl"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-12rem] left-[30%] h-96 w-96 rounded-full bg-[#4E9EA0]/15 blur-3xl"
      />

      {/* =====================================================
          FLOATING CANVAS ELEMENTS
      ====================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >

        {/* Left orbit */}
        <div className="absolute left-[-70px] top-[150px] h-44 w-44 rounded-full border-2 border-dashed border-[#5424C7]/35" />

        <div className="absolute left-[-45px] top-[175px] h-32 w-32 rounded-full border-2 border-dashed border-[#E47B62]/30" />

        <span className="absolute left-[105px] top-[145px] h-5 w-5 rounded-full bg-[#FFD65A]" />

        <span className="absolute left-[75px] top-[340px] h-3 w-3 rounded-full bg-[#E47B62]" />

        {/* Right constellation */}
        <svg
          className="absolute right-[-20px] top-[90px] h-[210px] w-[290px] opacity-70"
          viewBox="0 0 290 210"
          fill="none"
        >
          <path
            d="M18 142L72 88L130 118L188 48L267 90"
            stroke="#5424C7"
            strokeWidth="2"
            strokeDasharray="5 9"
          />

          <path
            d="M72 88L100 34L188 48"
            stroke="#4E9EA0"
            strokeWidth="1.5"
            strokeDasharray="3 8"
          />

          <circle
            cx="18"
            cy="142"
            r="6"
            fill="#E47B62"
          />

          <circle
            cx="72"
            cy="88"
            r="7"
            fill="#FFD65A"
          />

          <circle
            cx="130"
            cy="118"
            r="5"
            fill="#4E9EA0"
          />

          <circle
            cx="188"
            cy="48"
            r="7"
            fill="#E47B62"
          />

          <circle
            cx="267"
            cy="90"
            r="6"
            fill="#5424C7"
          />

          <circle
            cx="100"
            cy="34"
            r="4"
            fill="#FFD65A"
          />
        </svg>

        {/* Floating plus */}
        <span className="absolute right-[18%] top-[330px] rotate-12 text-5xl font-light text-[#5424C7]/35">
          +
        </span>

        {/* Floating star */}
        <span className="absolute left-[13%] top-[480px] -rotate-12 text-4xl text-[#E47B62]/55">
          ✦
        </span>

        {/* Floating triangle */}
        <span className="absolute right-[9%] bottom-[190px] rotate-12 text-6xl text-[#4E9EA0]/45">
          △
        </span>

        {/* Tiny dots */}
        <span className="absolute left-[25%] top-[110px] h-2.5 w-2.5 rounded-full bg-[#5424C7]/40" />
        <span className="absolute right-[31%] top-[160px] h-3 w-3 rounded-full bg-[#E47B62]/45" />
        <span className="absolute right-[17%] bottom-[130px] h-4 w-4 rounded-full bg-[#FFD65A]" />
      </div>

      {/* =====================================================
          MAIN CANVAS
      ====================================================== */}

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-3 pt-10 sm:px-8 lg:px-12">

        {/* ===================================================
            TOP LABEL
        ==================================================== */}

        <div className="mb-5 flex items-center gap-3">
          <span className="rounded-full border-2 border-[#071a38] bg-[#FFD65A] px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] shadow-[3px_3px_0_#071a38]">
            Account / You
          </span>

          <span className="h-[2px] w-20 bg-[#071a38]/25" />

          <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#526477]">
            Your space in Relate
          </span>
        </div>

        {/* ===================================================
            HERO
        ==================================================== */}

        <section className="relative mb-12 min-h-[250px]">

          {/* hand-drawn line */}
          <svg
            aria-hidden="true"
            className="absolute -bottom-8 left-0 h-8 w-[300px]"
            viewBox="0 0 300 32"
            fill="none"
          >
            <path
              d="M4 18C48 8 75 27 116 16C160 4 208 24 296 11"
              stroke="#F0A23A"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>

          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">

            <div className="max-w-2xl">

              <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-[#5424C7]">
                Personal workspace
              </p>

              <h1 className="text-5xl font-black leading-[0.9] tracking-[-0.045em] sm:text-6xl lg:text-7xl">
                This is
                <br />
                <span className="relative inline-block">
                  your space.
                  <span className="absolute -right-5 -top-5 text-2xl text-[#E47B62]">
                    ✦
                  </span>
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base font-medium leading-7 text-[#526477] sm:text-lg">
                Keep your details current and make
                your Relate workspace feel like yours.
              </p>
            </div>

            {/* =================================================
                AVATAR ILLUSTRATION
            ================================================= */}

            <div className="relative mx-auto h-48 w-48 shrink-0 md:mx-0 md:h-56 md:w-56">

              {/* orbit */}
              <div className="absolute inset-[-18px] rounded-full border-2 border-dashed border-[#5424C7]/35 rotate-[-12deg]" />

              <div className="absolute inset-[-7px] rounded-full border-2 border-[#E47B62]/30 rotate-[18deg]" />

              {/* yellow blob */}
              <div className="absolute -left-5 top-5 h-20 w-20 rotate-[-14deg] rounded-[35%_65%_58%_42%] bg-[#FFD65A]" />

              {/* teal blob */}
              <div className="absolute -bottom-2 -right-5 h-20 w-20 rotate-[15deg] rounded-[62%_38%_42%_58%] bg-[#4E9EA0]" />

              {/* avatar */}
              <div className="absolute inset-5 flex rotate-[2deg] items-center justify-center rounded-[40%_60%_55%_45%] border-[3px] border-[#071a38] bg-[#5424C7] shadow-[7px_7px_0_#071a38]">

                <span className="text-6xl font-black text-white">
                  {getUserInitial()}
                </span>

                <span className="absolute -right-3 -top-3 flex h-9 w-9 rotate-12 items-center justify-center rounded-full border-2 border-[#071a38] bg-[#E47B62] text-lg font-black text-[#071a38]">
                  +
                </span>
              </div>

              {/* tiny annotation */}
              <span className="absolute -bottom-8 left-2 rotate-[-7deg] text-xs font-black uppercase tracking-[0.15em] text-[#526477]">
                that's you →
              </span>
            </div>
          </div>
        </section>

        {/* ===================================================
            PROFILE AREA
        ==================================================== */}

        <section className="relative">

          {/* vertical doodle */}
          <div
            aria-hidden="true"
            className="absolute -left-8 top-8 hidden h-[500px] border-l-2 border-dashed border-[#5424C7]/20 lg:block"
          />

          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">

            {/* =================================================
                EDIT PROFILE — MAIN CANVAS
            ================================================= */}

            <div className="relative">

              {/* floating label */}
              <div className="absolute -left-3 -top-5 z-20 rotate-[-3deg] rounded-full border-2 border-[#071a38] bg-[#FFD65A] px-4 py-2 text-xs font-black uppercase tracking-[0.14em] shadow-[3px_3px_0_#071a38]">
                Your details
              </div>

              <div className="relative overflow-hidden rounded-[30px] border-[3px] border-[#071a38] bg-[#fffdf8] px-6 pb-8 pt-12 shadow-[9px_9px_0_#071a38] sm:px-9">

                {/* card decorations */}
                <div
                  aria-hidden="true"
                  className="absolute -right-12 -top-12 h-36 w-36 rounded-full border-2 border-dashed border-[#4E9EA0]/40"
                />

                <div
                  aria-hidden="true"
                  className="absolute bottom-[-35px] left-[-35px] h-28 w-28 rounded-full bg-[#E47B62]/15"
                />

                <svg
                  aria-hidden="true"
                  className="absolute right-5 top-8 h-20 w-28 opacity-50"
                  viewBox="0 0 120 80"
                  fill="none"
                >
                  <path
                    d="M4 60L35 25L66 48L113 10"
                    stroke="#5424C7"
                    strokeWidth="2"
                    strokeDasharray="4 7"
                  />
                  <circle
                    cx="35"
                    cy="25"
                    r="4"
                    fill="#FFD65A"
                  />
                  <circle
                    cx="66"
                    cy="48"
                    r="4"
                    fill="#4E9EA0"
                  />
                </svg>

                <div className="relative z-10">

                  <div className="mb-8">
                    <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#5424C7]">
                      Identity
                    </p>

                    <h2 className="text-3xl font-black tracking-tight sm:text-4xl">
                      A few things
                      <br />
                      about you.
                    </h2>
                  </div>

                  {/* =================================================
                      EMAIL
                  ================================================= */}

                  <div className="mb-7">

                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#4E9EA0]" />
                      <label className="text-xs font-black uppercase tracking-[0.16em] text-[#526477]">
                        Email
                      </label>
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-2xl border-2 border-[#071a38]/20 bg-[#f5f0e6] px-5 py-4">

                      <span className="min-w-0 truncate font-bold text-[#071a38]">
                        {user.email}
                      </span>

                      <span className="shrink-0 rounded-full border border-[#071a38]/20 bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#526477]">
                        Locked
                      </span>
                    </div>

                    <p className="mt-2 pl-1 text-xs font-medium text-[#526477]">
                      Email is tied to your account and cannot be changed.
                    </p>
                  </div>

                  {/* =================================================
                      MEMBER SINCE
                  ================================================= */}

                  <div className="mb-8">

                    <div className="mb-2 flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#FFD65A]" />

                      <label className="text-xs font-black uppercase tracking-[0.16em] text-[#526477]">
                        Member since
                      </label>
                    </div>

                    <div className="inline-flex items-center gap-3 rounded-full border-2 border-[#071a38] bg-[#FFD65A]/60 px-5 py-3 font-black shadow-[3px_3px_0_#071a38]">
                      <span className="text-lg">✦</span>

                      <span>
                        {user.createdAt
                          ? new Date(
                              user.createdAt
                            ).toLocaleDateString()
                          : 'Unknown'}
                      </span>
                    </div>
                  </div>

                  {/* =================================================
                      NAME FORM
                  ================================================= */}

                  <form onSubmit={handleProfileSubmit}>

                    <div className="mb-6">

                      <div className="mb-2 flex items-center justify-between">
                        <label
                          htmlFor="name"
                          className="text-xs font-black uppercase tracking-[0.16em] text-[#526477]"
                        >
                          Display name
                        </label>

                        <span className="text-xs font-bold text-[#526477]/60">
                          1–100 characters
                        </span>
                      </div>

                      <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value)

                          if (profileErrors.name) {
                            setProfileErrors((prev) => ({
                              ...prev,
                              name: '',
                            }))
                          }
                        }}
                        className={`w-full rounded-2xl border-[2px] bg-[#fffdf8] px-5 py-4 text-lg font-bold text-[#071a38] outline-none transition-all placeholder:text-[#526477]/40 ${
                          profileErrors.name
                            ? 'border-[#E47B62] bg-[#fff0ed] focus:ring-4 focus:ring-[#E47B62]/15'
                            : 'border-[#071a38]/25 focus:border-[#5424C7] focus:ring-4 focus:ring-[#5424C7]/10'
                        }`}
                        placeholder="Your full name"
                        disabled={profileLoading}
                      />

                      <div className="mt-2 min-h-[20px]">
                        {profileErrors.name && (
                          <p className="text-sm font-bold text-[#D85C4A]">
                            {profileErrors.name}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={profileLoading}
                      className="group relative w-full overflow-hidden rounded-2xl border-[3px] border-[#071a38] bg-[#17aaa7] px-6 py-4 font-black text-[#071a38] shadow-[5px_5px_0_#071a38] transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0_#071a38] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0_#071a38] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        {profileLoading
                          ? 'Updating...'
                          : 'Save my changes'}

                        {!profileLoading && (
                          <span className="text-xl transition-transform group-hover:translate-x-1">
                            →
                          </span>
                        )}
                      </span>

                      <span className="absolute -right-5 -top-8 h-20 w-20 rounded-full bg-white/15" />
                    </button>

                    {/* feedback */}
                    <div className="mt-4 min-h-[60px]">

                      {profileSuccess && (
                        <div className="flex items-center gap-3 rounded-2xl border-2 border-[#17aaa7] bg-[#dff8f6] px-4 py-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#17aaa7] font-black">
                            ✓
                          </span>

                          <span className="font-bold">
                            {profileSuccess}
                          </span>
                        </div>
                      )}

                      {profileErrors.general && (
                        <div className="flex items-center gap-3 rounded-2xl border-2 border-[#E47B62] bg-[#fff0ed] px-4 py-3">
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#E47B62] font-black">
                            !
                          </span>

                          <span className="font-bold">
                            {profileErrors.general}
                          </span>
                        </div>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>

            {/* =================================================
                SECURITY / PASSWORD AREA
            ================================================= */}

            <div className="relative flex items-center">

              <div className="relative w-full rotate-[1.5deg]">

                {/* coral paper shape */}
                <div className="absolute -right-3 -top-3 h-20 w-20 rounded-full bg-[#E47B62]/30" />

                {/* teal doodle */}
                <svg
                  aria-hidden="true"
                  className="absolute -bottom-12 -left-8 h-24 w-36"
                  viewBox="0 0 150 100"
                  fill="none"
                >
                  <path
                    d="M8 82C38 16 77 98 145 22"
                    stroke="#4E9EA0"
                    strokeWidth="3"
                    strokeDasharray="6 8"
                  />
                </svg>

                <div className="relative overflow-hidden rounded-[28px] border-[3px] border-[#071a38] bg-[#5424C7] p-7 text-white shadow-[9px_9px_0_#071a38] sm:p-9">

                  {/* decorative circles */}
                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full border-2 border-dashed border-white/30" />

                  <div className="absolute -bottom-14 -left-14 h-32 w-32 rounded-full bg-[#FFD65A]/20" />

                  <span className="absolute right-7 top-8 text-3xl text-[#FFD65A]">
                    ✦
                  </span>

                  <div className="relative z-10">

                    <div className="mb-8">

                      <div className="mb-5 flex h-14 w-14 rotate-[-6deg] items-center justify-center rounded-2xl border-2 border-[#071a38] bg-[#FFD65A] text-2xl text-[#071a38] shadow-[4px_4px_0_#071a38]">
                        🔐
                      </div>

                      <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-[#FFD65A]">
                        Security
                      </p>

                      <h2 className="text-3xl font-black leading-tight">
                        Keep your
                        <br />
                        account safe.
                      </h2>
                    </div>

                    <p className="mb-8 max-w-sm font-medium leading-7 text-white/75">
                      You can change your password whenever
                      you need to. We'll keep the actual
                      password fields tucked away until you
                      need them.
                    </p>

                    {/* =================================================
                        PASSWORD TRIGGER
                    ================================================= */}

                    <button
                      type="button"
                      onClick={() => {
                        setPasswordErrors({})
                        setPasswordSuccess('')
                        setShowPasswordModal(true)
                      }}
                      className="group relative w-full rounded-2xl border-[3px] border-[#071a38] bg-[#FFD65A] px-5 py-4 text-left font-black text-[#071a38] shadow-[5px_5px_0_#071a38] transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0_#071a38] active:translate-x-1 active:translate-y-1 active:shadow-[2px_2px_0_#071a38]"
                    >
                      <span className="flex items-center justify-between">

                        <span>
                          <span className="block text-xs uppercase tracking-[0.15em] opacity-60">
                            Account security
                          </span>

                          <span className="mt-1 block text-lg">
                            Change password
                          </span>
                        </span>

                        <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#071a38] bg-white text-xl transition-transform group-hover:rotate-12">
                          →
                        </span>
                      </span>
                    </button>

                    <div className="mt-6 flex items-center gap-2 text-xs font-bold text-white/55">
                      <span className="h-2 w-2 rounded-full bg-[#17aaa7]" />
                      Passwords are never displayed here.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===================================================
            BOTTOM DOODLE / CLOSING NOTE
        ==================================================== */}

        <section className="relative mt-20 flex flex-col items-center justify-center text-center">

          <svg
            aria-hidden="true"
            className="mb-5 h-12 w-72"
            viewBox="0 0 300 50"
            fill="none"
          >
            <path
              d="M4 27C43 10 68 42 104 25C140 8 173 42 211 24C244 8 270 28 296 19"
              stroke="#5424C7"
              strokeWidth="2"
              strokeDasharray="5 8"
              strokeLinecap="round"
            />
          </svg>

          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#526477]">
            Keep learning. Keep connecting.
          </p>

          <span className="mt-3 text-2xl text-[#E47B62]">
            ✦
          </span>
        </section>
      </main>

      {/* =====================================================
          CHANGE PASSWORD MODAL
      ====================================================== */}
{showPasswordModal && (
  <div
    className="fixed inset-0 z-[100] flex items-center justify-center bg-[#071a38]/55 px-4 py-4 backdrop-blur-sm"
    onMouseDown={(e) => {
      if (e.target === e.currentTarget) {
        closePasswordModal()
      }
    }}
  >
    {/* floating modal decoration */}
    <div
      aria-hidden="true"
      className="pointer-events-none absolute left-[12%] top-[18%] h-24 w-24 rounded-full border-2 border-dashed border-[#FFD65A]/60"
    />

    <div
      aria-hidden="true"
      className="pointer-events-none absolute bottom-[15%] right-[13%] text-5xl text-[#E47B62]"
    >
      ✦
    </div>

    <div className="relative w-full max-w-xl rotate-[-1deg]">

      {/* yellow offset shape */}
      <div
        aria-hidden="true"
        className="absolute -right-4 -top-4 h-20 w-20 rounded-[35%_65%_50%_50%] bg-[#FFD65A]"
      />

      {/* =====================================================
          MODAL
      ===================================================== */}
      <div className="relative overflow-hidden rounded-[28px] border-[3px] border-[#071a38] bg-[#fffdf8] shadow-[8px_8px_0_#071a38]">

        {/* =================================================
            HEADER
        ================================================= */}
        <div className="relative border-b-2 border-[#071a38]/15 bg-[#5424C7] px-6 py-3 text-white sm:px-7">

          <svg
            aria-hidden="true"
            className="absolute right-4 top-1 h-16 w-24 opacity-40"
            viewBox="0 0 120 80"
            fill="none"
          >
            <path
              d="M4 64L38 25L67 45L116 9"
              stroke="white"
              strokeWidth="2"
              strokeDasharray="4 7"
            />

            <circle
              cx="38"
              cy="25"
              r="4"
              fill="#FFD65A"
            />

            <circle
              cx="67"
              cy="45"
              r="4"
              fill="#4E9EA0"
            />
          </svg>

          <div className="relative z-10 flex items-center justify-between gap-4">

            <div>
              <p className="mb-0.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#FFD65A]">
                Security
              </p>

              <h2 className="text-[25px] font-black leading-tight tracking-tight sm:text-[27px]">
                Change your password
              </h2>
            </div>

            <button
              type="button"
              onClick={closePasswordModal}
              disabled={passwordLoading}
              aria-label="Close password dialog"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-white/60 text-xl font-black transition-all hover:rotate-90 hover:bg-white hover:text-[#5424C7] disabled:opacity-50"
            >
              ×
            </button>

          </div>
        </div>

        {/* =================================================
            FORM
        ================================================= */}
        <form
          onSubmit={handlePasswordSubmit}
          className="relative px-5 py-4 sm:px-6 sm:py-5"
        >

          {/* decorative side dot */}
          <span
            aria-hidden="true"
            className="absolute right-6 top-6 h-3 w-3 rounded-full bg-[#E47B62]"
          />

          <div className="space-y-2.5">

            {/* =================================================
                CURRENT PASSWORD
            ================================================= */}
            <div>
              <label
                htmlFor="currentPassword"
                className="mb-1 block text-[11px] font-black uppercase tracking-[0.16em] text-[#526477]"
              >
                Current password
              </label>

              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value)

                  if (passwordErrors.currentPassword) {
                    setPasswordErrors((prev) => ({
                      ...prev,
                      currentPassword: '',
                    }))
                  }
                }}
                className={`w-full rounded-xl border-2 bg-[#fffdf8] px-4 py-2.5 text-sm font-bold text-[#071a38] outline-none transition-all ${
                  passwordErrors.currentPassword
                    ? 'border-[#E47B62] bg-[#fff0ed]'
                    : 'border-[#071a38]/20 focus:border-[#5424C7] focus:ring-4 focus:ring-[#5424C7]/10'
                }`}
                placeholder="••••••••"
                disabled={passwordLoading}
              />

              {passwordErrors.currentPassword && (
                <p className="mt-1 text-xs font-bold text-[#D85C4A]">
                  {passwordErrors.currentPassword}
                </p>
              )}
            </div>

            {/* =================================================
                NEW PASSWORD
            ================================================= */}
            <div>
              <label
                htmlFor="newPassword"
                className="mb-1 block text-[11px] font-black uppercase tracking-[0.16em] text-[#526477]"
              >
                New password
              </label>

              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value)

                  if (passwordErrors.newPassword) {
                    setPasswordErrors((prev) => ({
                      ...prev,
                      newPassword: '',
                    }))
                  }
                }}
                className={`w-full rounded-xl border-2 bg-[#fffdf8] px-4 py-2.5 text-sm font-bold text-[#071a38] outline-none transition-all ${
                  passwordErrors.newPassword
                    ? 'border-[#E47B62] bg-[#fff0ed]'
                    : 'border-[#071a38]/20 focus:border-[#5424C7] focus:ring-4 focus:ring-[#5424C7]/10'
                }`}
                placeholder="••••••••"
                disabled={passwordLoading}
              />

              {passwordErrors.newPassword && (
                <p className="mt-1 text-xs font-bold text-[#D85C4A]">
                  {passwordErrors.newPassword}
                </p>
              )}

              <p className="mt-0.5 text-[11px] font-medium text-[#526477]">
                Must be 8–128 characters.
              </p>
            </div>

            {/* =================================================
                CONFIRM PASSWORD
            ================================================= */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-1 block text-[11px] font-black uppercase tracking-[0.16em] text-[#526477]"
              >
                Confirm password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)

                  if (passwordErrors.confirmPassword) {
                    setPasswordErrors((prev) => ({
                      ...prev,
                      confirmPassword: '',
                    }))
                  }
                }}
                className={`w-full rounded-xl border-2 bg-[#fffdf8] px-4 py-2.5 text-sm font-bold text-[#071a38] outline-none transition-all ${
                  passwordErrors.confirmPassword
                    ? 'border-[#E47B62] bg-[#fff0ed]'
                    : 'border-[#071a38]/20 focus:border-[#5424C7] focus:ring-4 focus:ring-[#5424C7]/10'
                }`}
                placeholder="••••••••"
                disabled={passwordLoading}
              />

              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-xs font-bold text-[#D85C4A]">
                  {passwordErrors.confirmPassword}
                </p>
              )}
            </div>

          </div>

          {/* =================================================
              SUCCESS / GENERAL ERROR
          ================================================= */}
          {(passwordSuccess || passwordErrors.general) && (
            <div className="mt-3">

              {passwordSuccess && (
                <div className="flex items-center gap-2.5 rounded-xl border-2 border-[#17aaa7] bg-[#dff8f6] px-3 py-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#17aaa7] text-sm font-black">
                    ✓
                  </span>

                  <span className="text-sm font-bold">
                    {passwordSuccess}
                  </span>
                </div>
              )}

              {passwordErrors.general && (
                <div className="flex items-center gap-2.5 rounded-xl border-2 border-[#E47B62] bg-[#fff0ed] px-3 py-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E47B62] text-sm font-black">
                    !
                  </span>

                  <span className="text-sm font-bold">
                    {passwordErrors.general}
                  </span>
                </div>
              )}

            </div>
          )}

          {/* =================================================
              ACTIONS
          ================================================= */}
          <div className="mt-3 flex flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={closePasswordModal}
              disabled={passwordLoading}
              className="rounded-xl border-2 border-[#071a38]/25 bg-[#f5f0e6] px-5 py-2.5 text-sm font-black text-[#071a38] transition-all hover:border-[#071a38] hover:bg-white disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={passwordLoading}
              className="rounded-xl border-[3px] border-[#071a38] bg-[#E47B62] px-6 py-2.5 text-sm font-black text-white shadow-[3px_3px_0_#071a38] transition-all hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#071a38] active:translate-x-1 active:translate-y-1 active:shadow-[1px_1px_0_#071a38] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {passwordLoading
                ? 'Changing...'
                : 'Change password →'}
            </button>

          </div>

        </form>
      </div>
    </div>
  </div>
)}
    </div>
  )
}
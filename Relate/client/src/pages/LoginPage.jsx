/** @jsxImportSource react */

import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import * as authApi from '../api/auth.api'
import * as guestSession from '../utils/guestSession'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login: contextLogin } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const [saveGuestAnalogyError, setSaveGuestAnalogyError] = useState('')

  useEffect(() => { }, [])

  function validateForm() {
    const newErrors = {}

    if (!email.trim()) {
      newErrors.email = 'Email is required.'
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setLoginError('')
    setSaveGuestAnalogyError('')

    try {
      await contextLogin(email, password)

      const guestAnalogy = guestSession.get()

      if (guestAnalogy) {
        try {
          await authApi.saveAnalogy(guestAnalogy)
          guestSession.clear()
        } catch (saveError) {
          console.error(
            'Failed to save guest analogy:',
            saveError.message
          )

          setSaveGuestAnalogyError(
            'Your guest analogy could not be saved, but your account was created successfully.'
          )
        }
      }

      const from = searchParams.get('from') || '/'
      navigate(from, { replace: true })
    } catch (error) {
     

      const code = error.response?.data?.error?.code
const message = error.response?.data?.error?.message
  if (code === 'USER_NOT_FOUND') {
    setLoginError('No account found with this email.')
  } else if (code === 'INVALID_PASSWORD') {
    setLoginError('Incorrect password. Please try again.')
  } else {
    setLoginError(
      message || 'Unable to log in. Please try again.'
    )
  }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#f8f1e5] px-4 py-10 sm:px-6 lg:px-10">

      {/* =====================================================
          BACKGROUND CANVAS
      ===================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-yellow-300 rounded-full opacity-25 blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-700 rounded-full opacity-20 blur-3xl"></div>
        <div className=" pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl " />
        <div className=" pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl " />

        {/* yellow blob */}
        <div className="absolute -left-20 top-20 h-44 w-44 rounded-[42%_58%_62%_38%] bg-[#ffb800] opacity-90 sm:h-60 sm:w-60" />

        {/* coral blob */}
        <div className="absolute right-[-70px] top-[18%] h-48 w-48 rotate-12 rounded-[55%_45%_38%_62%] bg-[#e47b62] sm:h-72 sm:w-72" />

        {/* teal circle */}
        <div className="absolute bottom-[-70px] left-[12%] h-40 w-40 rounded-full bg-[#4e9ea0] sm:h-56 sm:w-56" />

        {/* purple floating dot */}
        <div className="absolute right-[12%] bottom-[12%] h-7 w-7 rounded-full bg-[#5424c7] sm:h-10 sm:w-10" />

        {/* tiny dots */}
        <div className="absolute left-[8%] top-[45%] h-3 w-3 rounded-full bg-[#5424c7]" />
        <div className="absolute right-[7%] top-[63%] h-4 w-4 rounded-full bg-[#ffb800]" />

        {/* hand-drawn route */}
        <svg
          className="absolute left-0 top-0 h-full w-full opacity-70"
          viewBox="0 0 1200 800"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M20 150 C180 70 270 260 400 180 S650 70 760 180 S1000 300 1180 180"
            stroke="#5424c7"
            strokeWidth="3"
            strokeDasharray="10 14"
          />

          <path
            d="M80 650 C250 570 350 700 500 620 S760 500 900 610 S1080 690 1200 590"
            stroke="#071a38"
            strokeWidth="2"
            strokeDasharray="5 12"
          />
        </svg>

        {/* little handwritten marks */}
        <div className="absolute left-[7%] top-[25%] rotate-[-12deg] font-mono text-3xl text-[#071a38]/50">
          +
        </div>

        <div className="absolute right-[15%] top-[12%] rotate-12 font-mono text-4xl text-[#5424c7]/60">
          *
        </div>

        <div className="absolute bottom-[20%] right-[5%] rotate-[-8deg] font-mono text-2xl text-[#071a38]/50">
          //
        </div>
      </div>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-160px)] max-w-6xl items-center">

        <div className="grid w-full items-center gap-10 lg:grid-cols-[1fr_480px]">

          {/* LEFT STORY */}
          <div className="hidden lg:block">

            <div className="mb-6 inline-flex -rotate-2 items-center gap-2 rounded-full border-2 border-[#071a38] bg-[#ffb800] px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-[#071a38] shadow-[4px_4px_0_#071a38]">
              Welcome back
            </div>

            <h1 className="max-w-xl text-7xl font-black leading-[0.88] tracking-[-0.065em] text-[#071a38] xl:text-8xl">
              Your ideas
              <br />
              are still
              <br />
              <span className="relative inline-block text-[#5424c7]">
                here.
                <svg
                  className="absolute -bottom-3 left-0 w-full"
                  viewBox="0 0 300 20"
                  fill="none"
                >
                  <path
                    d="M4 13 C80 3 180 19 296 7"
                    stroke="#071a38"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-8 max-w-md text-lg font-medium leading-relaxed text-[#071a38]/70">
              Pick up where you left off and keep turning
              difficult ideas into things you can actually see.
            </p>

            {/* mini visual */}
            <div className="relative mt-12 h-32 w-80">
              <div className="absolute left-0 top-8 rotate-[-4deg] rounded-2xl border-2 border-[#071a38] bg-white px-5 py-3 text-sm font-bold shadow-[5px_5px_0_#071a38]">
                concept
              </div>

              <div className="absolute left-28 top-2 h-20 w-20 rounded-full border-2 border-[#071a38] bg-[#5424c7]" />

              <div className="absolute left-48 top-12 rotate-3 rounded-2xl border-2 border-[#071a38] bg-[#4e9ea0] px-4 py-3 text-sm font-bold shadow-[4px_4px_0_#071a38]">
                analogy
              </div>

              <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 320 130"
                fill="none"
              >
                <path
                  d="M85 50 C125 25 140 70 170 55 S215 30 245 58"
                  stroke="#071a38"
                  strokeWidth="3"
                  strokeDasharray="7 7"
                />
              </svg>
            </div>
          </div>

          {/* =================================================
              LOGIN FORM
          ================================================= */}

          <div className="relative">

            {/* floating label */}
            <div className="absolute -right-2 -top-5 z-20 rotate-3 rounded-xl border-2 border-[#071a38] bg-[#ffb800] px-4 py-2 font-mono text-xs font-black uppercase tracking-wider text-[#071a38] shadow-[4px_4px_0_#071a38] sm:right-4">
              sign in
            </div>

            <div className="relative rounded-[30px] border-[3px] border-[#071a38] bg-[#fffaf0] p-6 shadow-[10px_10px_0_#5424c7] sm:p-9">

              {/* corner decoration */}
              <div className="absolute -left-3 -top-3 h-8 w-8 rotate-12 rounded-full border-2 border-[#071a38] bg-[#4e9ea0]" />

              <div className="mb-8">
                <p className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#5424c7]">
                  Relate / 01
                </p>

                <h2 className="text-4xl font-black tracking-[-0.05em] text-[#071a38] sm:text-5xl">
                  Log in
                </h2>

                <p className="mt-3 text-sm font-medium text-[#071a38]/60">
                  Good to see you again.
                </p>
              </div>

              {loginError && (
                <div className="mb-5 rotate-[-1deg] rounded-2xl border-2 border-[#071a38] bg-[#e47b62] p-4 text-sm font-bold text-[#071a38] shadow-[4px_4px_0_#071a38]">
                  {loginError}
                </div>
              )}

              {saveGuestAnalogyError && (
                <div className="mb-5 rounded-2xl border-2 border-[#071a38] bg-[#ffb800] p-4 text-sm font-bold text-[#071a38]">
                  {saveGuestAnalogyError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.16em] text-[#071a38]"
                  >
                    Email
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      setLoginError('')

                      if (errors.email) {
                        setErrors((prev) => ({
                          ...prev,
                          email: '',
                        }))
                      }
                    }}
                    className={`w-full rounded-2xl border-2 bg-[#f8f1e5] px-4 py-3.5 font-medium text-[#071a38] outline-none transition-all placeholder:text-[#071a38]/30 focus:-translate-y-0.5 focus:border-[#5424c7] focus:bg-white focus:shadow-[4px_4px_0_#5424c7] ${errors.email
                        ? 'border-[#e47b62]'
                        : 'border-[#071a38]'
                      }`}
                    placeholder="your@email.com"
                    disabled={loading}
                  />

                  {errors.email && (
                    <p className="mt-2 text-xs font-bold text-[#c6533c]">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.16em] text-[#071a38]"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      setLoginError('')

                      if (errors.password) {
                        setErrors((prev) => ({
                          ...prev,
                          password: '',
                        }))
                      }
                    }}
                    className={`w-full rounded-2xl border-2 bg-[#f8f1e5] px-4 py-3.5 font-medium text-[#071a38] outline-none transition-all placeholder:text-[#071a38]/30 focus:-translate-y-0.5 focus:border-[#5424c7] focus:bg-white focus:shadow-[4px_4px_0_#5424c7] ${errors.password
                        ? 'border-[#e47b62]'
                        : 'border-[#071a38]'
                      }`}
                    placeholder="••••••••"
                    disabled={loading}
                  />

                  {errors.password && (
                    <p className="mt-2 text-xs font-bold text-[#c6533c]">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Link
                    to="/forgot"
                    className="text-sm font-bold text-[#5424c7] underline decoration-2 underline-offset-4 transition-transform hover:-translate-y-0.5"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full overflow-hidden rounded-2xl border-2 border-[#071a38] bg-[#5424c7] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[5px_5px_0_#071a38] transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0_#071a38] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0_#071a38] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Logging in...' : 'Log in →'}
                </button>
              </form>

              <div className="my-7 flex items-center gap-3">
                <div className="h-px flex-1 bg-[#071a38]/15" />
                <span className="font-mono text-[10px] font-bold text-[#071a38]/40">
                  OR
                </span>
                <div className="h-px flex-1 bg-[#071a38]/15" />
              </div>

              <p className="text-center text-sm font-medium text-[#071a38]/60">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-black text-[#071a38] underline decoration-[#ffb800] decoration-4 underline-offset-2"
                >
                  Sign up
                </Link>
              </p>
            </div>

            {/* bottom floating doodle */}
            <div className="absolute -bottom-8 -left-7 hidden h-16 w-16 rotate-[-12deg] rounded-2xl border-2 border-[#071a38] bg-[#4e9ea0] sm:block">
              <div className="flex h-full items-center justify-center font-black text-[#071a38]">
                ↗
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
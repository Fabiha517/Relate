/** @jsxImportSource react */

import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import * as authApi from '../api/auth.api'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()

  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetErrorCode, setResetErrorCode] = useState('')
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (token) {
      const metaTag = document.createElement('meta')
      metaTag.name = 'referrer'
      metaTag.content = 'no-referrer'

      document.head.appendChild(metaTag)

      return () => {
        document.head.removeChild(metaTag)
      }
    }
  }, [token])

  function validateForm() {
    const newErrors = {}

    if (!password.trim()) {
      newErrors.password = 'Password is required.'
    } else if (password.length < 8) {
      newErrors.password =
        'Password must be at least 8 characters.'
    } else if (password.length > 128) {
      newErrors.password =
        'Password must be no more than 128 characters.'
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword =
        'Please confirm your password.'
    }

    if (
      password &&
      confirmPassword &&
      password !== confirmPassword
    ) {
      newErrors.confirmPassword =
        'Passwords do not match.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!token) {
      setResetError('Invalid or missing reset token.')
      return
    }

    if (!validateForm()) {
      return
    }

    setLoading(true)
    setResetError('')
    setResetErrorCode('')

    try {
      await authApi.resetPassword({
        token,
        password,
      })

      setSubmitted(true)
    } catch (error) {
      if (
        error.response?.data?.error?.code ===
        'RESET_TOKEN_INVALID'
      ) {
        setResetErrorCode('RESET_TOKEN_INVALID')

        setResetError(
          error.response?.data?.error?.message ||
            'This password reset link is invalid or has expired.'
        )
      } else if (error.response?.data?.error?.message) {
        setResetError(error.response.data.error.message)
      } else {
        setResetError(
          'Failed to reset password. Please try again.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#f8f1e5] px-4 py-10">

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute left-[-90px] top-[15%] h-64 w-64 rounded-full bg-[#e47b62]" />
          <div className="absolute right-[-80px] bottom-[10%] h-72 w-72 rounded-full bg-[#ffb800]" />

          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1200 800"
            fill="none"
          >
            <path
              d="M0 250 C200 120 330 350 500 230 S800 100 1200 280"
              stroke="#5424c7"
              strokeWidth="3"
              strokeDasharray="10 14"
            />
          </svg>
        </div>

        <div className="relative z-10 flex min-h-[calc(100vh-160px)] items-center justify-center">

          <div className="w-full max-w-lg rounded-[32px] border-[3px] border-[#071a38] bg-[#fffaf0] p-8 text-center shadow-[10px_10px_0_#e47b62] sm:p-12">

            <div className="mx-auto flex h-24 w-24 rotate-3 items-center justify-center rounded-full border-2 border-[#071a38] bg-[#e47b62] text-5xl font-black shadow-[5px_5px_0_#071a38]">
              !
            </div>

            <p className="mt-8 font-mono text-xs font-black uppercase tracking-[0.2em] text-[#5424c7]">
              Relate / security
            </p>

            <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-[#071a38]">
              Invalid reset link
            </h1>

            <p className="mt-5 text-sm font-medium leading-relaxed text-[#071a38]/65">
              This password reset link is invalid or missing.
              Please request a new one.
            </p>

            <Link
              to="/forgot"
              className="mt-8 inline-flex rounded-2xl border-2 border-[#071a38] bg-[#5424c7] px-6 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-[5px_5px_0_#071a38] transition-all hover:-translate-y-1"
            >
              Request a new link →
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#f8f1e5] px-4 py-10">
  <div className="absolute -top-20 -left-20 w-48 h-48 bg-yellow-300 rounded-full opacity-25 blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-700 rounded-full opacity-20 blur-3xl"></div>
      <div className=" pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl "/>
      <div className=" pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl "/>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute left-[-70px] bottom-[5%] h-64 w-64 rounded-full bg-[#4e9ea0]" />
          <div className="absolute right-[-80px] top-[8%] h-72 w-72 rotate-12 rounded-[50%] bg-[#5424c7]" />
          <div className="absolute left-[30%] top-[12%] h-12 w-12 rounded-full bg-[#ffb800]" />
        </div>

        <div className="relative z-10 flex min-h-[calc(100vh-160px)] items-center justify-center">

          <div className="relative w-full max-w-xl">

            <div className="absolute -right-2 -top-5 rotate-3 rounded-xl border-2 border-[#071a38] bg-[#ffb800] px-4 py-2 font-mono text-xs font-black uppercase shadow-[4px_4px_0_#071a38]">
              done!
            </div>

            <div className="rounded-[32px] border-[3px] border-[#071a38] bg-[#fffaf0] p-8 text-center shadow-[10px_10px_0_#4e9ea0] sm:p-12">

              <div className="mx-auto flex h-28 w-28 rotate-[-5deg] items-center justify-center rounded-[32px] border-2 border-[#071a38] bg-[#5424c7] text-6xl font-black text-white shadow-[6px_6px_0_#071a38]">
                ✓
              </div>

              <p className="mt-8 font-mono text-xs font-black uppercase tracking-[0.2em] text-[#5424c7]">
                Password updated
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-[-0.06em] text-[#071a38] sm:text-5xl">
                You're back in control.
              </h1>

              <div className="mx-auto mt-6 max-w-md rounded-2xl border-2 border-[#071a38] bg-[#f8f1e5] p-5">
                <p className="text-sm font-medium text-[#071a38]/70">
                  Your password has been reset successfully.
                  You can now log in with your new password.
                </p>
              </div>

              <Link
                to="/login"
                className="mt-8 inline-flex rounded-2xl border-2 border-[#071a38] bg-[#071a38] px-7 py-4 text-sm font-black uppercase tracking-wider text-white shadow-[5px_5px_0_#5424c7] transition-all hover:-translate-y-1"
              >
                Go to login →
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#f8f1e5] px-4 py-10 sm:px-6">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-20 top-[20%] h-64 w-64 rounded-full bg-[#4e9ea0]" />

        <div className="absolute right-[-90px] top-[10%] h-72 w-72 rotate-12 rounded-[45%_55%_60%_40%] bg-[#5424c7]" />

        <div className="absolute bottom-[-90px] left-[25%] h-64 w-64 rounded-full bg-[#ffb800]" />

        <div className="absolute right-[14%] bottom-[18%] h-12 w-12 rotate-12 rounded-xl bg-[#e47b62]" />

        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1200 800"
          fill="none"
        >
          <path
            d="M0 170 C200 80 300 300 480 190 S760 70 920 210 S1080 290 1200 190"
            stroke="#071a38"
            strokeWidth="2"
            strokeDasharray="8 13"
          />

          <path
            d="M0 650 C180 540 320 730 520 610 S850 470 1200 610"
            stroke="#5424c7"
            strokeWidth="3"
            strokeDasharray="11 15"
          />
        </svg>

        <span className="absolute left-[12%] top-[32%] font-mono text-4xl font-black text-[#071a38]/40">
          *
        </span>

        <span className="absolute right-[12%] bottom-[28%] font-mono text-5xl font-black text-white/60">
          +
        </span>
      </div>

      <div className="relative z-10 flex min-h-[calc(100vh-160px)] items-center justify-center">

        <div className="relative w-full max-w-lg">

          <div className="absolute -right-3 -top-5 z-20 rotate-3 rounded-xl border-2 border-[#071a38] bg-[#4e9ea0] px-4 py-2 font-mono text-xs font-black uppercase shadow-[4px_4px_0_#071a38]">
            secure reset
          </div>

          <div className="rounded-[32px] border-[3px] border-[#071a38] bg-[#fffaf0] p-7 shadow-[10px_10px_0_#5424c7] sm:p-10">

            <div className="mb-8">
              <div className="mb-5 flex h-14 w-14 rotate-[-4deg] items-center justify-center rounded-2xl border-2 border-[#071a38] bg-[#ffb800] text-2xl shadow-[4px_4px_0_#071a38]">
                🔐
              </div>

              <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#5424c7]">
                Relate / security
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-[-0.06em] text-[#071a38] sm:text-5xl">
                Choose a new
                <br />
                password.
              </h1>

              <p className="mt-4 text-sm font-medium leading-relaxed text-[#071a38]/60">
                Make it something only you know. You'll use
                this to get back into your Relate space.
              </p>
            </div>

            {resetError && (
              <div className="mb-5 rounded-2xl border-2 border-[#071a38] bg-[#e47b62] p-4 text-sm font-bold shadow-[4px_4px_0_#071a38]">

                <p>{resetError}</p>

                {resetErrorCode === 'RESET_TOKEN_INVALID' && (
                  <Link
                    to="/forgot"
                    className="mt-2 inline-block font-black underline decoration-2 underline-offset-4"
                  >
                    Request a new reset link →
                  </Link>
                )}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.16em] text-[#071a38]"
                >
                  New password
                </label>

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)

                    if (errors.password) {
                      setErrors((prev) => ({
                        ...prev,
                        password: '',
                      }))
                    }
                  }}
                  className={`w-full rounded-2xl border-2 bg-[#f8f1e5] px-4 py-4 font-medium text-[#071a38] outline-none transition-all placeholder:text-[#071a38]/30 focus:-translate-y-0.5 focus:border-[#5424c7] focus:bg-white focus:shadow-[4px_4px_0_#5424c7] ${
                    errors.password
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

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block font-mono text-xs font-black uppercase tracking-[0.16em] text-[#071a38]"
                >
                  Confirm password
                </label>

                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)

                    if (errors.confirmPassword) {
                      setErrors((prev) => ({
                        ...prev,
                        confirmPassword: '',
                      }))
                    }
                  }}
                  className={`w-full rounded-2xl border-2 bg-[#f8f1e5] px-4 py-4 font-medium text-[#071a38] outline-none transition-all placeholder:text-[#071a38]/30 focus:-translate-y-0.5 focus:border-[#5424c7] focus:bg-white focus:shadow-[4px_4px_0_#5424c7] ${
                    errors.confirmPassword
                      ? 'border-[#e47b62]'
                      : 'border-[#071a38]'
                  }`}
                  placeholder="••••••••"
                  disabled={loading}
                />

                {errors.confirmPassword && (
                  <p className="mt-2 text-xs font-bold text-[#c6533c]">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl border-2 border-[#071a38] bg-[#5424c7] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[5px_5px_0_#071a38] transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0_#071a38] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0_#071a38] disabled:opacity-60"
              >
                {loading
                  ? 'Resetting password...'
                  : 'Reset password →'}
              </button>
            </form>

            <p className="mt-7 text-center text-sm font-medium text-[#071a38]/60">
              Changed your mind?{' '}
              <Link
                to="/login"
                className="font-black text-[#071a38] underline decoration-[#ffb800] decoration-4 underline-offset-2"
              >
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
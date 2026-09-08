/** @jsxImportSource react */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import * as authApi from '../api/auth.api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  function validateForm() {
    const newErrors = {}

    if (!email.trim()) {
      newErrors.email = 'Please enter your email address.'
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

    try {
      await authApi.requestPasswordReset({ email })
      setSubmitted(true)
    } catch (error) {
      console.error(
        'Password reset request error:',
        error.message
      )

      setSubmitted(true)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#f8f1e5] px-4 py-10 sm:px-6">
 <div className="absolute -top-20 -left-20 w-48 h-48 bg-yellow-300 rounded-full opacity-25 blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-700 rounded-full opacity-20 blur-3xl"></div>
      <div className=" pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl "/>
      <div className=" pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl "/>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <div className="absolute left-[-80px] top-[15%] h-64 w-64 rounded-full bg-[#4e9ea0]" />
          <div className="absolute right-[-80px] bottom-[10%] h-72 w-72 rotate-12 rounded-[48%] bg-[#ffb800]" />

          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1200 800"
            fill="none"
          >
            <path
              d="M0 250 C180 120 280 350 450 220 S750 120 900 240 S1080 320 1200 210"
              stroke="#5424c7"
              strokeWidth="3"
              strokeDasharray="9 14"
            />
          </svg>
        </div>

        <div className="relative z-10 flex min-h-[calc(100vh-160px)] items-center justify-center">

          <div className="relative w-full max-w-xl">

            <div className="absolute -right-2 -top-5 rotate-3 rounded-xl border-2 border-[#071a38] bg-[#ffb800] px-4 py-2 font-mono text-xs font-black uppercase shadow-[4px_4px_0_#071a38]">
              sent
            </div>

            <div className="rounded-[32px] border-[3px] border-[#071a38] bg-[#fffaf0] p-7 text-center shadow-[10px_10px_0_#5424c7] sm:p-12">

              <div className="mx-auto flex h-24 w-24 rotate-[-5deg] items-center justify-center rounded-[28px] border-2 border-[#071a38] bg-[#4e9ea0] text-5xl shadow-[5px_5px_0_#071a38]">
                ✉
              </div>

              <p className="mt-8 font-mono text-xs font-black uppercase tracking-[0.2em] text-[#5424c7]">
                Relate / recovery
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-[-0.05em] text-[#071a38] sm:text-5xl">
                Check your email.
              </h1>

              <div className="mx-auto mt-7 max-w-md rounded-2xl border-2 border-[#071a38] bg-[#f8f1e5] p-5 text-left">
                <p className="text-sm font-medium leading-relaxed text-[#071a38]/75">
                  If an account with that email exists, a
                  password reset link has been sent to your
                  inbox.
                </p>

                <p className="mt-4 text-sm font-medium leading-relaxed text-[#071a38]/75">
                  The link will expire in 1 hour. If you don't
                  see the email, check your spam folder.
                </p>
              </div>

              <div className="mt-8">
                <Link
                  to="/login"
                  className="inline-flex rounded-2xl border-2 border-[#071a38] bg-[#5424c7] px-7 py-3.5 text-sm font-black uppercase tracking-wider text-white shadow-[5px_5px_0_#071a38] transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0_#071a38]"
                >
                  ← Back to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#f8f1e5] px-4 py-10 sm:px-6">

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-yellow-300 rounded-full opacity-25 blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-700 rounded-full opacity-20 blur-3xl"></div>
      <div className=" pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl "/>
      <div className=" pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl "/>

        <div className="absolute -left-24 top-[18%] h-72 w-72 rounded-full bg-[#5424c7]" />

        <div className="absolute right-[-80px] top-[12%] h-60 w-60 rotate-12 rounded-[40%_60%_55%_45%] bg-[#ffb800]" />

        <div className="absolute bottom-[-80px] right-[18%] h-48 w-48 rounded-full bg-[#e47b62]" />

        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1200 800"
          fill="none"
        >
          <path
            d="M0 580 C180 470 300 650 470 540 S760 380 930 510 S1090 580 1200 490"
            stroke="#071a38"
            strokeWidth="2"
            strokeDasharray="8 14"
          />
        </svg>

        <span className="absolute left-[13%] top-[22%] font-mono text-5xl font-black text-white/60">
          ?
        </span>

        <span className="absolute right-[16%] bottom-[27%] font-mono text-4xl font-black text-[#071a38]/40">
          +
        </span>
      </div>

      <div className="relative z-10 flex min-h-[calc(100vh-160px)] items-center justify-center">

        <div className="relative w-full max-w-lg">

          <div className="absolute -left-3 -top-5 z-20 -rotate-3 rounded-xl border-2 border-[#071a38] bg-[#4e9ea0] px-4 py-2 font-mono text-xs font-black uppercase shadow-[4px_4px_0_#071a38]">
            lost the key?
          </div>

          <div className="rounded-[32px] border-[3px] border-[#071a38] bg-[#fffaf0] p-7 shadow-[10px_10px_0_#ffb800] sm:p-10">

            <div className="mb-8">
              <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#5424c7]">
                Relate / recovery
              </p>

              <h1 className="mt-2 text-4xl font-black tracking-[-0.06em] text-[#071a38] sm:text-5xl">
                Reset your
                <br />
                password.
              </h1>

              <p className="mt-4 text-sm font-medium leading-relaxed text-[#071a38]/60">
                No worries. Tell us where to send the link
                and we'll help you get back in.
              </p>
            </div>

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

                    if (errors.email) {
                      setErrors((prev) => ({
                        ...prev,
                        email: '',
                      }))
                    }
                  }}
                  className={`w-full rounded-2xl border-2 bg-[#f8f1e5] px-4 py-4 font-medium text-[#071a38] outline-none transition-all placeholder:text-[#071a38]/30 focus:-translate-y-0.5 focus:border-[#5424c7] focus:bg-white focus:shadow-[4px_4px_0_#5424c7] ${
                    errors.email
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

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl border-2 border-[#071a38] bg-[#5424c7] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-white shadow-[5px_5px_0_#071a38] transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0_#071a38] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0_#071a38] disabled:opacity-60"
              >
                {loading ? 'Sending...' : 'Send reset link →'}
              </button>
            </form>

            <p className="mt-7 text-center text-sm font-medium text-[#071a38]/60">
              Remembered it?{' '}
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
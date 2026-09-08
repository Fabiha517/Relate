/** @jsxImportSource react */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import * as authApi from '../api/auth.api'
import * as guestSession from '../utils/guestSession'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login: contextLogin } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [registerError, setRegisterError] = useState('')
  const [saveGuestAnalogyError, setSaveGuestAnalogyError] = useState('')

  function validateForm() {
    const newErrors = {}

    if (!name.trim()) {
      newErrors.name = 'Please enter your name.'
    } else if (name.length > 100) {
      newErrors.name = 'Name must be 100 characters or fewer.'
    }

    if (!email.trim()) {
      newErrors.email = 'Please enter your email address.'
    }

    if (!password.trim()) {
      newErrors.password = 'Password is required.'
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.'
    } else if (password.length > 128) {
      newErrors.password = 'Password must be no more than 128 characters.'
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password.'
    }

    if (
      password &&
      confirmPassword &&
      password !== confirmPassword
    ) {
      newErrors.confirmPassword = 'Passwords do not match.'
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
    setRegisterError('')
    setSaveGuestAnalogyError('')

    try {
      const guestAnalogy = guestSession.get()

      const payload = {
        name,
        email,
        password,
      }

      if (guestAnalogy) {
        payload.guestAnalogy = guestAnalogy
      }

      const response = await authApi.register(payload)

      await contextLogin(email, password)

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
            'Your account was created successfully, but your guest analogy could not be saved.'
          )
        }
      }

      navigate('/', { replace: true })
    } catch (error) {
      if (error.response?.data?.error?.fields) {
        setErrors(error.response.data.error.fields)
      } else if (error.response?.data?.error?.message) {
        setRegisterError(error.response.data.error.message)
      } else {
        setRegisterError(
          'Registration failed. Please try again.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#f8f1e5] px-4 py-10 sm:px-6 lg:px-10">

      {/* BACKGROUND */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-yellow-300 rounded-full opacity-25 blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-700 rounded-full opacity-20 blur-3xl"></div>
      <div className=" pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl "/>
      <div className=" pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl "/>

        <div className="absolute -right-24 top-8 h-64 w-64 rotate-12 rounded-[48%_52%_38%_62%] bg-[#5424c7] sm:h-80 sm:w-80" />

        <div className="absolute -left-20 bottom-[-50px] h-60 w-60 rounded-full bg-[#ffb800]" />

        <div className="absolute left-[18%] top-[13%] h-16 w-16 rotate-[-15deg] rounded-2xl border-2 border-[#071a38] bg-[#4e9ea0] shadow-[4px_4px_0_#071a38]" />

        <div className="absolute right-[13%] bottom-[13%] h-10 w-10 rounded-full bg-[#e47b62]" />

        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1200 850"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 260 C170 170 240 370 390 275 S620 130 770 280 S1010 420 1200 250"
            stroke="#071a38"
            strokeWidth="2"
            strokeDasharray="8 12"
          />

          <path
            d="M0 680 C200 580 310 760 500 650 S800 500 1200 630"
            stroke="#5424c7"
            strokeWidth="3"
            strokeDasharray="12 14"
          />
        </svg>

        <span className="absolute left-[7%] top-[35%] rotate-12 font-mono text-4xl font-bold text-[#5424c7]">
          +
        </span>

        <span className="absolute right-[8%] top-[42%] rotate-[-8deg] font-mono text-3xl font-bold text-[#071a38]/50">
          //
        </span>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-160px)] max-w-6xl items-center">

        <div className="grid w-full items-center gap-12 lg:grid-cols-[440px_1fr]">

          {/* FORM */}
          <div className="relative order-2 lg:order-1">

            <div className="absolute -left-3 -top-6 z-20 -rotate-3 rounded-xl border-2 border-[#071a38] bg-[#e47b62] px-4 py-2 font-mono text-xs font-black uppercase tracking-wider shadow-[4px_4px_0_#071a38]">
              new here?
            </div>

            <div className="rounded-[30px] border-[3px] border-[#071a38] bg-[#fffaf0] p-6 shadow-[10px_10px_0_#ffb800] sm:p-8">

              <div className="mb-7">
                <p className="mb-2 font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#5424c7]">
                  Relate / 02
                </p>

                <h1 className="text-4xl font-black tracking-[-0.05em] text-[#071a38] sm:text-5xl">
                  Create your
                  <br />
                  space.
                </h1>

                <p className="mt-3 text-sm font-medium leading-relaxed text-[#071a38]/60">
                  A place for your concepts, analogies and
                  those satisfying “ohhh, now I get it” moments.
                </p>
              </div>

              {registerError && (
                <div className="mb-5 rounded-2xl border-2 border-[#071a38] bg-[#e47b62] p-4 text-sm font-bold shadow-[4px_4px_0_#071a38]">
                  {registerError}
                </div>
              )}

              {saveGuestAnalogyError && (
                <div className="mb-5 rounded-2xl border-2 border-[#071a38] bg-[#ffb800] p-4 text-sm font-bold">
                  {saveGuestAnalogyError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">

                {[
                  {
                    id: 'name',
                    label: 'Your name',
                    type: 'text',
                    value: name,
                    set: setName,
                    placeholder: 'Your full name',
                  },
                  {
                    id: 'email',
                    label: 'Email',
                    type: 'email',
                    value: email,
                    set: setEmail,
                    placeholder: 'your@email.com',
                  },
                  {
                    id: 'password',
                    label: 'Password',
                    type: 'password',
                    value: password,
                    set: setPassword,
                    placeholder: '••••••••',
                  },
                  {
                    id: 'confirmPassword',
                    label: 'Confirm password',
                    type: 'password',
                    value: confirmPassword,
                    set: setConfirmPassword,
                    placeholder: '••••••••',
                  },
                ].map((field) => (
                  <div key={field.id}>
                    <label
                      htmlFor={field.id}
                      className="mb-2 block font-mono text-[11px] font-black uppercase tracking-[0.15em] text-[#071a38]"
                    >
                      {field.label}
                    </label>

                    <input
                      id={field.id}
                      type={field.type}
                      value={field.value}
                      onChange={(e) => {
                        field.set(e.target.value)

                        if (errors[field.id]) {
                          setErrors((prev) => ({
                            ...prev,
                            [field.id]: '',
                          }))
                        }
                      }}
                      className={`w-full rounded-2xl border-2 bg-[#f8f1e5] px-4 py-3 font-medium text-[#071a38] outline-none transition-all placeholder:text-[#071a38]/30 focus:-translate-y-0.5 focus:border-[#5424c7] focus:bg-white focus:shadow-[4px_4px_0_#5424c7] ${
                        errors[field.id]
                          ? 'border-[#e47b62]'
                          : 'border-[#071a38]'
                      }`}
                      placeholder={field.placeholder}
                      disabled={loading}
                    />

                    {errors[field.id] && (
                      <p className="mt-1.5 text-xs font-bold text-[#c6533c]">
                        {errors[field.id]}
                      </p>
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full rounded-2xl border-2 border-[#071a38] bg-[#071a38] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#fffaf0] shadow-[5px_5px_0_#5424c7] transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0_#5424c7] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[2px_2px_0_#5424c7] disabled:opacity-60"
                >
                  {loading
                    ? 'Creating account...'
                    : 'Create account →'}
                </button>
              </form>

              <p className="mt-7 text-center text-sm font-medium text-[#071a38]/60">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-black text-[#5424c7] underline decoration-[#ffb800] decoration-4 underline-offset-2"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>

          {/* RIGHT VISUAL */}
          <div className="relative order-1 hidden min-h-[580px] lg:order-2 lg:block">

            <div className="absolute left-10 top-16 rotate-[-5deg] rounded-[28px] border-[3px] border-[#071a38] bg-[#ffb800] p-8 shadow-[8px_8px_0_#071a38]">
              <span className="font-mono text-xs font-black uppercase tracking-widest">
                Start here
              </span>

              <div className="mt-4 text-5xl font-black leading-none tracking-[-0.06em]">
                Think.
                <br />
                Relate.
                <br />
                Understand.
              </div>
            </div>

            <div className="absolute bottom-24 right-8 flex h-52 w-52 rotate-6 items-center justify-center rounded-full border-[3px] border-[#071a38] bg-[#5424c7] shadow-[9px_9px_0_#071a38]">
              <div className="text-center text-white">
                <div className="font-mono text-xs font-bold uppercase tracking-widest">
                  your ideas
                </div>
                <div className="mt-2 text-5xl font-black">→</div>
              </div>
            </div>

            <div className="absolute bottom-12 left-16 rotate-[-7deg] rounded-2xl border-2 border-[#071a38] bg-[#4e9ea0] px-6 py-4 font-bold shadow-[5px_5px_0_#071a38]">
              make connections
            </div>

            <div className="absolute right-5 top-5 font-mono text-5xl font-black text-[#071a38]/40">
              +
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
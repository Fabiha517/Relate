/** @jsxImportSource react */
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import * as authApi from '../api/auth.api'

/**
 * ProfilePage - User profile management page.
 * Allows authenticated users to view and edit their profile information and change password.
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

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setName(user.name || '')
    }
  }, [user])

  /**
   * Generate user avatar with initial
   */
  function getUserInitial() {
    if (!user?.name) return 'U'
    return user.name.charAt(0).toUpperCase()
  }

  /**
   * Validate profile form fields.
   */
  function validateProfileForm() {
    const newErrors = {}

    const nameStr = typeof name === 'string' ? name.trim() : ''
    if (nameStr.length === 0) {
      newErrors.name = 'Please enter your name.'
    } else if (nameStr.length > 100) {
      newErrors.name = 'Name must be no more than 100 characters.'
    }

    setProfileErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Validate password form fields.
   */
  function validatePasswordForm() {
    const newErrors = {}

    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required.'
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required.'
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters.'
    } else if (newPassword.length > 128) {
      newErrors.newPassword = 'Password must be no more than 128 characters.'
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password.'
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.'
    }

    setPasswordErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handle profile form submission.
   */
  async function handleProfileSubmit(e) {
    e.preventDefault()

    if (!validateProfileForm()) {
      return
    }

    setProfileLoading(true)
    setProfileSuccess('')

    try {
      await authApi.updateProfile({ name })
      setProfileSuccess('Profile updated successfully.')
      
      // Clear success message after 5 seconds
      setTimeout(() => setProfileSuccess(''), 5000)
    } catch (error) {
      if (error.response?.data?.error?.fields) {
        setProfileErrors(error.response.data.error.fields)
      } else {
        setProfileErrors({ general: error.response?.data?.error?.message || 'Profile update failed. Please try again.' })
      }
    } finally {
      setProfileLoading(false)
    }
  }

  /**
   * Handle password form submission.
   */
  async function handlePasswordSubmit(e) {
    e.preventDefault()

    if (!validatePasswordForm()) {
      return
    }

    setPasswordLoading(true)
    setPasswordSuccess('')

    try {
      await authApi.changePassword({ currentPassword, newPassword })
      setPasswordSuccess('Password changed successfully.')
      
      // Clear form
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      
      // Clear success message after 5 seconds
      setTimeout(() => setPasswordSuccess(''), 5000)
    } catch (error) {
      if (error.response?.data?.error?.fields) {
        setPasswordErrors(error.response.data.error.fields)
      } else if (error.response?.data?.error?.code === 'INVALID_CURRENT_PASSWORD') {
        setPasswordErrors({ currentPassword: 'Current password is incorrect.' })
      } else {
        setPasswordErrors({ general: error.response?.data?.error?.message || 'Password change failed. Please try again.' })
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f8f1e5] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#071a38] mb-4">Loading...</h1>
          <p className="text-[#526477]">Please wait while we load your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8f1e5] text-[#071a38]">
      {/* Background decoration */}
      <div className="absolute -top-20 -left-20 w-48 h-48 bg-yellow-300 rounded-full opacity-25 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-700 rounded-full opacity-20 blur-3xl pointer-events-none"></div>

      <div className="relative z-10 mx-auto max-w-4xl px-6 py-8 sm:px-8 sm:py-12">
        
        {/* Profile Header */}
        <div className="mb-12 text-center">
          {/* User Avatar */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#5424c7] text-3xl font-black text-white shadow-[4px_4px_0_#071a38] sm:h-32 sm:w-32 sm:text-4xl">
            {getUserInitial()}
          </div>
          
          <h1 className="mb-2 text-4xl font-black uppercase tracking-tight text-[#071a38] sm:text-5xl">
            Your Profile
          </h1>
          
          <p className="text-lg text-[#526477] sm:text-xl">
            Manage your account information
          </p>
        </div>

        {/* Profile Cards Container */}
        <div className="grid gap-8 lg:grid-cols-2">
          
          {/* Profile Information Card */}
          <div className="rounded-[18px] border-2 border-[#071a38] bg-white/80 p-6 shadow-[6px_6px_0_#071a38] backdrop-blur-sm sm:p-8">
            <h2 className="mb-6 text-2xl font-black uppercase tracking-tight text-[#071a38]">
              Profile Information
            </h2>

            {/* Current Info Display */}
            <div className="mb-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#526477] uppercase tracking-wide mb-1">
                  Email
                </label>
                <div className="rounded-lg border-2 border-[#c9c5bb] bg-[#f5f0e6] px-4 py-3 text-[#071a38] font-medium">
                  {user.email}
                </div>
                <p className="mt-1 text-xs text-[#526477]">
                  Email cannot be changed
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#526477] uppercase tracking-wide mb-1">
                  Member Since
                </label>
                <div className="rounded-lg border-2 border-[#c9c5bb] bg-[#f5f0e6] px-4 py-3 text-[#071a38] font-medium">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <form onSubmit={handleProfileSubmit}>
              <div className="mb-6">
                <label htmlFor="name" className="block text-sm font-bold text-[#526477] uppercase tracking-wide mb-2">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (profileErrors.name) {
                      setProfileErrors(prev => ({ ...prev, name: '' }))
                    }
                  }}
                  className={`w-full rounded-lg border-2 px-4 py-3 text-[#071a38] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5424c7] focus:ring-offset-2 ${profileErrors.name ? "border-[#f27d6b] bg-[#ffebe9]" : "border-[#c9c5bb] bg-white focus:border-[#5424c7]"}`}
                  placeholder="Your full name"
                  disabled={profileLoading}
                />
                
                {/* Reserved space for name field validation error - prevents layout shift */}
                <div className="mt-2 min-h-[20px]">
                  {profileErrors.name && (
                    <p className="text-sm text-[#f27d6b] font-medium">{profileErrors.name}</p>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full rounded-xl border-2 border-[#17aaa7] bg-[#17aaa7] px-6 py-3 font-black text-[#071a38] shadow-[3px_3px_0_#071a38] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#071a38] active:translate-y-0 active:shadow-[1px_1px_0_#071a38] disabled:cursor-not-allowed disabled:opacity-70 disabled:transform-none"
              >
                {profileLoading ? 'Updating...' : 'Update Profile'}
              </button>

              {/* Reserved Profile Feedback Area - Fixed Height to Prevent Layout Shift */}
              <div className="mt-4 min-h-[60px] flex items-center">
                {profileSuccess && (
                  <div className="w-full rounded-lg border-2 border-[#17aaa7] bg-[#dff8f6] px-4 py-3 text-[#071a38]">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✓</span>
                      <span className="font-medium">{profileSuccess}</span>
                    </div>
                  </div>
                )}

                {profileErrors.general && (
                  <div className="w-full rounded-lg border-2 border-[#f27d6b] bg-[#ffebe9] px-4 py-3 text-[#071a38]">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✕</span>
                      <span className="font-medium">{profileErrors.general}</span>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="rounded-[18px] border-2 border-[#071a38] bg-white/80 p-6 shadow-[6px_6px_0_#071a38] backdrop-blur-sm sm:p-8">
            <h2 className="mb-6 text-2xl font-black uppercase tracking-tight text-[#071a38]">
              Change Password
            </h2>

            {/* Password Form */}
            <form onSubmit={handlePasswordSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-bold text-[#526477] uppercase tracking-wide mb-2">
                    Current Password
                  </label>
                  <input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value)
                      if (passwordErrors.currentPassword) {
                        setPasswordErrors(prev => ({ ...prev, currentPassword: '' }))
                      }
                    }}
                    className={`w-full rounded-lg border-2 px-4 py-3 text-[#071a38] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5424c7] focus:ring-offset-2 ${passwordErrors.currentPassword ? "border-[#f27d6b] bg-[#ffebe9]" : "border-[#c9c5bb] bg-white focus:border-[#5424c7]"}`}
                    placeholder="••••••••"
                    disabled={passwordLoading}
                  />
                  
                  {/* Reserved space for currentPassword field validation error - prevents layout shift */}
                  <div className="mt-2 min-h-[20px]">
                    {passwordErrors.currentPassword && (
                      <p className="text-sm text-[#f27d6b] font-medium">{passwordErrors.currentPassword}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-bold text-[#526477] uppercase tracking-wide mb-2">
                    New Password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value)
                      if (passwordErrors.newPassword) {
                        setPasswordErrors(prev => ({ ...prev, newPassword: '' }))
                      }
                    }}
                    className={`w-full rounded-lg border-2 px-4 py-3 text-[#071a38] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5424c7] focus:ring-offset-2 ${passwordErrors.newPassword ? "border-[#f27d6b] bg-[#ffebe9]" : "border-[#c9c5bb] bg-white focus:border-[#5424c7]"}`}
                    placeholder="••••••••"
                    disabled={passwordLoading}
                  />
                  
                  {/* Reserved space for newPassword field validation error - prevents layout shift */}
                  <div className="mt-2 min-h-[20px]">
                    {passwordErrors.newPassword && (
                      <p className="text-sm text-[#f27d6b] font-medium">{passwordErrors.newPassword}</p>
                    )}
                  </div>
                  
                  <p className="mt-1 text-xs text-[#526477]">
                    Must be 8-128 characters
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-bold text-[#526477] uppercase tracking-wide mb-2">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value)
                      if (passwordErrors.confirmPassword) {
                        setPasswordErrors(prev => ({ ...prev, confirmPassword: '' }))
                      }
                    }}
                    className={`w-full rounded-lg border-2 px-4 py-3 text-[#071a38] transition-colors focus:outline-none focus:ring-2 focus:ring-[#5424c7] focus:ring-offset-2 ${passwordErrors.confirmPassword ? "border-[#f27d6b] bg-[#ffebe9]" : "border-[#c9c5bb] bg-white focus:border-[#5424c7]"}`}
                    placeholder="••••••••"
                    disabled={passwordLoading}
                  />
                  
                  {/* Reserved space for confirmPassword field validation error - prevents layout shift */}
                  <div className="mt-2 min-h-[20px]">
                    {passwordErrors.confirmPassword && (
                      <p className="text-sm text-[#f27d6b] font-medium">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={passwordLoading}
                className="mt-6 w-full rounded-xl border-2 border-[#f27d6b] bg-[#f27d6b] px-6 py-3 font-black text-white shadow-[3px_3px_0_#071a38] transition-all hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#071a38] active:translate-y-0 active:shadow-[1px_1px_0_#071a38] disabled:cursor-not-allowed disabled:opacity-70 disabled:transform-none"
              >
                {passwordLoading ? 'Changing Password...' : 'Change Password'}
              </button>

              {/* Reserved Password Feedback Area - Fixed Height to Prevent Layout Shift */}
              <div className="mt-4 min-h-[60px] flex items-center">
                {passwordSuccess && (
                  <div className="w-full rounded-lg border-2 border-[#17aaa7] bg-[#dff8f6] px-4 py-3 text-[#071a38]">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✓</span>
                      <span className="font-medium">{passwordSuccess}</span>
                    </div>
                  </div>
                )}

                {passwordErrors.general && (
                  <div className="w-full rounded-lg border-2 border-[#f27d6b] bg-[#ffebe9] px-4 py-3 text-[#071a38]">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✕</span>
                      <span className="font-medium">{passwordErrors.general}</span>
                    </div>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}


import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import ConfirmModal from '../ui/ConfirmModal'

// 👇 Keep your existing logo import here
import logo from '../../../dist/assets/logo.svg'

/**
 * Navbar - Top navigation bar for the application.
 *
 * For authenticated users: Shows Library, Practice links, and Profile avatar
 * For guests: Shows Login and Register links
 *
 * Uses useAuth() to determine user state
 *
 * Requirements: 7.20, 9.1
 */
export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  async function handleLogoutConfirm() {
    setShowLogoutModal(false)

    try {
      await logout()
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  /**
   * Get user's initial for avatar
   */
  function getUserInitial() {
    if (!user?.name) return 'U'
    return user.name.charAt(0).toUpperCase()
  }

  return (
    <>
      <nav className="relative z-50 px-4 pt-5 sm:px-6">
        <div
          className="
            mx-auto flex min-h-[70px] w-full max-w-6xl
            items-center justify-between
            rounded-[18px]
            border-2 border-[#202331]
            bg-[#202331]
            px-3 py-2 pl-5
            shadow-[7px_7px_0_#F2C94C]
          "
        >
          {/* ==================== LOGO ==================== */}
          <Link
            to="/"
            className="
              flex items-center 
              rounded-xl px-2 py-1
              transition-all duration-200
              hover:-rotate-1 hover:scale-[1.03]
            "
          >
            <img
              src={logo}
              alt="Relate"
              className="h-9 w-7 object-contain"
            />

            <span className="text-2xl font-semibold tracking-tight text-[#e3cb18]">
              RELATE
            </span>
          </Link>

          {/* ==================== NAVIGATION ==================== */}
          <div className="flex items-center">
            {user ? (
              /* ================= AUTHENTICATED USER ================= */
              <div className="flex items-center gap-1.5">
                <Link
                  to="/library"
                  className="
                    rounded-xl px-4 py-2.5
                    text-sm font-bold
                    text-[#F5F0E8]
                    transition-all duration-200
                    hover:-translate-y-0.5
                    hover:bg-[#F2C94C]
                    hover:text-[#202331]
                  "
                >
                  My Library
                </Link>

                <Link
                  to="/practice"
                  className="
                    rounded-xl px-4 py-2.5
                    text-sm font-bold
                    text-[#F5F0E8]
                    transition-all duration-200
                    hover:-translate-y-0.5
                    hover:bg-[#42BFA5]
                    hover:text-[#202331]
                  "
                >
                  Practice History
                </Link>

                {/* Profile Avatar */}
                <Link
                  to="/profile"
                  className="
                    ml-2 flex h-10 w-10
                    items-center justify-center
                    rounded-full
                    bg-[#5424c7]
                    text-sm font-black
                    text-white
                    shadow-[2px_2px_0_#F2C94C]
                    transition-all duration-200
                    hover:-translate-y-0.5
                    hover:shadow-[3px_3px_0_#F2C94C]
                    active:translate-y-0
                    active:shadow-[1px_1px_0_#F2C94C]
                  "
                  title={`Profile - ${user.name}`}
                >
                  {getUserInitial()}
                </Link>

                <button
                  onClick={() => setShowLogoutModal(true)}
                  className="
                    ml-1 rounded-xl px-4 py-2.5
                    text-sm font-bold
                    text-[#F5F0E8]
                    transition-all duration-200
                    hover:-translate-y-0.5
                    hover:bg-[#F27D6B]
                    hover:text-[#202331]
                  "
                >
                  Log out
                </button>
              </div>
            ) : (
              /* ====================== GUEST ====================== */
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="
                    rounded-xl px-4 py-2.5
                    text-sm font-bold
                    text-[#F5F0E8]
                    transition-all duration-200
                    hover:-translate-y-0.5
                    hover:bg-[#42BFA5]
                    hover:text-[#202331]
                  "
                >
                  Log in
                </Link>

                <Link
                  to="/register"
                  className="
                    rounded-xl
                    border-2 border-[#F2C94C]
                    bg-[#8067D9]
                    px-2 md:px-4 py-2.5
                    text-sm font-black
                    text-[#202331]
                    shadow-[3px_3px_0_#F2C94C]
                    transition-all duration-200
                    hover:-translate-x-0.5
                    hover:-translate-y-0.5
                    hover:bg-[#F2C94C]
                    hover:shadow-[5px_5px_0_#F27D6B]
                    active:translate-x-0
                    active:translate-y-0
                    active:shadow-[1px_1px_0_#F27D6B]
                  "
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        title="Log out?"
        message="Are you sure you want to log out of Relate?"
        confirmLabel="Log out"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  )
}

export default Navbar


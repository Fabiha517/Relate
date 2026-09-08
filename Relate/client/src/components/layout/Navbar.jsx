import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import ConfirmModal from '../ui/ConfirmModal'

// Keep your existing logo import here
import logo from '../../assets/logo.svg'

/**
 * Navbar - Top navigation bar for the application.
 *
 * Desktop:
 *   Shows full navigation.
 *
 * Mobile:
 *   Shows logo + hamburger button.
 *   Navigation opens in a compact dropdown panel.
 *
 * Authenticated users:
 *   Home, Library, Practice, Profile, Logout
 *
 * Guests:
 *   Login, Register
 */
export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)

  async function handleLogoutConfirm() {
    setShowLogoutModal(false)
    setShowMobileMenu(false)

    try {
      await logout()
      navigate('/', { replace: true })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  function closeMobileMenu() {
    setShowMobileMenu(false)
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
      <nav className="relative z-50 px-3 pt-4 sm:px-6 sm:pt-5">
        <div
          className="
            mx-auto
            flex min-h-[62px] w-full max-w-6xl
            items-center justify-between
            rounded-[18px]
            border-2 border-[#202331]
            bg-[#202331]
            px-3 py-2
            pl-4 sm:min-h-[70px] sm:pl-5
            shadow-[5px_5px_0_#F2C94C]
            sm:shadow-[7px_7px_0_#F2C94C]
          "
        >

          {/* =====================================================
              LOGO
          ===================================================== */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="
              flex items-center
              rounded-xl px-1.5 py-1 sm:px-2
              transition-all duration-200
              hover:-rotate-1 hover:scale-[1.03]
            "
          >
            <img
              src={logo}
              alt="Relate"
              className="h-8 w-6 object-contain sm:h-9 sm:w-7"
            />

            <span
              className="
                text-xl font-semibold tracking-tight text-[#e3cb18]
                sm:text-2xl
              "
            >
              RELATE
            </span>
          </Link>

          {/* =====================================================
              DESKTOP NAVIGATION
          ===================================================== */}
          <div className="hidden items-center md:flex">

            {user ? (
              <div className="flex items-center gap-1.5">

                {/* Home */}
                <Link
                  to="/"
                  className="
                    rounded-xl px-4 py-2.5
                    text-sm font-bold
                    text-[#F5F0E8]
                    transition-all duration-200
                    hover:-translate-y-0.5
                    hover:bg-[#e7811b]
                    hover:text-[#202331]
                  "
                >
                  Home
                </Link>

                {/* Library */}
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

                {/* Practice */}
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

                {/* Logout */}
                <button
                  type="button"
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
              <div className="flex items-center gap-2">

 <Link
      to="/"
      className="
        rounded-xl px-4 py-2.5
        text-sm font-bold
        text-[#F5F0E8]
        transition-all duration-200
        hover:-translate-y-0.5
        hover:bg-[#e7811b]
        hover:text-[#202331]
      "
    >
      Home
    </Link>
                {/* Login */}
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

                {/* Register */}
                <Link
                  to="/register"
                  className="
                    rounded-xl
                    border-2 border-[#F2C94C]
                    bg-[#8067D9]
                    px-3 py-2.5
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

          {/* =====================================================
              MOBILE MENU BUTTON
          ===================================================== */}
          <button
            type="button"
            onClick={() => setShowMobileMenu((prev) => !prev)}
            aria-label={showMobileMenu ? 'Close menu' : 'Open menu'}
            aria-expanded={showMobileMenu}
            className="
              flex h-10 w-10
              items-center justify-center
              rounded-xl
              border-2 border-[#F2C94C]
              bg-[#5424C7]
              text-white
              transition-all duration-200
              hover:-translate-y-0.5
              hover:bg-[#8067D9]
              active:translate-y-0
              md:hidden
            "
          >
            {showMobileMenu ? (
              <span className="text-2xl font-black leading-none">
                ×
              </span>
            ) : (
              <span className="flex flex-col gap-1">
                <span className="h-0.5 w-5 rounded-full bg-white" />
                <span className="h-0.5 w-5 rounded-full bg-white" />
                <span className="h-0.5 w-5 rounded-full bg-white" />
              </span>
            )}
          </button>
        </div>

      {/* =====================================================
    MOBILE MENU — OVERLAY
===================================================== */}
{showMobileMenu && (
  <div
    className="
      absolute left-3 right-3 top-full mt-3
      z-[100]
      md:hidden
    "
  >
    <div
      className="
        mx-auto w-full max-w-6xl
        overflow-hidden
        rounded-[20px]
        border-2 border-[#202331]
        bg-[#202331]
        shadow-[5px_5px_0_#F2C94C]
      "
    >
      {user ? (
        <div className="p-3">

          {/* Profile mini header */}
          <Link
            to="/profile"
            onClick={closeMobileMenu}
            className="
              mb-2 flex items-center gap-3
              rounded-2xl
              border-2 border-[#8067D9]
              bg-[#2c2d3b]
              px-3 py-3
              transition-all
              hover:bg-[#5424C7]
            "
          >
            <span
              className="
                flex h-10 w-10 shrink-0
                items-center justify-center
                rounded-full
                bg-[#5424c7]
                text-sm font-black
                text-white
                shadow-[2px_2px_0_#F2C94C]
              "
            >
              {getUserInitial()}
            </span>

            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#F2C94C]">
                Profile
              </p>

              <p className="truncate text-sm font-bold text-[#F5F0E8]">
                {user.name}
              </p>
            </div>
          </Link>

          {/* Home */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="
              block rounded-xl px-4 py-3
              text-sm font-bold
              text-[#F5F0E8]
              transition-all
              hover:bg-[#e7811b]
              hover:text-[#202331]
            "
          >
            Home
          </Link>

          {/* Library */}
          <Link
            to="/library"
            onClick={closeMobileMenu}
            className="
              block rounded-xl px-4 py-3
              text-sm font-bold
              text-[#F5F0E8]
              transition-all
              hover:bg-[#F2C94C]
              hover:text-[#202331]
            "
          >
            My Library
          </Link>

          {/* Practice */}
          <Link
            to="/practice"
            onClick={closeMobileMenu}
            className="
              block rounded-xl px-4 py-3
              text-sm font-bold
              text-[#F5F0E8]
              transition-all
              hover:bg-[#42BFA5]
              hover:text-[#202331]
            "
          >
            Practice History
          </Link>

          {/* Logout */}
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="
              mt-1 w-full
              rounded-xl px-4 py-3
              text-left
              text-sm font-bold
              text-[#F5F0E8]
              transition-all
              hover:bg-[#F27D6B]
              hover:text-[#202331]
            "
          >
            Log out
          </button>

        </div>
      ) : (
        <div className="flex flex-col gap-2 p-3">
 {/* Home */}
  <Link
    to="/"
    onClick={closeMobileMenu}
    className="
      rounded-xl px-4 py-3
      text-sm font-bold
      text-[#F5F0E8]
      transition-all
      hover:bg-[#e7811b]
      hover:text-[#202331]
    "
  >
    Home
  </Link>
          {/* Login */}
          <Link
            to="/login"
            onClick={closeMobileMenu}
            className="
              rounded-xl px-4 py-3
              text-sm font-bold
              text-[#F5F0E8]
              transition-all
              hover:bg-[#42BFA5]
              hover:text-[#202331]
            "
          >
            Log in
          </Link>

          {/* Register */}
          <Link
            to="/register"
            onClick={closeMobileMenu}
            className="
              rounded-xl
              border-2 border-[#F2C94C]
              bg-[#8067D9]
              px-4 py-3
              text-center
              text-sm font-black
              text-[#202331]
              shadow-[3px_3px_0_#F2C94C]
              transition-all
              hover:bg-[#F2C94C]
              hover:shadow-[4px_4px_0_#F27D6B]
            "
          >
            Sign up
          </Link>

        </div>
      )}
    </div>
  </div>
)}
      </nav>

      {/* =========================================================
          LOGOUT CONFIRMATION MODAL
      ========================================================= */}
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
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { Navbar } from './components/layout/Navbar'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { GuestRoute } from './components/layout/GuestRoute'
import ScrollToTop from './components/layout/ScrollToTop'
// Pages
import HomePage from './pages/HomePage'
import AnalogyPage from './pages/AnalogyPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import LibraryPage from './pages/LibraryPage'
import PracticeLandingPage from './pages/PracticeLandingPage'
import PracticeSessionPage from './pages/PracticeSessionPage'
import PracticeSessionReviewPage from './pages/PracticeSessionReviewPage'
import PracticeHistoryPage from './pages/PracticeHistoryPage'
import ProfilePage from './pages/ProfilePage'

/**
 * App - Main application component with routing
 *
 * Route structure:
 * - `/` → HomePage (public)
 * - `/analogy` → AnalogyPage (public - fresh/generated analogy flow)
 * - `/login` → LoginPage (GuestRoute - redirects authenticated users to /library)
 * - `/register` → RegisterPage (GuestRoute - redirects authenticated users to /library)
 * - `/forgot` → ForgotPasswordPage (GuestRoute - redirects authenticated users to /library)
 * - `/reset` → ResetPasswordPage (GuestRoute - redirects authenticated users to /library)
 * - `/library` → LibraryPage (ProtectedRoute - auth required)
 * - `/library/:id` → AnalogyPage (ProtectedRoute - view saved analogy)
 * - `/practice` → PracticeLandingPage (ProtectedRoute - auth required)
 * - `/practice/:analogyId` → PracticeSessionPage (ProtectedRoute - auth required)
 * - `/practice/:analogyId/session/:sessionId` → PracticeSessionReviewPage (ProtectedRoute - auth required)
 * - `/practice/history` → PracticeHistoryPage (ProtectedRoute - auth required)
 *
 * ProtectedRoute redirects to /login?from=<currentPath> if unauthenticated
 * GuestRoute redirects to /library if authenticated
 *
 * Requirements: 9.1, 10.5
 */
export default function App() {
  return (
    <Router>
      <ScrollToTop/>  
      <AuthProvider>
        <div className="app min-h-screen bg-[#f8f1e5] relativ">
           {/* DECORATIVE BACKGROUND ELEMENTS */}
      <div className="absolute -top-20 -left-20 w-48 h-48 bg-yellow-300 rounded-full opacity-25 blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-purple-700 rounded-full opacity-20 blur-3xl"></div>
      <div className=" pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl "/>
      <div className=" pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-yellow-300/30 blur-3xl "/>
      <div className=" pointer-events-none absolute -right-32 top-1/3 h-96 w-96 rounded-full bg-purple-800/35 blur-3xl "/>
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/analogy" element={<AnalogyPage />} />

              {/* Guest-only auth routes */}
              <Route
                path="/login"
                element={
                  <GuestRoute>
                    <LoginPage />
                  </GuestRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <GuestRoute>
                    <RegisterPage />
                  </GuestRoute>
                }
              />
              <Route
                path="/forgot"
                element={
                  <GuestRoute>
                    <ForgotPasswordPage />
                  </GuestRoute>
                }
              />
              <Route
                path="/reset"
                element={
                  <GuestRoute>
                    <ResetPasswordPage />
                  </GuestRoute>
                }
              />

              {/* Protected authenticated routes */}
              <Route
                path="/library"
                element={
                  <ProtectedRoute>
                    <LibraryPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/library/:id"
                element={
                  <ProtectedRoute>
                    <AnalogyPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/practice"
                element={
                  <ProtectedRoute>
                    <PracticeLandingPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/practice/:analogyId"
                element={
                  <ProtectedRoute>
                    <PracticeSessionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/practice/:analogyId/session/:sessionId"
                element={
                  <ProtectedRoute>
                    <PracticeSessionReviewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/practice/history"
                element={
                  <ProtectedRoute>
                    <PracticeHistoryPage />
                  </ProtectedRoute>
                }
              />              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  )
}



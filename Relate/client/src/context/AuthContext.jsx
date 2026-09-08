/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useEffect,
  useState,
  useCallback,
} from 'react'

import * as authApi from '../api/auth.api'

/**
 * AuthContext - Manages user authentication state and provides auth actions.
 */
export const AuthContext = createContext(null)

/**
 * AuthProvider - Wraps the application and provides authentication state.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  // Used only while checking the existing auth cookie on app startup.
  const [initializing, setInitializing] = useState(true)

  // Used for login/logout actions.
  const [loading, setLoading] = useState(false)

  /**
   * Rehydrate user state on mount by calling GET /api/auth/me.
   */
  useEffect(() => {
    const rehydrateUser = async () => {
      try {
        const userData = await authApi.getCurrentUser()

        setUser(userData.user || userData)
      } catch (error) {
        if (error.response?.status === 401) {
          setUser(null)
        } else {
          console.error(
            'Failed to rehydrate auth state:',
            error.message
          )

          setUser(null)
        }
      } finally {
        setInitializing(false)
      }
    }

    rehydrateUser()
  }, [])

  /**
   * Log in a user.
   */
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true)

      const response = await authApi.login({
        email,
        password,
      })

      const userData = response.user || response

      setUser(userData)

      return userData
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Log out the current user.
   */
  const logout = useCallback(async () => {
    try {
      setLoading(true)

      await authApi.logout()

      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const value = {
    user,
    loading,
    initializing,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
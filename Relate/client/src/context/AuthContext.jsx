/** @jsxImportSource react */
/* eslint-disable react-refresh/only-export-components */
import { createContext, useEffect, useState, useCallback } from 'react'
import * as authApi from '../api/auth.api'

/**
 * AuthContext - Manages user authentication state and provides auth actions.
 */
export const AuthContext = createContext(null)

/**
 * AuthProvider - Wraps the application and provides authentication state.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  /**
   * Rehydrate user state on mount by calling GET /api/auth/me.
   * Sets user: null on 401 (not authenticated).
   */
  useEffect(() => {
    const rehydrateUser = async () => {
      try {
        setLoading(true)
        const userData = await authApi.getCurrentUser()
        setUser(userData.user || userData)
      } catch (error) {
        // 401 means not authenticated, which is expected for guests
        if (error.response?.status === 401) {
          setUser(null)
        } else {
          // Log unexpected errors but don't throw - let user continue as guest
          console.error('Failed to rehydrate auth state:', error.message)
          setUser(null)
        }
      } finally {
        setLoading(false)
      }
    }

    rehydrateUser()
  }, [])

  /**
   * Log in a user.
   *
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>} User object
   * @throws {Error} Login failed
   */
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true)
      const response = await authApi.login({ email, password })
      const userData = response.user || response
      setUser(userData)
      return userData
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Log out the current user.
   *
   * @returns {Promise<void>}
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
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

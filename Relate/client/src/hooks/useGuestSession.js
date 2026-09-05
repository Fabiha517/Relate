import { useCallback } from 'react'
import * as guestSessionUtil from '../utils/guestSession'

/**
 * useGuestSession - Hook for managing guest analogy session storage
 * 
 * Wraps the guestSession utility but does NOT touch the guestId cookie
 * (the guestId cookie is managed server-side via middleware)
 * 
 * This hook provides a React interface for storing/retrieving guest analogies
 * from sessionStorage
 * 
 * Requirements: 6.7, 6.8
 */
export function useGuestSession() {
  /**
   * Get the stored guest analogy
   */
  const get = useCallback(() => {
    return guestSessionUtil.get()
  }, [])

  /**
   * Store an analogy in guest session
   */
  const set = useCallback((analogy) => {
    guestSessionUtil.set(analogy)
  }, [])

  /**
   * Clear the guest analogy from session
   */
  const clear = useCallback(() => {
    guestSessionUtil.clear()
  }, [])

  return {
    get,
    set,
    clear,
  }
}

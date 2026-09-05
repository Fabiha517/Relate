import { useState, useCallback } from 'react'
import * as analogyApi from '../api/analogy.api'
import * as guestSession from '../utils/guestSession'

/**
 * useAnalogy - Hook for managing analogy generation, modification, and saving
 * 
 * State:
 * - analogy: current analogy object (null if not generated)
 * - loading: boolean indicating if a request is in progress
 * - modifying: boolean indicating if a modification is in progress
 * - error: current error state object with code and message
 * 
 * Requirements: 2.3, 2.10, 6.7, 6.8
 */
export function useAnalogy() {
  const [analogy, setAnalogy] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modifying, setModifying] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Generate a new analogy
   * Handles error codes:
   * - MEANINGFULNESS_REJECTED (400): display on concept field
   * - AI_FAILURE (503): dismissible banner
   * - GUEST_LIMIT_REACHED (403): inline message with login/register links
   */
  const generate = useCallback(async (concept, analogyWorld) => {


    setLoading(true)
    setError(null)

    try {


      const response = await analogyApi.generateAnalogy({ concept, analogyWorld })

      const generatedAnalogy = response.analogy || response

      // Preserve the original user inputs because the AI response
      // may not include them.
      const completeAnalogy = {
        ...generatedAnalogy,
        concept,
        analogyWorld,
      }

      setAnalogy(completeAnalogy)

      // Store complete analogy in guest session
      guestSession.set(completeAnalogy)

      return completeAnalogy
    } catch (err) {

      const status = err.response?.status
      const errorCode = err.response?.data?.error?.code
      const errorMessage = err.response?.data?.error?.message || err.message

      let errorObj = {
        code: errorCode,
        message: errorMessage,
        status,
      }

      // Handle specific error codes
      if (errorCode === 'MEANINGFULNESS_REJECTED' || status === 400) {
        errorObj = {
          code: 'MEANINGFULNESS_REJECTED',
          message: errorMessage || 'Please provide a meaningful concept, question, explanation, or topic.',
          status: 400,
          field: 'concept', // Error should display on concept field
        }
      } else if (errorCode === 'AI_FAILURE' || status === 503) {
        errorObj = {
          code: 'AI_FAILURE',
          message: errorMessage || 'Failed to generate analogy. Please try again.',
          status: 503,
          dismissible: true,
        }
      } else if (errorCode === 'GUEST_LIMIT_REACHED' || status === 403) {
        errorObj = {
          code: 'GUEST_LIMIT_REACHED',
          message: errorMessage || 'You have used your free analogy. Create an account to generate more.',
          status: 403,
          inline: true,
          showAuthLinks: true,
        }
      }

      setError(errorObj)
      throw errorObj
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Modify an existing analogy (simplify, expand, regenerate, or switch world)
   */
  const modify = useCallback(async (analogyId, modificationType, params = {}) => {
    setModifying(true)
    setError(null)

    try {
      const modifyParams = {
        modificationType,
        currentNodeCount: analogy?.nodes?.length || 0,
        ...params,
      }

      const response = await analogyApi.modifyAnalogy(analogyId, modifyParams)
      const updatedAnalogy = response.analogy || response

      const completeAnalogy = {
        ...updatedAnalogy,
        concept: updatedAnalogy.concept || analogy?.concept || '',
        analogyWorld: updatedAnalogy.analogyWorld || analogy?.analogyWorld || '',
      }

      setAnalogy(completeAnalogy)
      guestSession.set(completeAnalogy)

      return completeAnalogy
    } catch (err) {
      const status = err.response?.status
      const errorCode = err.response?.data?.error?.code
      const errorMessage = err.response?.data?.error?.message || err.message

      const errorObj = {
        code: errorCode || 'MODIFICATION_FAILED',
        message: errorMessage || 'Failed to modify analogy. Please try again.',
        status,
        dismissible: true,
      }

      setError(errorObj)
      throw errorObj
    } finally {
      setModifying(false)
    }
  }, [analogy])

  /**
   * Save an analogy to the authenticated user's library
   */
  const save = useCallback(async (analogyData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await analogyApi.saveAnalogy(analogyData)
      const savedAnalogy = response.analogy || response

      setAnalogy({
        ...analogy,
        ...savedAnalogy,
        id: savedAnalogy.id,
        createdAt: savedAnalogy.createdAt,
      })

      // Clear guest session after successful save
      guestSession.clear()

      return savedAnalogy
    }
    catch (err) {
      const status = err.response?.status
      const errorCode = err.response?.data?.error?.code
      const errorMessage =
        err.response?.data?.error?.message || err.message

      const errorFields = err.response?.data?.error?.fields

      const errorObj = {
        code: errorCode || 'SAVE_FAILED',
        message: errorMessage || 'Failed to save analogy. Please try again.',
        status,
        fields: errorFields,
        dismissible: true,
        showRetry: true,
      }

      console.error('Save API error:', err.response?.data)

      setError(errorObj)
      throw errorObj
    } finally {
      setLoading(false)
    }
  }, [analogy])

  /**
   * Update an existing saved analogy (for modified versions)
   */
  const update = useCallback(async (analogyId, analogyData) => {
    setLoading(true)
    setError(null)

    try {
      const response = await analogyApi.updateAnalogy(analogyId, analogyData)
      const updatedAnalogy = response.analogy || response

      setAnalogy(updatedAnalogy)

      return updatedAnalogy
    } catch (err) {
      const status = err.response?.status
      const errorCode = err.response?.data?.error?.code
      const errorMessage = err.response?.data?.error?.message || err.message

      const errorObj = {
        code: errorCode || 'UPDATE_FAILED',
        message: errorMessage || 'Failed to update analogy. Please try again.',
        status,
        dismissible: true,
        showRetry: true,
      }

      setError(errorObj)
      throw errorObj
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    analogy,
    loading,
    modifying,
    error,
    generate,
    modify,
    save,
    update,
    clearError,
  }
}

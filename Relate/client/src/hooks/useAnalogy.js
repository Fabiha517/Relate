import { useState, useCallback } from 'react'

import * as analogyApi from '../api/analogy.api'
import * as guestSession from '../utils/guestSession'

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalizeError(err, fallbackMessage) {
  const status = err?.response?.status
  const errorCode = err?.response?.data?.error?.code

  const errorMessage =
    err?.response?.data?.error?.message ||
    err?.message ||
    fallbackMessage

  return {
    code: errorCode || 'REQUEST_FAILED',
    message: errorMessage,
    status,
    dismissible: true,
  }
}

export function useAnalogy() {
  const [analogy, setAnalogy] = useState(null)
  const [loading, setLoading] = useState(false)
  const [modifying, setModifying] = useState(false)
  const [error, setError] = useState(null)

  /**
   * Generate a new analogy.
   *
   * Temporary AI failures are retried automatically.
   * A failed attempt never consumes the guest analogy.
   */
  const generate = useCallback(async (concept, analogyWorld) => {
    setLoading(true)
    setError(null)

    const maxAttempts = 3

    try {
      let lastError = null

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          const response = await analogyApi.generateAnalogy({
            concept,
            analogyWorld,
          })

          const generatedAnalogy =
            response?.analogy || response

          const completeAnalogy = {
            ...generatedAnalogy,
            concept,
            analogyWorld,
          }

          setAnalogy(completeAnalogy)
          guestSession.set(completeAnalogy)

          return completeAnalogy
        } catch (err) {
          lastError = err

          const status = err?.response?.status
          const errorCode =
            err?.response?.data?.error?.code

          const retryable =
            status === 503 ||
            errorCode === 'AI_FAILURE' ||
            !status

          if (!retryable || attempt === maxAttempts) {
            throw err
          }

          // Small delay between attempts.
          await sleep(700 * attempt)
        }
      }

      throw lastError
    } catch (err) {
      const status = err?.response?.status
      const errorCode =
        err?.response?.data?.error?.code

      const errorMessage =
        err?.response?.data?.error?.message ||
        err?.message

      let errorObj = {
        code: errorCode,
        message: errorMessage,
        status,
      }

      if (
        errorCode === 'MEANINGFULNESS_REJECTED' ||
        status === 400
      ) {
        errorObj = {
          code: 'MEANINGFULNESS_REJECTED',
          message:
            errorMessage ||
            'Please provide a meaningful concept, question, explanation, or topic.',
          status: 400,
          field: 'concept',
        }
      } else if (
        errorCode === 'GUEST_LIMIT_REACHED' ||
        status === 403
      ) {
        errorObj = {
          code: 'GUEST_LIMIT_REACHED',
          message:
            errorMessage ||
            'You have used your free analogy. Create an account to generate more.',
          status: 403,
          inline: true,
          showAuthLinks: true,
        }
      } else if (
        errorCode === 'AI_FAILURE' ||
        status === 503
      ) {
        errorObj = {
          code: 'AI_FAILURE',
          message:
            errorMessage ||
            'Failed to generate analogy. Please try again.',
          status: 503,
          dismissible: true,
        }
      }

      setError(errorObj)
      throw errorObj
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Modify the currently displayed analogy.
   *
   * If analogyId exists:
   *   use the saved analogy endpoint.
   *
   * If analogyId does not exist:
   *   send the current analogy JSON directly.
   *
   * This allows Simplify / More Detail / Regenerate /
   * Switch World to work before the analogy is saved.
   */
  const modify = useCallback(
    async (
      analogyId,
      modificationType,
      params = {}
    ) => {
      setModifying(true)
      setError(null)

      try {
        const currentAnalogy =
          params.currentAnalogy || analogy

        if (!currentAnalogy) {
          throw new Error(
            'There is no analogy available to modify.'
          )
        }

        const modifyParams = {
          modificationType,
          currentNodeCount:
            currentAnalogy?.nodes?.length || 0,
          currentAnalogy,
          ...params,
        }

        delete modifyParams.currentAnalogy

        let response

        if (analogyId) {
          response =
            await analogyApi.modifyAnalogy(
              analogyId,
              modifyParams
            )
        } else {
          response =
            await analogyApi.modifyUnsavedAnalogy({
              modificationType,
              currentAnalogy,
              currentNodeCount:
                currentAnalogy?.nodes?.length || 0,
              ...params,
            })
        }

        const updatedAnalogy =
          response?.analogy || response

        const completeAnalogy = {
          ...updatedAnalogy,

          concept:
            updatedAnalogy?.concept ||
            currentAnalogy?.concept ||
            '',

          analogyWorld:
            updatedAnalogy?.analogyWorld ||
            params?.analogyWorld ||
            currentAnalogy?.analogyWorld ||
            '',
        }

        setAnalogy(completeAnalogy)

        guestSession.set(completeAnalogy)

        return completeAnalogy
      } catch (err) {
        const errorObj = normalizeError(
          err,
          'Failed to modify analogy. Please try again.'
        )

        setError(errorObj)

        throw errorObj
      } finally {
        setModifying(false)
      }
    },
    [analogy]
  )

  const save = useCallback(
    async (analogyData) => {
      setLoading(true)
      setError(null)

      try {
        const response =
          await analogyApi.saveAnalogy(analogyData)

        const savedAnalogy =
          response?.analogy || response

        setAnalogy({
          ...analogy,
          ...savedAnalogy,
          id: savedAnalogy.id,
          createdAt: savedAnalogy.createdAt,
        })

        guestSession.clear()

        return savedAnalogy
      } catch (err) {
        const errorObj = {
          ...normalizeError(
            err,
            'Failed to save analogy. Please try again.'
          ),
          code:
            err?.response?.data?.error?.code ||
            'SAVE_FAILED',
          fields:
            err?.response?.data?.error?.fields,
          showRetry: true,
        }

        console.error(
          'Save API error:',
          err?.response?.data
        )

        setError(errorObj)

        throw errorObj
      } finally {
        setLoading(false)
      }
    },
    [analogy]
  )

  const update = useCallback(
    async (analogyId, analogyData) => {
      setLoading(true)
      setError(null)

      try {
        const response =
          await analogyApi.updateAnalogy(
            analogyId,
            analogyData
          )

        const updatedAnalogy =
          response?.analogy || response

        setAnalogy((prev) => ({
          ...prev,
          ...updatedAnalogy,
        }))

        return updatedAnalogy
      } catch (err) {
        const errorObj = {
          ...normalizeError(
            err,
            'Failed to update analogy. Please try again.'
          ),
          code:
            err?.response?.data?.error?.code ||
            'UPDATE_FAILED',
          fields:
            err?.response?.data?.error?.fields,
          showRetry: true,
        }

        setError(errorObj)

        throw errorObj
      } finally {
        setLoading(false)
      }
    },
    []
  )

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
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAnalogy } from './useAnalogy'
import * as analogyApi from '../api/analogy.api'
import * as guestSession from '../utils/guestSession'

// Mock the APIs
vi.mock('../api/analogy.api')
vi.mock('../utils/guestSession')

describe('useAnalogy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should initialize with null analogy and no error', () => {
      const { result } = renderHook(() => useAnalogy())

      expect(result.current.analogy).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.modifying).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should have all action methods', () => {
      const { result } = renderHook(() => useAnalogy())

      expect(typeof result.current.generate).toBe('function')
      expect(typeof result.current.modify).toBe('function')
      expect(typeof result.current.save).toBe('function')
      expect(typeof result.current.update).toBe('function')
      expect(typeof result.current.clearError).toBe('function')
    })
  })

  describe('generate action', () => {
    it('should call API and set analogy on success', async () => {
      const mockAnalogy = {
        analogyTitle: 'Test Analogy',
        nodes: [{ id: '1', conceptLabel: 'A', analogyLabel: 'B' }],
        relationships: [],
        explanation: 'Test explanation',
        limitations: ['Limitation 1'],
      }

      analogyApi.generateAnalogy.mockResolvedValueOnce({ analogy: mockAnalogy })
      guestSession.set.mockImplementation(() => {})

      const { result } = renderHook(() => useAnalogy())

      let generatedAnalogy
      await act(async () => {
        generatedAnalogy = await result.current.generate('Test concept', 'Kitchen')
      })

      expect(result.current.analogy).toEqual(mockAnalogy)
      expect(result.current.error).toBeNull()
      expect(analogyApi.generateAnalogy).toHaveBeenCalledWith({
        concept: 'Test concept',
        analogyWorld: 'Kitchen',
      })
      expect(guestSession.set).toHaveBeenCalledWith(mockAnalogy)
    })

    it('should handle MEANINGFULNESS_REJECTED error (400)', async () => {
      const error = {
        response: {
          status: 400,
          data: {
            error: {
              code: 'MEANINGFULNESS_REJECTED',
              message: 'Please provide a meaningful concept.',
            },
          },
        },
      }

      analogyApi.generateAnalogy.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useAnalogy())

      await act(async () => {
        try {
          await result.current.generate('xyz', 'Kitchen')
        } catch (err) {
          // Expected to throw
        }
      })

      expect(result.current.error).not.toBeNull()
      expect(result.current.error.code).toBe('MEANINGFULNESS_REJECTED')
      expect(result.current.error.field).toBe('concept')
      expect(result.current.error.status).toBe(400)
    })

    it('should handle AI_FAILURE error (503)', async () => {
      const error = {
        response: {
          status: 503,
          data: {
            error: {
              code: 'AI_FAILURE',
              message: 'Failed to generate analogy.',
            },
          },
        },
      }

      analogyApi.generateAnalogy.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useAnalogy())

      await act(async () => {
        try {
          await result.current.generate('Test', 'Kitchen')
        } catch (err) {
          // Expected to throw
        }
      })

      expect(result.current.error).not.toBeNull()
      expect(result.current.error.code).toBe('AI_FAILURE')
      expect(result.current.error.dismissible).toBe(true)
      expect(result.current.error.status).toBe(503)
    })

    it('should handle GUEST_LIMIT_REACHED error (403)', async () => {
      const error = {
        response: {
          status: 403,
          data: {
            error: {
              code: 'GUEST_LIMIT_REACHED',
              message: 'You have used your free analogy.',
            },
          },
        },
      }

      analogyApi.generateAnalogy.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useAnalogy())

      await act(async () => {
        try {
          await result.current.generate('Test', 'Kitchen')
        } catch (err) {
          // Expected to throw
        }
      })

      expect(result.current.error).not.toBeNull()
      expect(result.current.error.code).toBe('GUEST_LIMIT_REACHED')
      expect(result.current.error.showAuthLinks).toBe(true)
      expect(result.current.error.status).toBe(403)
    })

    it('should set loading state to false after generation completes', async () => {
      analogyApi.generateAnalogy.mockResolvedValueOnce({
        analogy: { analogyTitle: 'Test' },
      })
      guestSession.set.mockImplementation(() => {})

      const { result } = renderHook(() => useAnalogy())

      expect(result.current.loading).toBe(false)

      await act(async () => {
        await result.current.generate('Test', 'Kitchen')
      })

      expect(result.current.loading).toBe(false)
    })
  })

  describe('clearError action', () => {
    it('should clear error state', async () => {
      const error = {
        response: {
          status: 400,
          data: {
            error: {
              code: 'MEANINGFULNESS_REJECTED',
              message: 'Invalid concept.',
            },
          },
        },
      }

      analogyApi.generateAnalogy.mockRejectedValueOnce(error)

      const { result } = renderHook(() => useAnalogy())

      await act(async () => {
        try {
          await result.current.generate('xyz', 'Kitchen')
        } catch (err) {
          // Expected
        }
      })

      expect(result.current.error).not.toBeNull()

      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe('save action', () => {
    it('should call API and clear guest session on success', async () => {
      const mockAnalogy = {
        id: 'analogy-123',
        analogyTitle: 'Test',
        nodes: [],
        mappings: [],
        relationships: [],
        explanation: 'Test',
        limitations: ['L1'],
        createdAt: '2024-01-01T00:00:00Z',
      }

      analogyApi.saveAnalogy.mockResolvedValueOnce({ analogy: mockAnalogy })
      guestSession.clear.mockImplementation(() => {})

      const { result } = renderHook(() => useAnalogy())

      // Set up existing analogy
      act(() => {
        result.current.analogy = { ...mockAnalogy }
      })

      await act(async () => {
        await result.current.save(mockAnalogy)
      })

      expect(analogyApi.saveAnalogy).toHaveBeenCalledWith(mockAnalogy)
      expect(guestSession.clear).toHaveBeenCalled()
    })
  })
})

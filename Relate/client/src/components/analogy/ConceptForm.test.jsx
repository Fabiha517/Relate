import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import ConceptForm from './ConceptForm'

describe('ConceptForm', () => {
  const mockOnChange = vi.fn()
  const mockOnSubmit = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('character validation', () => {
    it('should display character counter', () => {
      render(
        <ConceptForm
          value="Hello"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />
      )

      expect(screen.getByText(/5 \/ 5000/)).toBeInTheDocument()
    })

    it('should disable submit button when concept is empty', () => {
      render(
        <ConceptForm
          value=""
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />
      )

      const submitButton = screen.getByRole('button', { name: /next/i })
      expect(submitButton).toBeDisabled()
    })

    it('should disable submit button when concept exceeds 5000 characters', () => {
      const longConcept = 'a'.repeat(5001)

      render(
        <ConceptForm
          value={longConcept}
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />
      )

      const submitButton = screen.getByRole('button', { name: /next/i })
      expect(submitButton).toBeDisabled()
    })
  })

  describe('form submission', () => {
    it('should call onSubmit with concept value on valid submission', async () => {
      const user = userEvent.setup()
      const testConcept = 'What is photosynthesis?'

      render(
        <ConceptForm
          value={testConcept}
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />
      )

      const submitButton = screen.getByRole('button', { name: /next/i })
      await user.click(submitButton)

      expect(mockOnSubmit).toHaveBeenCalledWith(testConcept)
    })

    it('should not call onSubmit when concept is empty', async () => {
      const user = userEvent.setup()

      render(
        <ConceptForm
          value=""
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />
      )

      const submitButton = screen.getByRole('button', { name: /next/i })
      await user.click(submitButton)

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('should not call onSubmit when concept exceeds max length', async () => {
      const user = userEvent.setup()
      const longConcept = 'a'.repeat(5001)

      render(
        <ConceptForm
          value={longConcept}
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />
      )

      const submitButton = screen.getByRole('button', { name: /next/i })
      await user.click(submitButton)

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })
  })

  describe('text input handling', () => {
    it('should have textarea element', () => {
      render(
        <ConceptForm
          value=""
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />
      )

      expect(screen.getByPlaceholderText(/e.g., How does photosynthesis/i)).toBeInTheDocument()
    })

    it('should call onChange when user types', async () => {
      const user = userEvent.setup()
      render(
        <ConceptForm
          value=""
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
        />
      )

      const textarea = screen.getByPlaceholderText(/e.g., How does photosynthesis/i)
      await user.type(textarea, 'Test concept')

      expect(mockOnChange).toHaveBeenCalled()
    })
  })

  describe('button state', () => {
    it('should disable next button when loading', () => {
      render(
        <ConceptForm
          value="Test"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          loading={true}
        />
      )

      const submitButton = screen.getByRole('button', { name: /generating/i })
      expect(submitButton).toBeDisabled()
    })

    it('should show "Generating..." text when loading', () => {
      render(
        <ConceptForm
          value="Test"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          loading={true}
        />
      )

      expect(screen.getByText('Generating...')).toBeInTheDocument()
    })

    it('should show "Next →" text when not loading', () => {
      render(
        <ConceptForm
          value="Test"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          loading={false}
        />
      )

      expect(screen.getByText('Next →')).toBeInTheDocument()
    })
  })

  describe('error display', () => {
    it('should display external error on concept field', () => {
      const error = {
        field: 'concept',
        message: 'This concept is too vague.',
      }

      render(
        <ConceptForm
          value="xyz"
          onChange={mockOnChange}
          onSubmit={mockOnSubmit}
          error={error}
        />
      )

      expect(screen.getByText('This concept is too vague.')).toBeInTheDocument()
    })
  })
})

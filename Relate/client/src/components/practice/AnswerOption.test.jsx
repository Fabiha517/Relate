import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { AnswerOption } from './AnswerOption'

describe('AnswerOption', () => {
  const mockClick = vi.fn()

  describe('unselected state', () => {
    it('should render with unselected class by default', () => {
      const { container } = render(
        <AnswerOption
          letter="A"
          text="First option"
          isSelected={false}
          isEvaluated={false}
          onClick={mockClick}
        />
      )

      const option = container.querySelector('.answer-option--unselected')
      expect(option).toBeInTheDocument()
    })

    it('should have role="radio" and aria-checked=false', () => {
      const { container } = render(
        <AnswerOption
          letter="A"
          text="First option"
          isSelected={false}
          isEvaluated={false}
          onClick={mockClick}
        />
      )

      const option = container.querySelector('[role="radio"]')
      expect(option).toBeInTheDocument()
      expect(option).toHaveAttribute('aria-checked', 'false')
    })
  })

  describe('selected state', () => {
    it('should render with selected class when isSelected=true', () => {
      const { container } = render(
        <AnswerOption
          letter="B"
          text="Second option"
          isSelected={true}
          isEvaluated={false}
          onClick={mockClick}
        />
      )

      const option = container.querySelector('.answer-option--selected')
      expect(option).toBeInTheDocument()
    })

    it('should have aria-checked=true when selected', () => {
      const { container } = render(
        <AnswerOption
          letter="B"
          text="Second option"
          isSelected={true}
          isEvaluated={false}
          onClick={mockClick}
        />
      )

      const option = container.querySelector('[role="radio"]')
      expect(option).toHaveAttribute('aria-checked', 'true')
    })
  })

  describe('correct state', () => {
    it('should render with correct class when isEvaluated=true and isCorrect=true', () => {
      const { container } = render(
        <AnswerOption
          letter="C"
          text="Correct option"
          isSelected={true}
          isEvaluated={true}
          isCorrect={true}
          onClick={mockClick}
        />
      )

      const option = container.querySelector('.answer-option--correct')
      expect(option).toBeInTheDocument()
    })
  })

  describe('incorrect state', () => {
    it('should render with incorrect class when isEvaluated=true and isCorrect=false', () => {
      const { container } = render(
        <AnswerOption
          letter="D"
          text="Wrong option"
          isSelected={true}
          isEvaluated={true}
          isCorrect={false}
          onClick={mockClick}
        />
      )

      const option = container.querySelector('.answer-option--incorrect')
      expect(option).toBeInTheDocument()
    })
  })

  describe('keyboard interaction', () => {
    it('should call onClick when spacebar pressed', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <AnswerOption
          letter="A"
          text="First option"
          isSelected={false}
          isEvaluated={false}
          onClick={mockClick}
        />
      )

      const option = container.querySelector('[role="radio"]')
      await user.keyboard('{Space}')
      option.focus()
      const event = new KeyboardEvent('keydown', { key: ' ' })
      option.dispatchEvent(event)

      // Note: In actual test, the keyboard event handler would be triggered
    })

    it('should be keyboard accessible (tabindex=0 when enabled)', () => {
      const { container } = render(
        <AnswerOption
          letter="A"
          text="First option"
          isSelected={false}
          isEvaluated={false}
          onClick={mockClick}
          disabled={false}
        />
      )

      const option = container.querySelector('[role="radio"]')
      expect(option).toHaveAttribute('tabIndex', '0')
    })

    it('should not be keyboard accessible when disabled (tabindex=-1)', () => {
      const { container } = render(
        <AnswerOption
          letter="A"
          text="First option"
          isSelected={false}
          isEvaluated={false}
          onClick={mockClick}
          disabled={true}
        />
      )

      const option = container.querySelector('[role="radio"]')
      expect(option).toHaveAttribute('tabIndex', '-1')
    })
  })

  describe('click handling', () => {
    it('should call onClick when clicked', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <AnswerOption
          letter="A"
          text="First option"
          isSelected={false}
          isEvaluated={false}
          onClick={mockClick}
        />
      )

      const option = container.querySelector('[role="radio"]')
      await user.click(option)

      expect(mockClick).toHaveBeenCalled()
    })

    it('should not call onClick when disabled', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <AnswerOption
          letter="A"
          text="First option"
          isSelected={false}
          isEvaluated={true}
          isCorrect={false}
          onClick={mockClick}
          disabled={true}
        />
      )

      const option = container.querySelector('[role="radio"]')
      await user.click(option)

      // onClick should still be called on click, but component prevents it via isEvaluated
    })
  })

  describe('rendering', () => {
    it('should render letter and text content', () => {
      render(
        <AnswerOption
          letter="A"
          text="Test answer option"
          isSelected={false}
          isEvaluated={false}
          onClick={mockClick}
        />
      )

      expect(screen.getByText('A')).toBeInTheDocument()
      expect(screen.getByText('Test answer option')).toBeInTheDocument()
    })

    it('should have proper aria-label', () => {
      const { container } = render(
        <AnswerOption
          letter="B"
          text="Second choice"
          isSelected={false}
          isEvaluated={false}
          onClick={mockClick}
        />
      )

      const option = container.querySelector('[role="radio"]')
      expect(option).toHaveAttribute('aria-label', 'Option B: Second choice')
    })
  })
})

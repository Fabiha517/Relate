import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { ExplanationDropdown } from './ExplanationDropdown'

describe('ExplanationDropdown', () => {
  describe('initial state', () => {
    it('should render with collapsed state (aria-expanded=false)', () => {
      const { container } = render(
        <ExplanationDropdown
          isCorrect={true}
          explanation="This is correct because..."
          mappingLabel="Test Mapping"
        />
      )

      const summary = container.querySelector('.explanation-dropdown__trigger')
      expect(summary).toHaveAttribute('aria-expanded', 'false')
    })

    it('should show trigger text "▾ See explanation"', () => {
      render(
        <ExplanationDropdown
          isCorrect={true}
          explanation="This is correct because..."
          mappingLabel="Test Mapping"
        />
      )

      expect(screen.getByText('▾ See explanation')).toBeInTheDocument()
    })

    it('should not display content when closed', () => {
      const { container } = render(
        <ExplanationDropdown
          isCorrect={true}
          explanation="This is correct because..."
          mappingLabel="Test Mapping"
        />
      )

      // Details element starts closed
      const details = container.querySelector('.explanation-dropdown')
      expect(details).not.toHaveAttribute('open')
    })
  })

  describe('correct answer feedback', () => {
    it('should display explanation for correct answers', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <ExplanationDropdown
          isCorrect={true}
          explanation="Well done!"
          mappingLabel="Correct Mapping"
        />
      )

      const summary = container.querySelector('.explanation-dropdown__trigger')
      await user.click(summary)

      expect(screen.getByText('Well done!')).toBeInTheDocument()
    })

    it('should not show "Correct answer:" label for correct answers', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <ExplanationDropdown
          isCorrect={true}
          correctAnswer="The answer"
          explanation="This is correct because..."
          mappingLabel="Test Mapping"
        />
      )

      const summary = container.querySelector('.explanation-dropdown__trigger')
      await user.click(summary)

      // Should not have the "Correct answer:" label for correct answers
      const correctAnswerLabel = screen.queryByText('Correct answer:')
      expect(correctAnswerLabel).not.toBeInTheDocument()
    })

    it('should display mapping reference for correct answers', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <ExplanationDropdown
          isCorrect={true}
          explanation="This is correct..."
          mappingLabel="API → Restaurant"
        />
      )

      const summary = container.querySelector('.explanation-dropdown__trigger')
      await user.click(summary)

      expect(screen.getByText('API → Restaurant')).toBeInTheDocument()
    })
  })

  describe('incorrect answer feedback', () => {
    it('should display correct answer for incorrect answers', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <ExplanationDropdown
          isCorrect={false}
          correctAnswer="The correct answer"
          explanation="Here is why..."
          mappingLabel="Test Mapping"
        />
      )

      const summary = container.querySelector('.explanation-dropdown__trigger')
      await user.click(summary)

      expect(screen.getByText('Correct answer:')).toBeInTheDocument()
      expect(screen.getByText('The correct answer')).toBeInTheDocument()
    })

    it('should show "Why:" label for incorrect answers', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <ExplanationDropdown
          isCorrect={false}
          correctAnswer="The answer"
          explanation="Because of this..."
          mappingLabel="Test Mapping"
        />
      )

      const summary = container.querySelector('.explanation-dropdown__trigger')
      await user.click(summary)

      expect(screen.getByText('Why:')).toBeInTheDocument()
    })

    it('should display encouragement message for incorrect answers', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <ExplanationDropdown
          isCorrect={false}
          correctAnswer="The answer"
          explanation="Here is why..."
          mappingLabel="Test Mapping"
          encouragement="Great effort! Keep practicing."
        />
      )

      const summary = container.querySelector('.explanation-dropdown__trigger')
      await user.click(summary)

      expect(screen.getByText('Great effort! Keep practicing.')).toBeInTheDocument()
    })
  })

  describe('expand/collapse behavior', () => {
    it('should toggle aria-expanded when clicked', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <ExplanationDropdown
          isCorrect={true}
          explanation="Explanation..."
          mappingLabel="Mapping"
        />
      )

      const summary = container.querySelector('.explanation-dropdown__trigger')
      expect(summary).toHaveAttribute('aria-expanded', 'false')

      await user.click(summary)
      expect(summary).toHaveAttribute('aria-expanded', 'true')

      await user.click(summary)
      expect(summary).toHaveAttribute('aria-expanded', 'false')
    })

    it('should display content when expanded', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <ExplanationDropdown
          isCorrect={true}
          explanation="This explains it all..."
          mappingLabel="Mapping Label"
        />
      )

      const summary = container.querySelector('.explanation-dropdown__trigger')
      await user.click(summary)

      expect(screen.getByText('This explains it all...')).toBeInTheDocument()
    })
  })

  describe('mapping reference rendering', () => {
    it('should render mapping reference when provided', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <ExplanationDropdown
          isCorrect={true}
          explanation="Explanation..."
          mappingLabel="Database → Library"
        />
      )

      const summary = container.querySelector('.explanation-dropdown__trigger')
      await user.click(summary)

      expect(screen.getByText('Database → Library')).toBeInTheDocument()
    })

    it('should not render mapping reference when not provided', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <ExplanationDropdown
          isCorrect={true}
          explanation="Explanation..."
        />
      )

      const summary = container.querySelector('.explanation-dropdown__trigger')
      await user.click(summary)

      // Should still have content, but no mapping reference
      expect(screen.getByText('Explanation...')).toBeInTheDocument()
    })
  })

  describe('full feedback scenarios', () => {
    it('should show complete correct feedback', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <ExplanationDropdown
          isCorrect={true}
          explanation="Your answer demonstrates understanding of the key concept."
          mappingLabel="Frontend → Restaurant"
        />
      )

      const summary = container.querySelector('.explanation-dropdown__trigger')
      await user.click(summary)

      expect(screen.getByText('Your answer demonstrates understanding of the key concept.')).toBeInTheDocument()
      expect(screen.getByText('Frontend → Restaurant')).toBeInTheDocument()
    })

    it('should show complete incorrect feedback', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <ExplanationDropdown
          isCorrect={false}
          correctAnswer="Database transactions"
          explanation="A transaction is a sequence of operations treated as a single unit."
          mappingLabel="ACID → Restaurant Order Process"
          encouragement="Close! You're thinking about the right concept."
        />
      )

      const summary = container.querySelector('.explanation-dropdown__trigger')
      await user.click(summary)

      expect(screen.getByText('Correct answer:')).toBeInTheDocument()
      expect(screen.getByText('Database transactions')).toBeInTheDocument()
      expect(screen.getByText('A transaction is a sequence of operations treated as a single unit.')).toBeInTheDocument()
      expect(screen.getByText('ACID → Restaurant Order Process')).toBeInTheDocument()
      expect(screen.getByText('Close! You\'re thinking about the right concept.')).toBeInTheDocument()
    })
  })
})

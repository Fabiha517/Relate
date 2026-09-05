import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { EvaluationFeedback } from './EvaluationFeedback'

describe('EvaluationFeedback', () => {
  describe('correct answer feedback', () => {
    it('should render with correct class when isCorrect=true', () => {
      const { container } = render(
        <EvaluationFeedback
          isCorrect={true}
          userAnswer="Paris"
          correctAnswer="Paris"
          explanation="Paris is indeed the capital."
          mappingLabel="Capital City"
        />
      )

      const feedback = container.querySelector('.evaluation-feedback--correct')
      expect(feedback).toBeInTheDocument()
    })

    it('should display "Correct ✓" text for correct answer', () => {
      render(
        <EvaluationFeedback
          isCorrect={true}
          userAnswer="Paris"
          correctAnswer="Paris"
          explanation="Paris is indeed the capital."
          mappingLabel="Capital City"
        />
      )

      expect(screen.getByText('Correct ✓')).toBeInTheDocument()
    })

    it('should display checkmark icon for correct answer', () => {
      const { container } = render(
        <EvaluationFeedback
          isCorrect={true}
          userAnswer="Paris"
          correctAnswer="Paris"
          explanation="Paris is indeed the capital."
          mappingLabel="Capital City"
        />
      )

      const icon = container.querySelector('.evaluation-feedback__icon--correct')
      expect(icon?.textContent).toBe('✓')
    })

    it('should have collapsed ExplanationDropdown for correct answer', () => {
      const { container } = render(
        <EvaluationFeedback
          isCorrect={true}
          userAnswer="Paris"
          correctAnswer="Paris"
          explanation="Explanation here..."
          mappingLabel="Capital City"
        />
      )

      const summary = container.querySelector('.explanation-dropdown__trigger')
      expect(summary).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('incorrect answer feedback', () => {
    it('should render with incorrect class when isCorrect=false', () => {
      const { container } = render(
        <EvaluationFeedback
          isCorrect={false}
          userAnswer="London"
          correctAnswer="Paris"
          explanation="Paris is the capital, not London."
          mappingLabel="Capital City"
          encouragement="Good try! Think about the location more carefully."
        />
      )

      const feedback = container.querySelector('.evaluation-feedback--incorrect')
      expect(feedback).toBeInTheDocument()
    })

    it('should display "Not quite ✕" text for incorrect answer', () => {
      render(
        <EvaluationFeedback
          isCorrect={false}
          userAnswer="London"
          correctAnswer="Paris"
          explanation="Paris is the capital, not London."
          mappingLabel="Capital City"
        />
      )

      expect(screen.getByText('Not quite ✕')).toBeInTheDocument()
    })

    it('should display cross/error icon for incorrect answer', () => {
      const { container } = render(
        <EvaluationFeedback
          isCorrect={false}
          userAnswer="London"
          correctAnswer="Paris"
          explanation="Paris is the capital, not London."
          mappingLabel="Capital City"
        />
      )

      const icon = container.querySelector('.evaluation-feedback__icon--incorrect')
      expect(icon?.textContent).toBe('✕')
    })

    it('should have collapsed ExplanationDropdown for incorrect answer', () => {
      const { container } = render(
        <EvaluationFeedback
          isCorrect={false}
          userAnswer="London"
          correctAnswer="Paris"
          explanation="Explanation here..."
          mappingLabel="Capital City"
        />
      )

      const summary = container.querySelector('.explanation-dropdown__trigger')
      expect(summary).toHaveAttribute('aria-expanded', 'false')
    })

    it('should show correct answer in dropdown for incorrect answer', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <EvaluationFeedback
          isCorrect={false}
          userAnswer="London"
          correctAnswer="Paris"
          explanation="Paris is the capital."
          mappingLabel="Capital City"
        />
      )

      const summary = container.querySelector('.explanation-dropdown__trigger')
      await user.click(summary)

      expect(screen.getByText('Correct answer:')).toBeInTheDocument()
      expect(screen.getByText('Paris')).toBeInTheDocument()
    })
  })

  describe('short-answer display', () => {
    it('should display user answer for short-answer questions', () => {
      render(
        <EvaluationFeedback
          isCorrect={true}
          userAnswer="Photosynthesis is the process by which plants convert light into chemical energy."
          correctAnswer="Photosynthesis converts light energy into chemical energy."
          explanation="Your answer is correct."
          mappingLabel="Photosynthesis"
          questionType="short-answer"
        />
      )

      expect(screen.getByText('Your answer:')).toBeInTheDocument()
      expect(screen.getByText('Photosynthesis is the process by which plants convert light into chemical energy.')).toBeInTheDocument()
    })

    it('should not display user answer for multiple-choice questions', () => {
      render(
        <EvaluationFeedback
          isCorrect={true}
          userAnswer="Option A"
          correctAnswer="Option A"
          explanation="Your answer is correct."
          mappingLabel="Test"
          questionType="multiple-choice"
        />
      )

      expect(screen.queryByText('Your answer:')).not.toBeInTheDocument()
    })
  })

  describe('explanation content', () => {
    it('should render explanation dropdown with content', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <EvaluationFeedback
          isCorrect={true}
          userAnswer="Correct Answer"
          correctAnswer="Correct Answer"
          explanation="This is a detailed explanation of why this is correct."
          mappingLabel="Test Mapping"
        />
      )

      const summary = container.querySelector('.explanation-dropdown__trigger')
      await user.click(summary)

      expect(screen.getByText('This is a detailed explanation of why this is correct.')).toBeInTheDocument()
    })

    it('should render mapping reference', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <EvaluationFeedback
          isCorrect={true}
          userAnswer="Correct"
          correctAnswer="Correct"
          explanation="Explanation here..."
          mappingLabel="Frontend → Restaurant"
        />
      )

      const summary = container.querySelector('.explanation-dropdown__trigger')
      await user.click(summary)

      expect(screen.getByText('Frontend → Restaurant')).toBeInTheDocument()
    })

    it('should render encouragement for incorrect answers', async () => {
      const user = userEvent.setup()
      const { container } = render(
        <EvaluationFeedback
          isCorrect={false}
          userAnswer="Incorrect"
          correctAnswer="Correct"
          explanation="Here's why..."
          mappingLabel="Test"
          encouragement="Don't worry, you're on the right track!"
        />
      )

      const summary = container.querySelector('.explanation-dropdown__trigger')
      await user.click(summary)

      expect(screen.getByText('Don\'t worry, you\'re on the right track!')).toBeInTheDocument()
    })
  })

  describe('visual treatment via className', () => {
    it('should apply correct class styling to correct feedback', () => {
      const { container } = render(
        <EvaluationFeedback
          isCorrect={true}
          userAnswer="Paris"
          correctAnswer="Paris"
          explanation="Correct."
          mappingLabel="Test"
        />
      )

      const feedback = container.querySelector('.evaluation-feedback')
      expect(feedback).toHaveClass('evaluation-feedback--correct')
      expect(feedback).not.toHaveClass('evaluation-feedback--incorrect')
    })

    it('should apply incorrect class styling to incorrect feedback', () => {
      const { container } = render(
        <EvaluationFeedback
          isCorrect={false}
          userAnswer="London"
          correctAnswer="Paris"
          explanation="Incorrect."
          mappingLabel="Test"
        />
      )

      const feedback = container.querySelector('.evaluation-feedback')
      expect(feedback).toHaveClass('evaluation-feedback--incorrect')
      expect(feedback).not.toHaveClass('evaluation-feedback--correct')
    })
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import GuestPrompt from './GuestPrompt'

// Wrap component with BrowserRouter for routing
const GuestPromptWithRouter = (props) => (
  <BrowserRouter>
    <GuestPrompt {...props} />
  </BrowserRouter>
)

describe('GuestPrompt', () => {
  const mockOnDismiss = vi.fn()
  const mockOnConceptFormDisable = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders prompt with heading', () => {
    render(
      <GuestPromptWithRouter
        onDismiss={mockOnDismiss}
        onConceptFormDisable={mockOnConceptFormDisable}
      />,
    )

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(/Ready to save your progress/)
  })

  it('renders all three action buttons', () => {
    render(
      <GuestPromptWithRouter
        onDismiss={mockOnDismiss}
        onConceptFormDisable={mockOnConceptFormDisable}
      />,
    )

    expect(screen.getByText('Create Account')).toBeInTheDocument()
    expect(screen.getByText('Log In')).toBeInTheDocument()
    expect(screen.getByText('Dismiss')).toBeInTheDocument()
  })

  it('calls onDismiss and onConceptFormDisable when Dismiss clicked', () => {
    render(
      <GuestPromptWithRouter
        onDismiss={mockOnDismiss}
        onConceptFormDisable={mockOnConceptFormDisable}
      />,
    )

    fireEvent.click(screen.getByText('Dismiss'))

    expect(mockOnDismiss).toHaveBeenCalled()
    expect(mockOnConceptFormDisable).toHaveBeenCalled()
  })

  it('renders descriptive message about account benefits', () => {
    render(
      <GuestPromptWithRouter
        onDismiss={mockOnDismiss}
        onConceptFormDisable={mockOnConceptFormDisable}
      />,
    )

    expect(
      screen.getByText(/Create an account to save this analogy, practice your understanding/),
    ).toBeInTheDocument()
  })

  it('renders in a content container', () => {
    const { container } = render(
      <GuestPromptWithRouter
        onDismiss={mockOnDismiss}
        onConceptFormDisable={mockOnConceptFormDisable}
      />,
    )

    expect(container.querySelector('.guest-prompt')).toBeInTheDocument()
    expect(container.querySelector('.guest-prompt-content')).toBeInTheDocument()
  })

  it('renders action buttons in actions container', () => {
    const { container } = render(
      <GuestPromptWithRouter
        onDismiss={mockOnDismiss}
        onConceptFormDisable={mockOnConceptFormDisable}
      />,
    )

    expect(container.querySelector('.guest-prompt-actions')).toBeInTheDocument()
  })
})

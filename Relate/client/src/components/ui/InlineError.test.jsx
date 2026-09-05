import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import InlineError from './InlineError'

describe('InlineError', () => {
  it('renders error message when provided', () => {
    const message = 'Please provide a meaningful concept'
    render(<InlineError message={message} />)

    expect(screen.getByText(message)).toBeInTheDocument()
  })

  it('returns null when message is not provided', () => {
    const { container } = render(<InlineError />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when message is empty string', () => {
    const { container } = render(<InlineError message="" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders with proper alert role for accessibility', () => {
    render(<InlineError message="Error occurred" />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('shows Try again button when showRetry is true', () => {
    const mockRetry = vi.fn()
    render(<InlineError message="Error" showRetry={true} onRetry={mockRetry} />)

    expect(screen.getByText('Try again')).toBeInTheDocument()
  })

  it('does not show Try again button when showRetry is false', () => {
    render(<InlineError message="Error" showRetry={false} />)

    expect(screen.queryByText('Try again')).not.toBeInTheDocument()
  })

  it('calls onRetry when Try again button clicked', () => {
    const mockRetry = vi.fn()
    render(<InlineError message="Error" showRetry={true} onRetry={mockRetry} />)

    fireEvent.click(screen.getByText('Try again'))
    expect(mockRetry).toHaveBeenCalled()
  })

  it('shows close button when onDismiss provided', () => {
    const mockDismiss = vi.fn()
    render(<InlineError message="Error" onDismiss={mockDismiss} />)

    const closeButton = screen.getByText('✕')
    expect(closeButton).toBeInTheDocument()
  })

  it('calls onDismiss when close button clicked', () => {
    const mockDismiss = vi.fn()
    render(<InlineError message="Error" onDismiss={mockDismiss} />)

    fireEvent.click(screen.getByText('✕'))
    expect(mockDismiss).toHaveBeenCalled()
  })

  it('displays error message in proper container structure', () => {
    const { container } = render(<InlineError message="Test error" />)

    expect(container.querySelector('.inline-error')).toBeInTheDocument()
    expect(container.querySelector('.error-content')).toBeInTheDocument()
    expect(container.querySelector('.error-message')).toBeInTheDocument()
  })
})

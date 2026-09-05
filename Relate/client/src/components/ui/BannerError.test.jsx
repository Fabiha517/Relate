import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import BannerError from './BannerError'

describe('BannerError', () => {
  it('renders error message when provided', () => {
    const message = 'Failed to generate analogy. Please try again.'
    render(<BannerError message={message} />)

    expect(screen.getByText(message)).toBeInTheDocument()
  })

  it('does not render when message is not provided', () => {
    const { container } = render(<BannerError />)
    expect(container.querySelector('.banner-error')).not.toBeInTheDocument()
  })

  it('renders with proper alert role for accessibility', () => {
    render(<BannerError message="Error occurred" />)

    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('shows Try again button when onRetry provided', () => {
    const mockRetry = vi.fn()
    render(<BannerError message="Error" onRetry={mockRetry} />)

    expect(screen.getByText('Try again')).toBeInTheDocument()
  })

  it('calls onRetry when Try again button clicked', () => {
    const mockRetry = vi.fn()
    render(<BannerError message="Error" onRetry={mockRetry} />)

    fireEvent.click(screen.getByText('Try again'))
    expect(mockRetry).toHaveBeenCalled()
  })

  it('shows Dismiss button when isDismissible is true', () => {
    render(<BannerError message="Error" isDismissible={true} />)

    expect(screen.getByText('Dismiss')).toBeInTheDocument()
  })

  it('does not show Dismiss button when isDismissible is false', () => {
    render(<BannerError message="Error" isDismissible={false} />)

    expect(screen.queryByText('Dismiss')).not.toBeInTheDocument()
  })

  it('calls onDismiss when Dismiss button clicked', () => {
    const mockDismiss = vi.fn()
    render(<BannerError message="Error" onDismiss={mockDismiss} isDismissible={true} />)

    fireEvent.click(screen.getByText('Dismiss'))
    expect(mockDismiss).toHaveBeenCalled()
  })

  it('hides banner when dismissed', () => {
    const mockDismiss = vi.fn()
    const { rerender } = render(
      <BannerError message="Error" onDismiss={mockDismiss} isDismissible={true} />,
    )

    fireEvent.click(screen.getByText('Dismiss'))

    rerender(<BannerError message={null} isDismissible={true} />)
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('displays error text in proper container structure', () => {
    const { container } = render(<BannerError message="Test error" />)

    expect(container.querySelector('.banner-error')).toBeInTheDocument()
    expect(container.querySelector('.banner-content')).toBeInTheDocument()
    expect(container.querySelector('.error-text')).toBeInTheDocument()
  })

  it('shows banner-actions container with buttons', () => {
    const { container } = render(
      <BannerError message="Error" onRetry={() => {}} isDismissible={true} />,
    )

    expect(container.querySelector('.banner-actions')).toBeInTheDocument()
  })
})

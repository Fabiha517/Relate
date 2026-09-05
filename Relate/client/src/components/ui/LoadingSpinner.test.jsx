import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import LoadingSpinner from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('renders with status role', () => {
    render(<LoadingSpinner />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('renders default aria-label when not provided', () => {
    render(<LoadingSpinner />)

    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading...')
  })

  it('renders custom aria-label when provided', () => {
    render(<LoadingSpinner ariaLabel="Generating analogy..." />)

    expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Generating analogy...')
  })

  it('renders spinner with correct size class for default', () => {
    const { container } = render(<LoadingSpinner />)

    expect(container.querySelector('.spinner-medium')).toBeInTheDocument()
  })

  it('renders spinner with correct size class for small', () => {
    const { container } = render(<LoadingSpinner size="small" />)

    expect(container.querySelector('.spinner-small')).toBeInTheDocument()
  })

  it('renders spinner with correct size class for large', () => {
    const { container } = render(<LoadingSpinner size="large" />)

    expect(container.querySelector('.spinner-large')).toBeInTheDocument()
  })

  it('renders spinner ring element', () => {
    const { container } = render(<LoadingSpinner />)

    expect(container.querySelector('.spinner-ring')).toBeInTheDocument()
  })

  it('renders spinner text with aria-label', () => {
    const { container } = render(<LoadingSpinner ariaLabel="Please wait..." />)

    expect(container.querySelector('.spinner-text')).toHaveTextContent('Please wait...')
  })

  it('renders loading-spinner class', () => {
    const { container } = render(<LoadingSpinner />)

    expect(container.querySelector('.loading-spinner')).toBeInTheDocument()
  })
})

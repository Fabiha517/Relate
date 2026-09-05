import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import EmptyState from './EmptyState'

describe('EmptyState', () => {
  it('renders default title when not provided', () => {
    render(<EmptyState />)

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Nothing here yet')
  })

  it('renders custom title when provided', () => {
    render(<EmptyState title="No analogies saved" />)

    expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('No analogies saved')
  })

  it('renders default message when not provided', () => {
    render(<EmptyState />)

    expect(screen.getByText('Start by creating something new')).toBeInTheDocument()
  })

  it('renders custom message when provided', () => {
    const message = 'Generate your first analogy to get started'
    render(<EmptyState message={message} />)

    expect(screen.getByText(message)).toBeInTheDocument()
  })

  it('does not render message when message is empty string', () => {
    const { container } = render(<EmptyState message="" />)

    expect(container.querySelector('.empty-state-message')).not.toBeInTheDocument()
  })

  it('renders default action label when not provided', () => {
    const mockAction = vi.fn()
    render(<EmptyState action={mockAction} />)

    expect(screen.getByText('Get started')).toBeInTheDocument()
  })

  it('renders custom action label when provided', () => {
    const mockAction = vi.fn()
    render(<EmptyState action={mockAction} actionLabel="Create Analogy" />)

    expect(screen.getByText('Create Analogy')).toBeInTheDocument()
  })

  it('calls action callback when button clicked', () => {
    const mockAction = vi.fn()
    render(<EmptyState action={mockAction} />)

    fireEvent.click(screen.getByText('Get started'))
    expect(mockAction).toHaveBeenCalled()
  })

  it('does not render button when action not provided', () => {
    render(<EmptyState />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('renders icon when provided', () => {
    const { container } = render(<EmptyState icon={<span data-testid="test-icon">📚</span>} />)

    expect(screen.getByTestId('test-icon')).toBeInTheDocument()
  })

  it('does not render icon container when icon not provided', () => {
    const { container } = render(<EmptyState />)

    expect(container.querySelector('.empty-state-icon')).not.toBeInTheDocument()
  })

  it('renders all elements in correct structure', () => {
    const { container } = render(
      <EmptyState
        title="Empty"
        message="No content"
        action={() => {}}
        actionLabel="Action"
      />,
    )

    expect(container.querySelector('.empty-state')).toBeInTheDocument()
    expect(container.querySelector('.empty-state-content')).toBeInTheDocument()
    expect(container.querySelector('.empty-state-title')).toBeInTheDocument()
    expect(container.querySelector('.empty-state-message')).toBeInTheDocument()
  })
})

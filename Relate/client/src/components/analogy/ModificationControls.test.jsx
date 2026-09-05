import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import ModificationControls from './ModificationControls'

describe('ModificationControls', () => {
  const mockAnalogy = {
    nodes: [{ id: '1', label: 'Node 1' }, { id: '2', label: 'Node 2' }],
    analogyWorld: 'Restaurant',
  }

  const mockOnModify = vi.fn()
  const mockOnError = vi.fn()

  it('renders all four modification buttons', () => {
    render(
      <ModificationControls
        analogy={mockAnalogy}
        onModify={mockOnModify}
        worlds={['Restaurant', 'Sports', 'Movies']}
      />,
    )

    expect(screen.getByText('Simplify')).toBeInTheDocument()
    expect(screen.getByText('More Detail')).toBeInTheDocument()
    expect(screen.getByText('Regenerate')).toBeInTheDocument()
    expect(screen.getByText('Switch World')).toBeInTheDocument()
  })

  it('disables Simplify button when node count is 1', () => {
    const singleNodeAnalogy = { ...mockAnalogy, nodes: [{ id: '1', label: 'Node 1' }] }
    render(
      <ModificationControls
        analogy={singleNodeAnalogy}
        onModify={mockOnModify}
        worlds={['Restaurant']}
      />,
    )

    const simplifyButton = screen.getByText('Simplify')
    expect(simplifyButton).toBeDisabled()
  })

  it('disables More Detail button when node count is 20', () => {
    const maxNodesAnalogy = {
      ...mockAnalogy,
      nodes: Array.from({ length: 20 }, (_, i) => ({ id: `${i}`, label: `Node ${i}` })),
    }
    render(
      <ModificationControls
        analogy={maxNodesAnalogy}
        onModify={mockOnModify}
        worlds={['Restaurant']}
      />,
    )

    const expandButton = screen.getByText('More Detail')
    expect(expandButton).toBeDisabled()
  })

  it('disables all buttons during modification', () => {
    render(
      <ModificationControls
        analogy={mockAnalogy}
        onModify={mockOnModify}
        modifying={true}
        worlds={['Restaurant']}
      />,
    )

    expect(screen.getByText('Simplify')).toBeDisabled()
    expect(screen.getByText('More Detail')).toBeDisabled()
    expect(screen.getByText('Regenerate')).toBeDisabled()
    expect(screen.getByText('Switch World')).toBeDisabled()
  })

  it('calls onModify with simplify type when Simplify clicked', () => {
    render(
      <ModificationControls
        analogy={mockAnalogy}
        onModify={mockOnModify}
        worlds={['Restaurant']}
      />,
    )

    fireEvent.click(screen.getByText('Simplify'))
    expect(mockOnModify).toHaveBeenCalledWith('simplify', {})
  })

  it('calls onModify with expand type when More Detail clicked', () => {
    render(
      <ModificationControls
        analogy={mockAnalogy}
        onModify={mockOnModify}
        worlds={['Restaurant']}
      />,
    )

    fireEvent.click(screen.getByText('More Detail'))
    expect(mockOnModify).toHaveBeenCalledWith('expand', {})
  })

  it('calls onModify with regenerate type when Regenerate clicked', () => {
    render(
      <ModificationControls
        analogy={mockAnalogy}
        onModify={mockOnModify}
        worlds={['Restaurant']}
      />,
    )

    fireEvent.click(screen.getByText('Regenerate'))
    expect(mockOnModify).toHaveBeenCalledWith('regenerate', {})
  })

  it('shows world selector when Switch World clicked', () => {
    render(
      <ModificationControls
        analogy={mockAnalogy}
        onModify={mockOnModify}
        worlds={['Restaurant', 'Sports', 'Movies']}
      />,
    )

    fireEvent.click(screen.getByText('Switch World'))
    expect(screen.getByRole('combobox')).toBeInTheDocument()
  })

  it('displays error message when error provided', () => {
    const error = { message: 'Modification failed', code: 'MODIFICATION_FAILED' }
    render(
      <ModificationControls
        analogy={mockAnalogy}
        onModify={mockOnModify}
        error={error}
        worlds={['Restaurant']}
      />,
    )

    expect(screen.getByText('Modification failed')).toBeInTheDocument()
  })

  it('shows disabled message when Simplify cannot be used', () => {
    const singleNodeAnalogy = { ...mockAnalogy, nodes: [{ id: '1', label: 'Node 1' }] }
    render(
      <ModificationControls
        analogy={singleNodeAnalogy}
        onModify={mockOnModify}
        worlds={['Restaurant']}
      />,
    )

    expect(screen.getByText(/Cannot simplify further/)).toBeInTheDocument()
  })

  it('shows disabled message when More Detail cannot be used', () => {
    const maxNodesAnalogy = {
      ...mockAnalogy,
      nodes: Array.from({ length: 20 }, (_, i) => ({ id: `${i}`, label: `Node ${i}` })),
    }
    render(
      <ModificationControls
        analogy={maxNodesAnalogy}
        onModify={mockOnModify}
        worlds={['Restaurant']}
      />,
    )

    expect(screen.getByText(/Maximum complexity reached/)).toBeInTheDocument()
  })

  it('enables Simplify button when node count > 1', () => {
    render(
      <ModificationControls
        analogy={mockAnalogy}
        onModify={mockOnModify}
        worlds={['Restaurant']}
      />,
    )

    const simplifyButton = screen.getByText('Simplify')
    expect(simplifyButton).not.toBeDisabled()
  })

  it('enables More Detail button when node count < 20', () => {
    render(
      <ModificationControls
        analogy={mockAnalogy}
        onModify={mockOnModify}
        worlds={['Restaurant']}
      />,
    )

    const expandButton = screen.getByText('More Detail')
    expect(expandButton).not.toBeDisabled()
  })
})

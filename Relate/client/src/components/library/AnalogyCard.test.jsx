/** @jsxImportSource react */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import AnalogyCard from './AnalogyCard'

/**
 * AnalogyCard tests - Validates card rendering and navigation
 * Requirements: 9.4, 9.5
 */

const mockAnalogy = {
  _id: '123',
  analogyTitle: 'Understanding APIs',
  concept: 'How does an API work?',
  analogyWorld: 'Restaurant',
  createdAt: '2024-01-15T10:00:00Z',
  analogyNodes: [
    { conceptLabel: 'Client', analogyLabel: 'Customer' },
    { conceptLabel: 'Server', analogyLabel: 'Kitchen' },
    { conceptLabel: 'Request', analogyLabel: 'Order' },
    { conceptLabel: 'Response', analogyLabel: 'Food Delivery' },
  ],
}

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('AnalogyCard', () => {
  it('renders card with title, world badge, and preview', () => {
    renderWithRouter(<AnalogyCard analogy={mockAnalogy} />)
    
    expect(screen.getByText('Understanding APIs')).toBeInTheDocument()
    expect(screen.getByText('Restaurant')).toBeInTheDocument()
    expect(screen.getByText('2024-01-15')).toBeInTheDocument()
  })

  it('displays node preview as text', () => {
    renderWithRouter(<AnalogyCard analogy={mockAnalogy} />)
    
    const preview = screen.getByText(/Client → Customer/)
    expect(preview).toBeInTheDocument()
  })

  it('renders Open and Practice buttons', () => {
    renderWithRouter(<AnalogyCard analogy={mockAnalogy} />)
    
    expect(screen.getByRole('button', { name: 'Open' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Practice' })).toBeInTheDocument()
  })

  it('returns null when analogy is not provided', () => {
    const { container } = renderWithRouter(<AnalogyCard analogy={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('handles analogies with no nodes gracefully', () => {
    const analogyNoNodes = { ...mockAnalogy, analogyNodes: [] }
    renderWithRouter(<AnalogyCard analogy={analogyNoNodes} />)
    
    expect(screen.getByText('Understanding APIs')).toBeInTheDocument()
  })

  it('formats date correctly from ISO string', () => {
    renderWithRouter(<AnalogyCard analogy={mockAnalogy} />)
    
    expect(screen.getByText('2024-01-15')).toBeInTheDocument()
  })
})

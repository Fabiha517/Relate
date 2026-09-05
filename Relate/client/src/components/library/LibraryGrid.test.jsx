/** @jsxImportSource react */
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import LibraryGrid from './LibraryGrid'

/**
 * LibraryGrid tests - Validates grid rendering and empty state
 * Requirements: 9.2, 9.3, 9.4, 9.10
 */

const mockAnalogies = [
  {
    _id: '1',
    analogyTitle: 'APIs',
    concept: 'API fundamentals',
    analogyWorld: 'Restaurant',
    createdAt: '2024-01-15T10:00:00Z',
    analogyNodes: [
      { conceptLabel: 'Client', analogyLabel: 'Customer' },
      { conceptLabel: 'Server', analogyLabel: 'Kitchen' },
    ],
  },
  {
    _id: '2',
    analogyTitle: 'Databases',
    concept: 'How databases work',
    analogyWorld: 'Library',
    createdAt: '2024-01-14T10:00:00Z',
    analogyNodes: [
      { conceptLabel: 'Table', analogyLabel: 'Shelf' },
      { conceptLabel: 'Query', analogyLabel: 'Search' },
    ],
  },
]

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('LibraryGrid', () => {
  it('renders multiple analogy cards', () => {
    renderWithRouter(<LibraryGrid analogies={mockAnalogies} />)
    
    expect(screen.getByText('APIs')).toBeInTheDocument()
    expect(screen.getByText('Databases')).toBeInTheDocument()
  })

  it('shows empty state when no analogies', () => {
    renderWithRouter(<LibraryGrid analogies={[]} />)
    
    expect(screen.getByText('Your library is empty')).toBeInTheDocument()
    expect(screen.getByText('Generate and save your first analogy to get started!')).toBeInTheDocument()
  })

  it('shows empty state when analogies is null', () => {
    renderWithRouter(<LibraryGrid analogies={null} />)
    
    expect(screen.getByText('Your library is empty')).toBeInTheDocument()
  })

  it('displays all cards in grid layout', () => {
    renderWithRouter(<LibraryGrid analogies={mockAnalogies} />)
    
    const cards = screen.getAllByRole('button', { name: 'Open' })
    expect(cards).toHaveLength(2)
  })

  it('handles empty analogies array gracefully', () => {
    const { container } = renderWithRouter(<LibraryGrid analogies={[]} />)
    
    expect(container).toBeInTheDocument()
    expect(screen.getByText('Your library is empty')).toBeInTheDocument()
  })
})

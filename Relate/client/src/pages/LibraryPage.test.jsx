/** @jsxImportSource react */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import LibraryPage from './LibraryPage'
import * as libraryApi from '../api/library.api'
import { AuthContext } from '../context/AuthContext'

// Mock the library API
vi.mock('../api/library.api', () => ({
  getLibrary: vi.fn(),
}))

const mockUser = {
  userId: 'user123',
  email: 'test@example.com',
  name: 'Test User',
}

const mockAnalogies = [
  {
    id: '1',
    analogyTitle: 'Understanding APIs',
    concept: 'How does an API work?',
    analogyWorld: 'Restaurant',
    createdAt: '2024-01-15T10:00:00Z',
    previewNodes: [
      { conceptLabel: 'Client', analogyLabel: 'Customer' },
      { conceptLabel: 'Server', analogyLabel: 'Kitchen' },
    ],
  },
  {
    id: '2',
    analogyTitle: 'Database Normalization',
    concept: 'What is database normalization?',
    analogyWorld: 'Library',
    createdAt: '2024-01-14T10:00:00Z',
    previewNodes: [
      { conceptLabel: 'Data', analogyLabel: 'Books' },
      { conceptLabel: 'Relationships', analogyLabel: 'Catalog' },
    ],
  },
]

const renderWithRouter = (component, contextValue = {}) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider
        value={{
          user: contextValue.user || mockUser,
          loading: contextValue.loading || false,
          ...contextValue,
        }}
      >
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  )
}

describe('LibraryPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page heading and subtitle', async () => {
    libraryApi.getLibrary.mockResolvedValue({ analogies: [] })

    renderWithRouter(<LibraryPage />)

    expect(screen.getByText('My Library')).toBeInTheDocument()
    expect(screen.getByText('Your saved analogies')).toBeInTheDocument()
  })

  it('shows loading spinner while fetching library', () => {
    libraryApi.getLibrary.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    renderWithRouter(<LibraryPage />)

    expect(screen.getByRole('status')).toBeInTheDocument()
  })

  it('displays LibraryGrid with fetched analogies', async () => {
    libraryApi.getLibrary.mockResolvedValue({ analogies: mockAnalogies })

    renderWithRouter(<LibraryPage />)

    await waitFor(() => {
      expect(screen.getByText('Understanding APIs')).toBeInTheDocument()
      expect(screen.getByText('Database Normalization')).toBeInTheDocument()
    })
  })

  it('shows empty state when library is empty', async () => {
    libraryApi.getLibrary.mockResolvedValue({ analogies: [] })

    renderWithRouter(<LibraryPage />)

    await waitFor(() => {
      expect(screen.getByText(/Your library is empty/i)).toBeInTheDocument()
    })
  })

  it('displays BannerError when fetch fails', async () => {
    const error = new Error('Network error')
    error.response = { status: 500 }
    libraryApi.getLibrary.mockRejectedValue(error)

    renderWithRouter(<LibraryPage />)

    await waitFor(() => {
      expect(screen.getByText(/Failed to load your library/)).toBeInTheDocument()
    })
  })

  it('distinguishes 401 errors from other errors', async () => {
    // Create an error that looks like an axios error
    const error = { 
      message: 'Unauthorized',
      response: { status: 401 }
    }
    libraryApi.getLibrary.mockRejectedValue(error)

    renderWithRouter(<LibraryPage />)

    await waitFor(() => {
      expect(screen.getByText(/session has expired/)).toBeInTheDocument()
    })
  })

  it('shows BannerError with retry action', async () => {
    const error = new Error('Network error')
    error.response = { status: 500 }
    libraryApi.getLibrary.mockRejectedValue(error)

    renderWithRouter(<LibraryPage />)

    await waitFor(() => {
      expect(screen.getByText('Try again')).toBeInTheDocument()
    })
  })

  it('retries fetch when retry button is clicked', async () => {
    const error = new Error('Network error')
    error.response = { status: 500 }

    libraryApi.getLibrary
      .mockRejectedValueOnce(error)
      .mockResolvedValueOnce({ analogies: mockAnalogies })

    renderWithRouter(<LibraryPage />)

    // Wait for initial error
    await waitFor(() => {
      expect(screen.getByText(/Failed to load your library/)).toBeInTheDocument()
    })

    // Click retry
    const retryButton = screen.getByRole('button', { name: /Try again/i })
    await userEvent.click(retryButton)

    // Wait for successful fetch
    await waitFor(() => {
      expect(screen.getByText('Understanding APIs')).toBeInTheDocument()
    })
  })

  it('dismisses BannerError when dismiss button is clicked', async () => {
    const error = new Error('Network error')
    error.response = { status: 500 }
    libraryApi.getLibrary.mockRejectedValue(error)

    renderWithRouter(<LibraryPage />)

    await waitFor(() => {
      expect(screen.getByText(/Failed to load your library/)).toBeInTheDocument()
    })

    // Click dismiss
    const dismissButton = screen.getByRole('button', { name: /Dismiss/i })
    await userEvent.click(dismissButton)

    // Error message should be dismissed
    await waitFor(() => {
      expect(screen.queryByText(/Failed to load your library/)).not.toBeInTheDocument()
    })
  })

  it('does not show loading spinner after first fetch completes', async () => {
    libraryApi.getLibrary.mockResolvedValue({ analogies: mockAnalogies })

    renderWithRouter(<LibraryPage />)

    // Wait for fetch to complete
    await waitFor(() => {
      expect(screen.getByText('Understanding APIs')).toBeInTheDocument()
    })

    // Spinner should not be visible
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('fetches library on component mount', async () => {
    libraryApi.getLibrary.mockResolvedValue({ analogies: [] })

    renderWithRouter(<LibraryPage />)

    await waitFor(() => {
      expect(libraryApi.getLibrary).toHaveBeenCalledTimes(1)
    })
  })
})

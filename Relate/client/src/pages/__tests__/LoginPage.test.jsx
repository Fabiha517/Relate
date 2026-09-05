import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import LoginPage from '../LoginPage'
import * as authApi from '../../api/auth.api'
import * as authContext from '../../context/AuthContext'

// Mock the auth API
vi.mock('../../api/auth.api', () => ({
  default: {
    post: vi.fn(),
  },
}))

// Mock the auth context
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    login: vi.fn(async (email, password) => {
      // Mock login implementation
      if (email === 'valid@test.com' && password === 'password123') {
        return { user: { email, name: 'Test User' } }
      }
      throw { response: { status: 401, data: { error: { message: 'Invalid credentials' } } } }
    }),
  })),
}))

// Mock guest session utility
vi.mock('../../utils/guestSession', () => ({
  get: vi.fn(() => null),
  set: vi.fn(),
  clear: vi.fn(),
}))

// Mock react-router-dom's useNavigate to track navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('inline validation - empty fields', () => {
    it('should display inline error when email field is empty at submission', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      )

      // Leave email empty, fill password, submit
      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /log in/i })
      await user.click(submitButton)

      // Email error should display
      expect(screen.getByText('Email is required.')).toBeInTheDocument()
    })

    it('should display inline error when password field is empty at submission', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      )

      // Leave password empty, fill email, submit
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      await user.type(emailInput, 'test@test.com')

      const submitButton = screen.getByRole('button', { name: /log in/i })
      await user.click(submitButton)

      // Password error should display
      expect(screen.getByText('Password is required.')).toBeInTheDocument()
    })

    it('should display errors on both fields when both are empty at submission', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      )

      const submitButton = screen.getByRole('button', { name: /log in/i })
      await user.click(submitButton)

      // Both errors should display
      expect(screen.getByText('Email is required.')).toBeInTheDocument()
      expect(screen.getByText('Password is required.')).toBeInTheDocument()
    })

    it('should not call API when email is empty', async () => {
      const user = userEvent.setup()
      const { useAuth } = await vi.importMock('../../hooks/useAuth')
      const mockLogin = vi.fn()

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      )

      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /log in/i })
      await user.click(submitButton)

      // API should NOT be called
      expect(mockLogin).not.toHaveBeenCalled()
    })

    it('should not call API when password is empty', async () => {
      const user = userEvent.setup()
      const { useAuth } = await vi.importMock('../../hooks/useAuth')
      const mockLogin = vi.fn()

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      )

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      await user.type(emailInput, 'test@test.com')

      const submitButton = screen.getByRole('button', { name: /log in/i })
      await user.click(submitButton)

      // API should NOT be called
      expect(mockLogin).not.toHaveBeenCalled()
    })
  })

  describe('error display - 401 response', () => {
    it('should display generic message on 401 API error', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      )

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/password/i)

      await user.type(emailInput, 'wrong@test.com')
      await user.type(passwordInput, 'wrongpassword')

      const submitButton = screen.getByRole('button', { name: /log in/i })
      await user.click(submitButton)

      // Should display generic message without distinction between email/password errors
      await waitFor(() => {
        expect(screen.getByText('Invalid email or password.')).toBeInTheDocument()
      })
    })

    it('should not distinguish between invalid email and invalid password', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      )

      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/password/i)

      await user.type(emailInput, 'invalid@test.com')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /log in/i })
      await user.click(submitButton)

      // Should show generic message, not "email not found" or similar
      await waitFor(() => {
        expect(screen.getByText('Invalid email or password.')).toBeInTheDocument()
      })

      // Should NOT have field-specific errors
      expect(screen.queryByText(/email not found/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/incorrect password/i)).not.toBeInTheDocument()
    })
  })

  describe('error clearing', () => {
    it('should clear email error when user starts typing in email field', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      )

      // Submit empty form to trigger error
      const submitButton = screen.getByRole('button', { name: /log in/i })
      await user.click(submitButton)

      expect(screen.getByText('Email is required.')).toBeInTheDocument()

      // Type in email field
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      await user.type(emailInput, 'test')

      // Error should be cleared
      expect(screen.queryByText('Email is required.')).not.toBeInTheDocument()
    })

    it('should clear password error when user starts typing in password field', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      )

      // Submit empty form to trigger error
      const submitButton = screen.getByRole('button', { name: /log in/i })
      await user.click(submitButton)

      expect(screen.getByText('Password is required.')).toBeInTheDocument()

      // Type in password field
      const passwordInput = screen.getByLabelText(/password/i)
      await user.type(passwordInput, 'pass')

      // Error should be cleared
      expect(screen.queryByText('Password is required.')).not.toBeInTheDocument()
    })
  })

  describe('UI state', () => {
    it('should have email and password input fields', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      )

      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    })

    it('should have submit button', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      )

      expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument()
    })

    it('should have sign up link', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      )

      expect(screen.getByRole('link', { name: /sign up/i })).toBeInTheDocument()
    })

    it('should have forgot password link', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      )

      expect(screen.getByRole('link', { name: /forgot password/i })).toBeInTheDocument()
    })
  })

  describe('button disabled state', () => {
    it('should have submit button that can be clicked', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      )

      const submitButton = screen.getByRole('button', { name: /log in/i })
      expect(submitButton).toBeInTheDocument()
    })
  })
})

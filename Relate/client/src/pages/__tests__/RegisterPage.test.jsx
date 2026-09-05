import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { BrowserRouter } from 'react-router-dom'
import RegisterPage from '../RegisterPage'
import * as authApi from '../../api/auth.api'

// Mock the auth API
vi.mock('../../api/auth.api', () => ({
  register: vi.fn(async (payload) => {
    // Verify confirmPassword is never in the payload
    if ('confirmPassword' in payload) {
      throw new Error('confirmPassword should never be sent to backend')
    }
    return { user: { name: payload.name, email: payload.email } }
  }),
  saveAnalogy: vi.fn(async () => ({})),
}))

// Mock the auth context
vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    login: vi.fn(async (email, password) => {
      return { user: { email, name: 'Test User' } }
    }),
  })),
}))

// Mock guest session utility
vi.mock('../../utils/guestSession', () => ({
  get: vi.fn(() => null),
  set: vi.fn(),
  clear: vi.fn(),
}))

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('inline validation - empty fields', () => {
    it('should display inline error when name field is empty at submission', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      )

      // Fill only other fields, leave name empty
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      expect(screen.getByText('Please enter your name.')).toBeInTheDocument()
    })

    it('should display inline error when email field is empty at submission', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      )

      // Fill only other fields, leave email empty
      const nameInput = screen.getByRole('textbox', { name: /name/i })
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      await user.type(nameInput, 'Test User')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      expect(screen.getByText('Please enter your email address.')).toBeInTheDocument()
    })

    it('should display inline error when password field is empty at submission', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      )

      // Fill only other fields, leave password empty
      const nameInput = screen.getByRole('textbox', { name: /name/i })
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      await user.type(nameInput, 'Test User')
      await user.type(emailInput, 'test@test.com')
      await user.type(confirmPasswordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      expect(screen.getByText('Password is required.')).toBeInTheDocument()
    })

    it('should display inline error when confirm password field is empty at submission', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      )

      // Fill only other fields, leave confirm password empty
      const nameInput = screen.getByRole('textbox', { name: /name/i })
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/^password$/i)

      await user.type(nameInput, 'Test User')
      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      expect(screen.getByText('Please confirm your password.')).toBeInTheDocument()
    })
  })

  describe('password length validation', () => {
    it('should display error when password is less than 8 characters', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      )

      const nameInput = screen.getByRole('textbox', { name: /name/i })
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      await user.type(nameInput, 'Test User')
      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'pass')
      await user.type(confirmPasswordInput, 'pass')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      expect(screen.getByText('Password must be at least 8 characters.')).toBeInTheDocument()
    })

    it('should display error when password exceeds 128 characters', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      )

      const longPassword = 'a'.repeat(129)

      const nameInput = screen.getByRole('textbox', { name: /name/i })
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      await user.type(nameInput, 'Test User')
      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, longPassword)
      await user.type(confirmPasswordInput, longPassword)

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      expect(screen.getByText('Password must be no more than 128 characters.')).toBeInTheDocument()
    })

    it('should accept password that is exactly 8 characters', async () => {
      const user = userEvent.setup()
      const { register } = await vi.importMock('../../api/auth.api')
      register.mockResolvedValueOnce({})

      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      )

      const nameInput = screen.getByRole('textbox', { name: /name/i })
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      await user.type(nameInput, 'Test User')
      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, '12345678')
      await user.type(confirmPasswordInput, '12345678')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      // Should not display password error
      expect(screen.queryByText('Password must be at least 8 characters.')).not.toBeInTheDocument()
    })

    it('should accept password that is exactly 128 characters', async () => {
      const user = userEvent.setup()
      const { register } = await vi.importMock('../../api/auth.api')
      register.mockResolvedValueOnce({})

      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      )

      const longPassword = 'a'.repeat(128)

      const nameInput = screen.getByRole('textbox', { name: /name/i })
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      await user.type(nameInput, 'Test User')
      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, longPassword)
      await user.type(confirmPasswordInput, longPassword)

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      // Should not display password error
      expect(screen.queryByText('Password must be no more than 128 characters.')).not.toBeInTheDocument()
    })
  })

  describe('confirm password validation', () => {
    it('should display exact message when passwords do not match', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      )

      const nameInput = screen.getByRole('textbox', { name: /name/i })
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      await user.type(nameInput, 'Test User')
      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password456')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      // Exact message required by spec
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument()
    })

    it('should not show mismatch error when passwords match', async () => {
      const user = userEvent.setup()
      const { register } = await vi.importMock('../../api/auth.api')
      register.mockResolvedValueOnce({})

      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      )

      const nameInput = screen.getByRole('textbox', { name: /name/i })
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      await user.type(nameInput, 'Test User')
      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      // Should not display mismatch error
      expect(screen.queryByText('Passwords do not match.')).not.toBeInTheDocument()
    })
  })

  describe('confirmPassword payload handling - Property 16', () => {
    it('should NOT include confirmPassword in the submitted payload to backend', async () => {
      const user = userEvent.setup()
      const { register } = await vi.importMock('../../api/auth.api')
      register.mockResolvedValueOnce({})

      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      )

      const nameInput = screen.getByRole('textbox', { name: /name/i })
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      await user.type(nameInput, 'John Doe')
      await user.type(emailInput, 'john@example.com')
      await user.type(passwordInput, 'securePassword123')
      await user.type(confirmPasswordInput, 'securePassword123')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      await waitFor(() => {
        // Verify register was called
        expect(register).toHaveBeenCalled()

        // Verify the payload does NOT contain confirmPassword
        const callArgs = register.mock.calls[0][0]
        expect(callArgs).not.toHaveProperty('confirmPassword')
      })
    })

    it('should include only name, email, and password in payload', async () => {
      const user = userEvent.setup()
      const { register } = await vi.importMock('../../api/auth.api')
      register.mockResolvedValueOnce({})

      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      )

      const nameInput = screen.getByRole('textbox', { name: /name/i })
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      await user.type(nameInput, 'Jane Smith')
      await user.type(emailInput, 'jane@example.com')
      await user.type(passwordInput, 'anotherSecure456')
      await user.type(confirmPasswordInput, 'anotherSecure456')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      await waitFor(() => {
        const callArgs = register.mock.calls[0][0]

        // Verify only these fields are present
        expect(callArgs).toHaveProperty('name', 'Jane Smith')
        expect(callArgs).toHaveProperty('email', 'jane@example.com')
        expect(callArgs).toHaveProperty('password', 'anotherSecure456')

        // Verify confirmPassword is absent
        expect(callArgs).not.toHaveProperty('confirmPassword')

        // Verify no other unexpected fields (except optional guestAnalogy)
        const keys = Object.keys(callArgs)
        const allowedKeys = ['name', 'email', 'password', 'guestAnalogy']
        keys.forEach(key => {
          expect(allowedKeys).toContain(key)
        })
      })
    })

    it('should not send confirmPassword even if it matches password exactly', async () => {
      const user = userEvent.setup()
      const { register } = await vi.importMock('../../api/auth.api')
      register.mockResolvedValueOnce({})

      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      )

      const password = 'testPassword789'

      const nameInput = screen.getByRole('textbox', { name: /name/i })
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      await user.type(nameInput, 'Test User')
      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, password)
      await user.type(confirmPasswordInput, password)

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      await waitFor(() => {
        const callArgs = register.mock.calls[0][0]
        expect(callArgs).not.toHaveProperty('confirmPassword')
      })
    })
  })

  describe('guest analogy handling', () => {
    it('should include guestAnalogy in payload if present in sessionStorage', async () => {
      const user = userEvent.setup()
      const { register } = await vi.importMock('../../api/auth.api')
      const guestSession = await vi.importMock('../../utils/guestSession')

      const mockGuestAnalogy = {
        analogyTitle: 'Test Analogy',
        concept: 'test concept',
      }

      guestSession.get.mockReturnValueOnce(mockGuestAnalogy)
      register.mockResolvedValueOnce({})

      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      )

      const nameInput = screen.getByRole('textbox', { name: /name/i })
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      await user.type(nameInput, 'Test User')
      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      await waitFor(() => {
        const callArgs = register.mock.calls[0][0]
        expect(callArgs).toHaveProperty('guestAnalogy', mockGuestAnalogy)
      })
    })

    it('should not include guestAnalogy if not present in sessionStorage', async () => {
      const user = userEvent.setup()
      const { register } = await vi.importMock('../../api/auth.api')
      const guestSession = await vi.importMock('../../utils/guestSession')

      guestSession.get.mockReturnValueOnce(null)
      register.mockResolvedValueOnce({})

      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      )

      const nameInput = screen.getByRole('textbox', { name: /name/i })
      const emailInput = screen.getByRole('textbox', { name: /email/i })
      const passwordInput = screen.getByLabelText(/^password$/i)
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i)

      await user.type(nameInput, 'Test User')
      await user.type(emailInput, 'test@test.com')
      await user.type(passwordInput, 'password123')
      await user.type(confirmPasswordInput, 'password123')

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      await waitFor(() => {
        const callArgs = register.mock.calls[0][0]
        expect(callArgs).not.toHaveProperty('guestAnalogy')
      })
    })
  })

  describe('error clearing', () => {
    it('should clear error when user starts typing in field', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      )

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      // All errors should show
      expect(screen.getByText('Please enter your name.')).toBeInTheDocument()

      // Start typing in name field
      const nameInput = screen.getByRole('textbox', { name: /name/i })
      await user.type(nameInput, 'Test')

      // Error should be cleared
      expect(screen.queryByText('Please enter your name.')).not.toBeInTheDocument()
    })
  })

  describe('UI state', () => {
    it('should have all four form fields', () => {
      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      )

      expect(screen.getByRole('textbox', { name: /name/i })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument()
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    })

    it('should have submit button', () => {
      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      )

      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
    })

    it('should have login link', () => {
      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      )

      expect(screen.getByRole('link', { name: /log in/i })).toBeInTheDocument()
    })

    it('should display field-specific error messages', async () => {
      const user = userEvent.setup()
      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      )

      const submitButton = screen.getByRole('button', { name: /create account/i })
      await user.click(submitButton)

      // Should display field-specific messages, not a single generic error
      expect(screen.getByText('Please enter your name.')).toBeInTheDocument()
      expect(screen.getByText('Please enter your email address.')).toBeInTheDocument()
      expect(screen.getByText('Password is required.')).toBeInTheDocument()
      expect(screen.getByText('Please confirm your password.')).toBeInTheDocument()
    })
  })

  describe('button disabled state', () => {
    it('should have submit button that can be clicked', () => {
      render(
        <BrowserRouter>
          <RegisterPage />
        </BrowserRouter>
      )

      const submitButton = screen.getByRole('button', { name: /create account/i })
      expect(submitButton).toBeInTheDocument()
    })
  })
})

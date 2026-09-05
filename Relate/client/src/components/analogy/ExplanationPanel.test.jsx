import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import ExplanationPanel from './ExplanationPanel'

describe('ExplanationPanel', () => {
  it('renders explanation text when provided', () => {
    const explanation = 'This is how the analogy works: concept maps to world element.'
    render(<ExplanationPanel explanation={explanation} />)

    expect(screen.getByText(/This is how the analogy works/)).toBeInTheDocument()
  })

  it('renders heading "Explanation"', () => {
    const explanation = 'Some explanation'
    render(<ExplanationPanel explanation={explanation} />)

    expect(screen.getByRole('heading', { level: 2, name: /Explanation/ })).toBeInTheDocument()
  })

  it('displays error message when explanation is empty', () => {
    render(<ExplanationPanel explanation="" />)

    expect(
      screen.getByText(/The explanation could not be loaded/),
    ).toBeInTheDocument()
  })

  it('displays error message when explanation is null', () => {
    render(<ExplanationPanel explanation={null} />)

    expect(
      screen.getByText(/The explanation could not be loaded/),
    ).toBeInTheDocument()
  })

  it('displays error message when explanation is undefined', () => {
    render(<ExplanationPanel explanation={undefined} />)

    expect(
      screen.getByText(/The explanation could not be loaded/),
    ).toBeInTheDocument()
  })

  it('renders explanation with proper formatting', () => {
    const explanation = 'Concept A maps to World Element B through this relationship.'
    const { container } = render(<ExplanationPanel explanation={explanation} />)

    const content = container.querySelector('.explanation-content')
    expect(content).toBeInTheDocument()
    expect(content.querySelector('p')).toHaveTextContent(explanation)
  })
})

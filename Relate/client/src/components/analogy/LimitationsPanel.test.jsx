import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import LimitationsPanel from './LimitationsPanel'

describe('LimitationsPanel', () => {
  it('renders limitations heading when limitations provided', () => {
    const limitations = ['Limitation 1', 'Limitation 2']
    render(<LimitationsPanel limitations={limitations} />)

    expect(
      screen.getByRole('heading', { level: 2, name: /Where This Analogy Breaks Down/ }),
    ).toBeInTheDocument()
  })

  it('renders each limitation as a list item', () => {
    const limitations = ['The analogy breaks at X', 'Does not cover scenario Y']
    render(<LimitationsPanel limitations={limitations} />)

    limitations.forEach((limitation) => {
      expect(screen.getByText(limitation)).toBeInTheDocument()
    })
  })

  it('returns null when limitations is empty array', () => {
    const { container } = render(<LimitationsPanel limitations={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when limitations is null', () => {
    const { container } = render(<LimitationsPanel limitations={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when limitations is undefined', () => {
    const { container } = render(<LimitationsPanel limitations={undefined} />)
    expect(container.firstChild).toBeNull()
  })

  it('returns null when limitations is not an array', () => {
    const { container } = render(<LimitationsPanel limitations="not an array" />)
    expect(container.firstChild).toBeNull()
  })

  it('renders limitations in a list with correct structure', () => {
    const limitations = ['Limitation A', 'Limitation B', 'Limitation C']
    const { container } = render(<LimitationsPanel limitations={limitations} />)

    const listItems = container.querySelectorAll('.limitation-item')
    expect(listItems).toHaveLength(3)

    listItems.forEach((item, index) => {
      expect(item).toHaveTextContent(limitations[index])
    })
  })
})

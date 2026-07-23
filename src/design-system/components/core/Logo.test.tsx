import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BookMark, Logo, SealMark } from './Logo'

describe('BookMark', () => {
  it('renders the book-and-light icon at the given size', () => {
    const { container } = render(<BookMark size={48} />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('width', '48')
    expect(svg).toHaveAttribute('height', '48')
    expect(svg).toHaveAttribute('viewBox', '0 0 64 64')
  })
})

describe('SealMark', () => {
  it('renders the solid medallion with the book knocked out', () => {
    const { container } = render(<SealMark size={32} />)
    const circle = container.querySelector('circle')
    expect(circle).toHaveAttribute('fill', 'var(--color-accent)')
    expect(container.querySelectorAll('path')).toHaveLength(8)
  })

  it('accepts custom accent and paper colors', () => {
    const { container } = render(<SealMark accent="#111" paper="#fff" />)
    expect(container.querySelector('circle')).toHaveAttribute('fill', '#111')
  })
})

describe('Logo', () => {
  it('renders the wordmark with "Libera" in the accent color', () => {
    render(<Logo />)
    expect(screen.getByText('Biblia')).toBeInTheDocument()
    const libera = screen.getByText('Libera')
    expect(libera).toHaveStyle({ color: 'var(--color-accent)' })
  })

  it('renders the tagline by default', () => {
    render(<Logo />)
    expect(screen.getByText('Tradução aberta · CC BY 4.0')).toBeInTheDocument()
  })

  it('omits the tagline when set to false', () => {
    render(<Logo tagline={false} />)
    expect(screen.queryByText('Tradução aberta · CC BY 4.0')).not.toBeInTheDocument()
  })

  it('accepts a custom tagline', () => {
    render(<Logo tagline="Ler a Bíblia" />)
    expect(screen.getByText('Ler a Bíblia')).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Badge } from './Badge'

describe('Badge', () => {
  it('renders its label with the neutral tone by default', () => {
    render(<Badge>CC BY 4.0</Badge>)
    const badge = screen.getByText('CC BY 4.0')
    expect(badge).toHaveStyle({ color: 'var(--color-text-secondary)' })
  })

  it('applies the accent tone', () => {
    render(<Badge tone="accent">Novo</Badge>)
    expect(screen.getByText('Novo')).toHaveStyle({ color: 'var(--color-accent)' })
  })

  it('renders in the monospace voice for references', () => {
    render(<Badge mono>Jn 2.3</Badge>)
    expect(screen.getByText('Jn 2.3')).toHaveStyle({ fontFamily: 'var(--font-mono)' })
  })
})

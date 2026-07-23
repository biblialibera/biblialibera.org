import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Card, CardMeta, CardTitle } from './Card'

describe('Card', () => {
  it('is flat by default', () => {
    render(<Card data-testid="card">conteúdo</Card>)
    expect(screen.getByTestId('card')).toHaveStyle({ boxShadow: 'none' })
  })

  it('adds a shadow when raised', () => {
    render(
      <Card raised data-testid="card">
        conteúdo
      </Card>,
    )
    expect(screen.getByTestId('card')).toHaveStyle({ boxShadow: 'var(--shadow-md)' })
  })

  it('adds an oxblood top rule when accent', () => {
    render(
      <Card accent data-testid="card">
        conteúdo
      </Card>,
    )
    // jsdom cannot resolve custom properties inside a border shorthand via
    // computed style, so this reads the inline style directly instead of
    // going through jest-dom's toHaveStyle (which uses getComputedStyle).
    const card = screen.getByTestId('card') as HTMLElement
    expect(card.style.borderTop).toBe('var(--border-thick) solid var(--color-accent)')
  })

  it('renders CardTitle and CardMeta as composable children', () => {
    render(
      <Card>
        <CardMeta>Status</CardMeta>
        <CardTitle>Jonas</CardTitle>
      </Card>,
    )
    expect(screen.getByText('Status')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Jonas', level: 3 })).toBeInTheDocument()
  })
})

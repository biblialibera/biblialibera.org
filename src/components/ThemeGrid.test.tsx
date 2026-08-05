import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { ThemeGrid } from './ThemeGrid'
import type { ThemeIndexEntry } from './themeData'

const themes: ThemeIndexEntry[] = [
  {
    slug: 'amor',
    name: 'Amor',
    summary: 'O mandamento que resume os outros.',
    passageCount: 6,
    verseCount: 22,
    references: ['1 Coríntios 13:4-7'],
  },
  {
    slug: 'medo',
    name: 'Medo e coragem',
    summary: 'O que a Escritura diz a quem está com medo.',
    passageCount: 6,
    verseCount: 14,
    references: ['Josué 1:9'],
  },
]

const renderGrid = (props: Partial<Parameters<typeof ThemeGrid>[0]> = {}) =>
  render(
    <MemoryRouter>
      <ThemeGrid themes={themes} {...props} />
    </MemoryRouter>,
  )

describe('ThemeGrid', () => {
  it('renders one linked card per theme', () => {
    renderGrid()
    expect(screen.getByRole('link', { name: /Amor/ })).toHaveAttribute('href', '/temas/amor')
    expect(screen.getByRole('link', { name: /Medo e coragem/ })).toHaveAttribute('href', '/temas/medo')
  })

  it('shows the summary and the counts', () => {
    renderGrid()
    expect(screen.getByText('O mandamento que resume os outros.')).toBeInTheDocument()
    expect(screen.getByText('6 passagens · 22 versículos')).toBeInTheDocument()
  })

  it('shows the empty message instead of an empty list', () => {
    renderGrid({ themes: [], emptyMessage: 'Nada aqui.' })
    expect(screen.getByText('Nada aqui.')).toBeInTheDocument()
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })
})

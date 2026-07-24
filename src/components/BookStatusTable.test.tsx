import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { BookStatusTable } from './BookStatusTable'

const rows = [
  { book: 'Gênesis', ref: 'Gn', canon: 'AT' as const, status: 'checked' as const },
  { book: 'Judas', ref: 'Jd', canon: 'NT' as const, status: 'reviewed' as const },
  { book: 'Levítico', ref: 'Lv', canon: 'AT' as const, status: 'not-translated' as const },
  { book: 'Tobias', ref: 'Tb', canon: 'DC' as const, status: 'not-translated' as const },
]

describe('BookStatusTable', () => {
  it('renders a row per book with its reference and canon', () => {
    render(<BookStatusTable rows={rows} />)
    expect(screen.getByRole('cell', { name: 'Gênesis' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Gn' })).toBeInTheDocument()
    expect(screen.getAllByRole('cell', { name: 'AT' }).length).toBe(2)
  })

  it('classifies deuterocanonical books distinctly from AT/NT', () => {
    render(<BookStatusTable rows={rows} />)
    expect(screen.getByRole('cell', { name: 'Tobias' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'DC' })).toBeInTheDocument()
  })

  it('renders a ReviewSeal for each translated row status', () => {
    render(<BookStatusTable rows={rows} />)
    expect(screen.getByText('Verificado')).toBeInTheDocument()
    expect(screen.getByText('Revisado')).toBeInTheDocument()
  })

  it('renders a plain badge for books not translated yet, no ReviewSeal', () => {
    render(<BookStatusTable rows={rows} />)
    expect(screen.getAllByText('Ainda não traduzido').length).toBe(2)
  })

  it('renders the caption when given', () => {
    render(<BookStatusTable rows={rows} caption="9 livros" />)
    expect(screen.getByText('9 livros')).toBeInTheDocument()
  })
})

import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { BookRail } from './BookRail'
import type { BookGroup } from './readerData'

const GROUPS: BookGroup[] = [
  {
    section: 'Antigo Testamento',
    books: [
      { slug: 'genesis', code: 'Gen', file: 'Gen', name: 'Gênesis', abbrev: 'Gn', canon: 'AT', chapters: 50, status: { formal: 'checked' }, original: { language: 'Hebraico' } },
      { slug: 'jonas', code: 'Jonah', file: 'Jonah', name: 'Jonas', abbrev: 'Jn', canon: 'AT', chapters: 4, status: { formal: 'checked' }, original: { language: 'Hebraico' } },
    ],
  },
  {
    section: 'Novo Testamento',
    books: [
      { slug: 'joao', code: 'John', file: 'John', name: 'João', abbrev: 'Jo', canon: 'NT', chapters: 21, status: { formal: 'checked' }, original: { language: 'Grego' } },
    ],
  },
]

const renderRail = (current?: string) =>
  render(
    <MemoryRouter>
      <BookRail groups={GROUPS} edition="catolica" current={current} />
    </MemoryRouter>,
  )

describe('BookRail', () => {
  it('lists every book under its testament', () => {
    renderRail()
    const at = screen.getByRole('heading', { name: 'Antigo Testamento' }).parentElement as HTMLElement
    expect(within(at).getAllByRole('link').map((a) => a.textContent)).toEqual(['GênesisGn', 'JonasJn'])
    const nt = screen.getByRole('heading', { name: 'Novo Testamento' }).parentElement as HTMLElement
    expect(within(nt).getAllByRole('link').map((a) => a.textContent)).toEqual(['JoãoJo'])
  })

  // Links, not buttons: a book is a place, so it opens in a new tab on middle
  // click and shows where it goes on hover.
  it('opens each book at its first chapter', () => {
    renderRail()
    expect(screen.getByRole('link', { name: /Jonas/ })).toHaveAttribute('href', '/ler/catolica/jonas/1')
    expect(screen.getByRole('link', { name: /João/ })).toHaveAttribute('href', '/ler/catolica/joao/1')
  })

  it('marks the book being read, and only that one', () => {
    renderRail('Jonah')
    expect(screen.getByRole('link', { name: /Jonas/ })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: /João/ })).not.toHaveAttribute('aria-current')
  })

  it('marks nothing when the reader is not in one of these books', () => {
    renderRail()
    for (const link of screen.getAllByRole('link')) expect(link).not.toHaveAttribute('aria-current')
  })

  it('is a landmark a screen reader can jump to', () => {
    renderRail('John')
    expect(screen.getByRole('navigation', { name: 'Livros' })).toBeInTheDocument()
  })
})

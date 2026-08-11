import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { BookIndex } from './BookIndex'
import { editionByKey } from './readerData'

const catholic = editionByKey('catolica')!
const protestant = editionByKey('protestante')!

function renderIndex(edition = catholic) {
  return render(
    <MemoryRouter>
      <BookIndex edition={edition} />
    </MemoryRouter>,
  )
}

describe('BookIndex', () => {
  it('groups the translated books by testament', () => {
    renderIndex()
    expect(screen.getByRole('heading', { name: 'Antigo Testamento' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Novo Testamento' })).toBeInTheDocument()
  })

  it('links every book to its first chapter, inside the edition being listed', () => {
    renderIndex()
    expect(screen.getByRole('link', { name: /Salmos/ })).toHaveAttribute('href', '/ler/catolica/salmos/1')
    expect(screen.getByRole('link', { name: /Mateus/ })).toHaveAttribute('href', '/ler/catolica/mateus/1')
    expect(screen.getAllByRole('link')).toHaveLength(catholic.books.length)
  })

  // Sirach's first chapter is the translator's prologue, not chapter 1.
  it('opens a book at its actual first chapter, not at "1"', () => {
    renderIndex()
    expect(screen.getByRole('link', { name: /Eclesiástico/ })).toHaveAttribute(
      'href',
      '/ler/catolica/eclesiastico/praef',
    )
  })

  it('lists only what the edition contains', () => {
    renderIndex(protestant)
    expect(screen.getAllByRole('link')).toHaveLength(protestant.books.length)
    expect(screen.queryByRole('link', { name: /Tobias/ })).not.toBeInTheDocument()
  })
})

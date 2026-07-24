import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { BookIndex } from './BookIndex'
import { readerIndex } from './readerData'

function renderIndex() {
  return render(
    <MemoryRouter>
      <BookIndex />
    </MemoryRouter>,
  )
}

describe('BookIndex', () => {
  it('groups the translated books by testament', () => {
    renderIndex()
    expect(screen.getByRole('heading', { name: 'Antigo Testamento' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Novo Testamento' })).toBeInTheDocument()
  })

  it('links every book to its first chapter', () => {
    renderIndex()
    expect(screen.getByRole('link', { name: /Salmos/ })).toHaveAttribute('href', '/ler/salmos/1')
    expect(screen.getByRole('link', { name: /Mateus/ })).toHaveAttribute('href', '/ler/mateus/1')
    expect(screen.getAllByRole('link')).toHaveLength(readerIndex.length)
  })
})

import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

beforeEach(() => window.localStorage.clear())

describe('App routing', () => {
  it('renders the landing at /', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('A Bíblia em português atual, livre para todos')
  })

  // The two editions differ by seven books and by the numbering of two more,
  // so the first visit asks rather than deciding quietly.
  it('asks which edition on the first visit to /ler', () => {
    renderAt('/ler')
    expect(screen.getByRole('heading', { name: 'Qual edição você lê?' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Católica/ })).toHaveAttribute('href', '/ler/catolica')
  })

  it('goes straight to the books once the reader has chosen', () => {
    window.localStorage.setItem('bl.reader.edition', 'protestante')
    renderAt('/ler')
    expect(screen.getByRole('heading', { name: 'Escolha um livro' })).toBeInTheDocument()
    expect(screen.getByText(/66 livros desta edição/)).toBeInTheDocument()
  })

  it('renders an edition index at /ler/:edicao', () => {
    renderAt('/ler/catolica')
    expect(screen.getByRole('heading', { name: 'Escolha um livro' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Tobias/ })).toBeInTheDocument()
  })

  // Links handed out before the edition moved into the path are still out
  // there, in chats nobody can edit.
  it('carries a link from before the edition was in the path into one', () => {
    window.localStorage.setItem('bl.reader.edition', 'protestante')
    renderAt('/ler/jonas/1')
    expect(screen.getByRole('link', { name: 'Protestante' })).toHaveAttribute('aria-current', 'true')
  })

  it('resolves such a link to the default edition when nobody has chosen', () => {
    renderAt('/ler/jonas/1')
    expect(screen.getByRole('link', { name: 'Católica' })).toHaveAttribute('aria-current', 'true')
  })
})

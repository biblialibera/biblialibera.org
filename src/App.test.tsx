import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import App from './App'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  )
}

describe('App routing', () => {
  it('renders the landing at /', () => {
    renderAt('/')
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('A Bíblia em português atual, livre para todos')
  })

  it('renders the reader index at /ler', () => {
    renderAt('/ler')
    expect(screen.getByRole('heading', { name: 'Escolha um livro' })).toBeInTheDocument()
  })
})

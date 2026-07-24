import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import Landing from './Landing'

function renderLanding(props: { theme: 'light' | 'dark'; onToggleTheme: () => void }) {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Landing {...props} />} />
        <Route path="/ler" element={<div>Página do leitor</div>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Landing', () => {
  it('renders the hero headline and the live register demo', () => {
    renderLanding({ theme: 'light', onToggleTheme: () => {} })
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('A Bíblia em português atual, livre para todos')
    expect(screen.getByRole('heading', { name: 'Salmo 23' })).toBeInTheDocument()
  })

  it('renders the why cards, pipeline steps and the book status table', () => {
    renderLanding({ theme: 'light', onToggleTheme: () => {} })
    expect(screen.getByRole('heading', { name: 'Linguagem de outro século' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Revisão humana' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Judas' })).toBeInTheDocument()
  })

  it('calls onToggleTheme from the header', async () => {
    const user = userEvent.setup()
    const onToggleTheme = vi.fn()
    renderLanding({ theme: 'light', onToggleTheme })
    await user.click(screen.getByRole('button', { name: 'Alternar tema' }))
    expect(onToggleTheme).toHaveBeenCalledOnce()
  })

  it('lets the visitor switch the demo to the simple register', async () => {
    const user = userEvent.setup()
    renderLanding({ theme: 'light', onToggleTheme: () => {} })
    await user.click(screen.getByRole('radio', { name: 'Simples' }))
    expect(screen.getByText(/nada me falta\./)).toBeInTheDocument()
  })

  it('sends the hero Ler button to the reader', async () => {
    const user = userEvent.setup()
    renderLanding({ theme: 'light', onToggleTheme: () => {} })
    await user.click(screen.getByRole('button', { name: 'Ler' }))
    expect(screen.getByText('Página do leitor')).toBeInTheDocument()
  })
})

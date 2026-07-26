import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import ReaderChapter from './ReaderChapter'

beforeAll(() => vi.stubGlobal('scrollTo', vi.fn()))
afterAll(() => vi.unstubAllGlobals())
beforeEach(() => window.localStorage.clear())

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/ler" element={<div>Índice do leitor</div>} />
        <Route path="/ler/:slug/:capitulo" element={<ReaderChapter theme="light" onToggleTheme={() => {}} />} />
      </Routes>
    </MemoryRouter>,
  )
}

// The chapter text only appears once the book chunk has loaded; the register
// toggle is a loaded-only marker (the loading placeholder has no toggle).
const untilLoaded = () => screen.findByRole('radio', { name: 'Português' })

describe('ReaderChapter', () => {
  it('lazy-loads and renders the requested chapter', async () => {
    renderAt('/ler/jonas/1')
    await untilLoaded()
    expect(screen.getByRole('heading', { name: 'Jonas 1' })).toBeInTheDocument()
    expect(screen.getByText(/vai a Nínive, a grande cidade/)).toBeInTheDocument()
  })

  it('redirects an unknown book to the index', async () => {
    renderAt('/ler/naoexiste/1')
    expect(await screen.findByText('Índice do leitor')).toBeInTheDocument()
  })

  it('redirects an out-of-range chapter to chapter 1', async () => {
    renderAt('/ler/jonas/99')
    await untilLoaded()
    expect(screen.getByRole('heading', { name: 'Jonas 1' })).toBeInTheDocument()
  })

  it('disables prev on the first chapter', async () => {
    renderAt('/ler/jonas/1')
    await untilLoaded()
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Próximo' })).toBeEnabled()
  })

  it('disables next on the last chapter', async () => {
    renderAt('/ler/jonas/4')
    await untilLoaded()
    expect(screen.getByRole('button', { name: 'Próximo' })).toBeDisabled()
  })

  it('opens in the remembered register and writes changes back', async () => {
    window.localStorage.setItem('bl.reader.register', 'original')
    const user = userEvent.setup()
    renderAt('/ler/jonas/1')
    await untilLoaded()
    expect(screen.getByRole('radio', { name: /Original/ })).toHaveAttribute('aria-checked', 'true')

    await user.click(screen.getByRole('radio', { name: 'Português' }))
    expect(window.localStorage.getItem('bl.reader.register')).toBe('formal')
  })
})

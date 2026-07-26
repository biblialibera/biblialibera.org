import { render, screen, within } from '@testing-library/react'
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
const untilLoaded = () => screen.findByRole('radio', { name: 'Formal' })

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

  it('shows the chapter guide, current chapter marked, before the book loads', () => {
    renderAt('/ler/jonas/2')
    const guide = screen.getByRole('navigation', { name: 'Capítulos' })
    expect(within(guide).getAllByRole('link')).toHaveLength(4)
    expect(within(guide).getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page')
  })

  it('navigates to the chapter picked in the guide', async () => {
    const user = userEvent.setup()
    renderAt('/ler/jonas/1')
    await untilLoaded()

    const guide = screen.getByRole('navigation', { name: 'Capítulos' })
    await user.click(within(guide).getByRole('link', { name: '3' }))
    expect(await screen.findByRole('heading', { name: 'Jonas 3' })).toBeInTheDocument()
  })

  it('omits the guide for a single-chapter book', async () => {
    renderAt('/ler/filemom/1')
    await untilLoaded()
    expect(screen.queryByRole('navigation', { name: 'Capítulos' })).not.toBeInTheDocument()
  })

  it('opens in the remembered register and writes changes back', async () => {
    window.localStorage.setItem('bl.reader.register', 'simple')
    const user = userEvent.setup()
    renderAt('/ler/jonas/1')
    await untilLoaded()
    expect(screen.getByRole('radio', { name: 'Simples' })).toHaveAttribute('aria-checked', 'true')

    await user.click(screen.getByRole('radio', { name: 'Formal' }))
    expect(window.localStorage.getItem('bl.reader.register')).toBe('formal')
  })
})

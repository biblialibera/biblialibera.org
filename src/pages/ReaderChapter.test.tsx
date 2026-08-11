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
        <Route path="/ler/:edicao" element={<div>Índice da edição</div>} />
        <Route
          path="/ler/:edicao/:slug/:capitulo"
          element={<ReaderChapter theme="light" onToggleTheme={() => {}} />}
        />
      </Routes>
    </MemoryRouter>,
  )
}

// The chapter text only appears once the book chunk has loaded; the register
// toggle is a loaded-only marker (the loading placeholder has no toggle).
const untilLoaded = () => screen.findByRole('radio', { name: 'Português' })

describe('ReaderChapter', () => {
  it('lazy-loads and renders the requested chapter', async () => {
    renderAt('/ler/catolica/jonas/1')
    await untilLoaded()
    expect(screen.getByRole('heading', { name: 'Jonas 1' })).toBeInTheDocument()
    expect(screen.getByText(/vai a Nínive, a grande cidade/)).toBeInTheDocument()
  })

  it("redirects an unknown book to the edition's own index", async () => {
    renderAt('/ler/catolica/naoexiste/1')
    expect(await screen.findByText('Índice da edição')).toBeInTheDocument()
  })

  // An edition that does not exist is a typo, not a choice.
  it('redirects an unknown edition to the front door', async () => {
    renderAt('/ler/ortodoxa/jonas/1')
    expect(await screen.findByText('Índice do leitor')).toBeInTheDocument()
  })

  // Sirach opens on the translator's prologue, which is a chapter without a
  // number: prev/next walk the chapter list rather than counting.
  it('reads a book whose first chapter is not numbered', async () => {
    renderAt('/ler/catolica/eclesiastico/praef')
    await untilLoaded()
    expect(screen.getByRole('heading', { name: 'Eclesiástico Prólogo' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
  })

  // The deuterocanon is why there are two editions at all.
  it('reads a deuterocanonical book in the Catholic edition and refuses it in the other', async () => {
    renderAt('/ler/catolica/tobias/1')
    await untilLoaded()
    expect(screen.getByRole('heading', { name: 'Tobias 1' })).toBeInTheDocument()
  })

  it('sends a deuterocanonical link to the index when the edition has no such book', async () => {
    renderAt('/ler/protestante/tobias/1')
    expect(await screen.findByText('Índice da edição')).toBeInTheDocument()
  })

  // Opening someone else's link shows their edition; it must not quietly
  // become yours.
  it('reads the edition off the URL without touching the stored preference', async () => {
    window.localStorage.setItem('bl.reader.edition', 'protestante')
    renderAt('/ler/catolica/jonas/1')
    await untilLoaded()
    expect(screen.getByRole('link', { name: 'Católica' })).toHaveAttribute('aria-current', 'true')
    expect(window.localStorage.getItem('bl.reader.edition')).toBe('protestante')
  })

  // Where the same reading is in the other edition, which is not always the
  // same chapter: Daniel loses two of them outside the Catholic edition.
  it('offers the other edition at the same place, or at the nearest one it has', async () => {
    renderAt('/ler/catolica/jonas/3')
    await untilLoaded()
    expect(screen.getByRole('link', { name: 'Protestante' })).toHaveAttribute(
      'href',
      '/ler/protestante/jonas/3',
    )
  })

  it('falls back to the first chapter when the other edition is shorter there', async () => {
    renderAt('/ler/catolica/daniel/13')
    await untilLoaded()
    expect(screen.getByRole('link', { name: 'Protestante' })).toHaveAttribute('href', '/ler/protestante/daniel/1')
  })

  it("falls back to the other edition's book list when the book is not in it", async () => {
    renderAt('/ler/catolica/tobias/1')
    await untilLoaded()
    expect(screen.getByRole('link', { name: 'Protestante' })).toHaveAttribute('href', '/ler/protestante')
  })

  it('redirects an out-of-range chapter to chapter 1', async () => {
    renderAt('/ler/catolica/jonas/99')
    await untilLoaded()
    expect(screen.getByRole('heading', { name: 'Jonas 1' })).toBeInTheDocument()
  })

  it('disables prev on the first chapter', async () => {
    renderAt('/ler/catolica/jonas/1')
    await untilLoaded()
    expect(screen.getByRole('button', { name: 'Anterior' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Próximo' })).toBeEnabled()
  })

  it('disables next on the last chapter', async () => {
    renderAt('/ler/catolica/jonas/4')
    await untilLoaded()
    expect(screen.getByRole('button', { name: 'Próximo' })).toBeDisabled()
  })

  it('opens in the remembered register and writes changes back', async () => {
    window.localStorage.setItem('bl.reader.register', 'original')
    const user = userEvent.setup()
    renderAt('/ler/catolica/jonas/1')
    await untilLoaded()
    expect(screen.getByRole('radio', { name: /Original/ })).toHaveAttribute('aria-checked', 'true')

    await user.click(screen.getByRole('radio', { name: 'Português' }))
    expect(window.localStorage.getItem('bl.reader.register')).toBe('formal')
  })
})

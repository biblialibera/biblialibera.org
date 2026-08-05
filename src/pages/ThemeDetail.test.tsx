import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import ThemeDetail from './ThemeDetail'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/temas/:slug" element={<ThemeDetail theme="light" onToggleTheme={() => {}} />} />
        <Route path="/temas" element={<p>índice de temas</p>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ThemeDetail', () => {
  it('lazy-loads the theme and renders its passages', async () => {
    renderAt('/temas/medo')
    expect(screen.getByRole('heading', { level: 1, name: 'Medo e coragem' })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('link', { name: 'Josué 1:9' })).toHaveAttribute('href', '/ler/josue/1'))
  })

  it('renders the verse text of a passage', async () => {
    renderAt('/temas/medo')
    await waitFor(() => expect(screen.getByText(/Sê forte e corajoso/)).toBeInTheDocument())
  })

  it('redirects an unknown theme back to the index', () => {
    renderAt('/temas/nao-existe')
    expect(screen.getByText('índice de temas')).toBeInTheDocument()
  })

  it('offers a way back to the index', () => {
    renderAt('/temas/medo')
    expect(screen.getByRole('link', { name: '‹ Temas' })).toHaveAttribute('href', '/temas')
  })
})

describe('ThemeDetail loading failures', () => {
  it('says the passages could not be loaded instead of loading forever', async () => {
    vi.resetModules()
    vi.doMock('../components/themeData', async () => {
      const actual = await vi.importActual<typeof import('../components/themeData')>('../components/themeData')
      return { ...actual, loadTheme: () => Promise.reject(new Error('offline')) }
    })
    const { default: Fresh } = await import('./ThemeDetail')
    render(
      <MemoryRouter initialEntries={['/temas/medo']}>
        <Routes>
          <Route path="/temas/:slug" element={<Fresh theme="light" onToggleTheme={() => {}} />} />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText(/não foi possível carregar/i)).toBeInTheDocument())
    expect(screen.queryByText('Carregando...')).not.toBeInTheDocument()
    vi.doUnmock('../components/themeData')
  })
})

import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { describe, expect, it } from 'vitest'
import Themes from './Themes'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/temas" element={<Themes theme="light" onToggleTheme={() => {}} />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('Themes', () => {
  it('lists every theme', () => {
    renderAt('/temas')
    expect(screen.getByRole('heading', { level: 1, name: 'Por onde começar' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /^Amor/ })).toHaveAttribute('href', '/temas/amor')
  })

  it('says plainly that the index is AI-built and unreviewed', () => {
    renderAt('/temas')
    expect(screen.getByText(/auxílio de IA, ainda sem revisão humana/)).toBeInTheDocument()
  })
})

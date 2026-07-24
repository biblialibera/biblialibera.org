import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { SiteFooter } from './SiteFooter'

function renderFooter() {
  return render(
    <MemoryRouter>
      <SiteFooter year={2026} />
    </MemoryRouter>,
  )
}

describe('SiteFooter', () => {
  it('renders the wordmark and tagline', () => {
    renderFooter()
    expect(screen.getByText('Biblia')).toBeInTheDocument()
    expect(screen.getByText(/A Bíblia em português atual/)).toBeInTheDocument()
  })

  it('renders the nav links', () => {
    renderFooter()
    expect(screen.getByRole('link', { name: 'Ler' })).toHaveAttribute('href', '/ler')
    expect(screen.getByRole('link', { name: 'Licença' })).toHaveAttribute(
      'href',
      'https://creativecommons.org/licenses/by/4.0/deed.pt-br',
    )
  })

  it('renders the copyright line with the given year', () => {
    renderFooter()
    expect(screen.getByText(/© 2026 Lucas Merencia/)).toBeInTheDocument()
  })
})

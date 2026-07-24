import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SiteFooter } from './SiteFooter'

describe('SiteFooter', () => {
  it('renders the wordmark and tagline', () => {
    render(<SiteFooter year={2026} />)
    expect(screen.getByText('Biblia')).toBeInTheDocument()
    expect(screen.getByText(/A Bíblia em português de hoje/)).toBeInTheDocument()
  })

  it('renders the nav links', () => {
    render(<SiteFooter year={2026} />)
    expect(screen.getByRole('link', { name: 'Ler' })).toHaveAttribute('href', '#ler')
    expect(screen.getByRole('link', { name: 'Licença' })).toHaveAttribute(
      'href',
      'https://creativecommons.org/licenses/by/4.0/deed.pt-br',
    )
  })

  it('renders the copyright line with the given year', () => {
    render(<SiteFooter year={2026} />)
    expect(screen.getByText(/© 2026 Lucas Merencia/)).toBeInTheDocument()
  })
})

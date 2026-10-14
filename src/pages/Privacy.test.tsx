import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import Privacy from './Privacy'

function renderPrivacy() {
  return render(
    <MemoryRouter>
      <Privacy theme="light" onToggleTheme={() => {}} />
    </MemoryRouter>,
  )
}

describe('Privacy policy', () => {
  it('distinguishes browser storage, offline apps and optional iCloud sync', () => {
    renderPrivacy()
    expect(screen.getByRole('heading', { name: 'Site e armazenamento no navegador' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Apps e widgets' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sincronização opcional com o iCloud' })).toBeInTheDocument()
    expect(screen.getByText(/A sincronização fica desativada por padrão/)).toBeInTheDocument()
    expect(screen.getByText(/não apaga automaticamente os dados/)).toBeInTheDocument()
  })

  it('discloses hosting and font providers instead of promising no network data', () => {
    renderPrivacy()
    expect(screen.getByText(/endereço IP e dados do navegador/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'política de privacidade da Vercel' })).toHaveAttribute(
      'href',
      'https://vercel.com/legal/privacy-notice',
    )
    expect(screen.getByRole('link', { name: 'política de privacidade do Google' })).toHaveAttribute(
      'href',
      'https://policies.google.com/privacy?hl=pt-BR',
    )
  })

  it('provides privacy contact channels for the website and apps', () => {
    renderPrivacy()
    expect(screen.getByRole('link', { name: 'repositório do site' })).toHaveAttribute(
      'href',
      'https://github.com/biblialibera/biblialibera.org/issues',
    )
    expect(screen.getByRole('link', { name: 'repositório dos apps' })).toHaveAttribute(
      'href',
      'https://github.com/biblialibera/ios/issues',
    )
    expect(screen.getByText(/não inclua dados pessoais/)).toBeInTheDocument()
  })
})

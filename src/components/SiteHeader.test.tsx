import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { SiteHeader } from './SiteHeader'

function renderHeader(props: Partial<Parameters<typeof SiteHeader>[0]> = {}) {
  return render(
    <MemoryRouter>
      <SiteHeader theme="light" onToggleTheme={() => {}} onOpenGithub={() => {}} {...props} />
    </MemoryRouter>,
  )
}

describe('SiteHeader', () => {
  it('renders the wordmark linking home', () => {
    renderHeader()
    expect(screen.getByRole('link')).toHaveAttribute('href', '/')
    expect(screen.getByText('Biblia')).toBeInTheDocument()
  })

  it('calls onToggleTheme via the theme toggle', async () => {
    const user = userEvent.setup()
    const onToggleTheme = vi.fn()
    renderHeader({ onToggleTheme })
    await user.click(screen.getByRole('button', { name: 'Alternar tema' }))
    expect(onToggleTheme).toHaveBeenCalledOnce()
  })

  it('calls onOpenGithub via the GitHub button', async () => {
    const user = userEvent.setup()
    const onOpenGithub = vi.fn()
    renderHeader({ onOpenGithub })
    await user.click(screen.getByRole('button', { name: 'GitHub' }))
    expect(onOpenGithub).toHaveBeenCalledOnce()
  })
})

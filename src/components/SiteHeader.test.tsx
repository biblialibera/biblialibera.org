import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SiteHeader } from './SiteHeader'

describe('SiteHeader', () => {
  it('renders the wordmark linking to the top anchor', () => {
    render(<SiteHeader theme="light" onToggleTheme={() => {}} onOpenGithub={() => {}} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '#top')
    expect(screen.getByText('Biblia')).toBeInTheDocument()
  })

  it('calls onToggleTheme via the theme toggle', async () => {
    const user = userEvent.setup()
    const onToggleTheme = vi.fn()
    render(<SiteHeader theme="light" onToggleTheme={onToggleTheme} onOpenGithub={() => {}} />)
    await user.click(screen.getByRole('button', { name: 'Alternar tema' }))
    expect(onToggleTheme).toHaveBeenCalledOnce()
  })

  it('calls onOpenGithub via the GitHub button', async () => {
    const user = userEvent.setup()
    const onOpenGithub = vi.fn()
    render(<SiteHeader theme="light" onToggleTheme={() => {}} onOpenGithub={onOpenGithub} />)
    await user.click(screen.getByRole('button', { name: 'GitHub' }))
    expect(onOpenGithub).toHaveBeenCalledOnce()
  })
})

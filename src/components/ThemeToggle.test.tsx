import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ThemeToggle } from './ThemeToggle'

describe('ThemeToggle', () => {
  it('shows the moon (switch to dark) when the current theme is light', () => {
    const { container } = render(<ThemeToggle theme="light" onToggle={() => {}} />)
    expect(container.querySelector('circle')).not.toBeInTheDocument()
    expect(container.querySelector('path')).toBeInTheDocument()
  })

  it('shows the sun (switch to light) when the current theme is dark', () => {
    const { container } = render(<ThemeToggle theme="dark" onToggle={() => {}} />)
    expect(container.querySelector('circle')).toBeInTheDocument()
  })

  it('calls onToggle when clicked', async () => {
    const user = userEvent.setup()
    const onToggle = vi.fn()
    render(<ThemeToggle theme="light" onToggle={onToggle} />)
    await user.click(screen.getByRole('button', { name: 'Alternar tema' }))
    expect(onToggle).toHaveBeenCalledOnce()
  })
})

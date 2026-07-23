import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { Button } from './Button'

describe('Button', () => {
  it('renders children and defaults to the primary variant', () => {
    render(<Button>Ler a Bíblia</Button>)
    const button = screen.getByRole('button', { name: 'Ler a Bíblia' })
    expect(button).toBeInTheDocument()
    expect(button).toHaveStyle({ background: 'var(--color-accent)' })
  })

  it('applies secondary and ghost variant styles', () => {
    const { rerender } = render(<Button variant="secondary">Ação</Button>)
    expect(screen.getByRole('button')).toHaveStyle({ background: 'var(--color-surface)' })

    rerender(<Button variant="ghost">Ação</Button>)
    expect(screen.getByRole('button')).toHaveStyle({ background: 'transparent' })
  })

  it('darkens on hover instead of scaling', async () => {
    const user = userEvent.setup()
    render(<Button>Ação</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveStyle({ background: 'var(--color-accent)' })

    await user.hover(button)
    expect(button).toHaveStyle({ background: 'var(--color-accent-hover)' })

    await user.unhover(button)
    expect(button).toHaveStyle({ background: 'var(--color-accent)' })
  })

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Ação</Button>)
    await user.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not call onClick when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        Ação
      </Button>,
    )
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    await user.click(button)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('renders icons alongside the label', () => {
    render(
      <Button iconLeft={<span data-testid="icon-left" />} iconRight={<span data-testid="icon-right" />}>
        Ação
      </Button>,
    )
    expect(screen.getByTestId('icon-left')).toBeInTheDocument()
    expect(screen.getByTestId('icon-right')).toBeInTheDocument()
  })
})

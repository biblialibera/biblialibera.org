import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import Landing from './Landing'

describe('Landing', () => {
  it('renders the hero headline and the live register demo', () => {
    render(<Landing theme="light" onToggleTheme={() => {}} />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('A Bíblia em português de hoje, livre para todos')
    expect(screen.getByRole('heading', { name: 'Salmo 23' })).toBeInTheDocument()
  })

  it('renders the why cards, pipeline steps and the book status table', () => {
    render(<Landing theme="light" onToggleTheme={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Linguagem de outro século' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Revisão humana' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Judas' })).toBeInTheDocument()
  })

  it('calls onToggleTheme from the header', async () => {
    const user = userEvent.setup()
    const onToggleTheme = vi.fn()
    render(<Landing theme="light" onToggleTheme={onToggleTheme} />)
    await user.click(screen.getByRole('button', { name: 'Alternar tema' }))
    expect(onToggleTheme).toHaveBeenCalledOnce()
  })

  it('lets the visitor switch the demo to the simple register', async () => {
    const user = userEvent.setup()
    render(<Landing theme="light" onToggleTheme={() => {}} />)
    await user.click(screen.getByRole('radio', { name: 'Simples' }))
    expect(screen.getByText(/nada me falta\./)).toBeInTheDocument()
  })
})

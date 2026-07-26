import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { RegisterDemo } from './RegisterDemo'

describe('RegisterDemo', () => {
  it('shows the formal register by default', () => {
    render(<RegisterDemo />)
    expect(screen.getByText(/nada me faltará/)).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Português' })).toHaveAttribute('aria-checked', 'true')
  })

  it('switches to the original text and back', async () => {
    const user = userEvent.setup()
    render(<RegisterDemo />)

    await user.click(screen.getByRole('radio', { name: /Original/ }))
    expect(screen.getByText(/לְדָוִ֑ד/)).toBeInTheDocument()
    expect(screen.queryByText(/nada me faltará/)).not.toBeInTheDocument()

    await user.click(screen.getByRole('radio', { name: 'Português' }))
    expect(screen.getByText(/nada me faltará/)).toBeInTheDocument()
  })

  it('renders the divine name and the footnote apparatus', () => {
    render(<RegisterDemo />)
    expect(screen.getAllByText('Senhor').length).toBeGreaterThan(0)
    expect(screen.getByText('Ou: "pelo vale da escuridão profunda".')).toBeInTheDocument()
  })

  it('shows the review status of the passage', () => {
    render(<RegisterDemo />)
    expect(screen.getByText('Verificado')).toBeInTheDocument()
  })
})

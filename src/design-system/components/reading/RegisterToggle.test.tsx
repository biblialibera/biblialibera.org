import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { RegisterToggle } from './RegisterToggle'

describe('RegisterToggle', () => {
  it('renders Português and Original by default, marking the active one', () => {
    render(<RegisterToggle value="formal" />)
    expect(screen.getByRole('radiogroup', { name: 'Registro de tradução' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Português' })).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByRole('radio', { name: 'Original' })).toHaveAttribute('aria-checked', 'false')
  })

  it('reports the chosen value without owning the selection state', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<RegisterToggle value="formal" onChange={onChange} />)
    await user.click(screen.getByRole('radio', { name: 'Original' }))
    expect(onChange).toHaveBeenCalledWith('original')
    // the toggle does not manage its own state; it stays controlled by the host
    expect(screen.getByRole('radio', { name: 'Português' })).toHaveAttribute('aria-checked', 'true')
  })

  it('accepts custom options', () => {
    render(
      <RegisterToggle
        value="original"
        options={[
          { value: 'formal', label: 'Português' },
          { value: 'original', label: 'Original' },
        ]}
      />,
    )
    expect(screen.getByRole('radio', { name: 'Original' })).toHaveAttribute('aria-checked', 'true')
  })
})

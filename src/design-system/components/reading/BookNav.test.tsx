import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { BookNav } from './BookNav'

describe('BookNav', () => {
  it('renders the default books grouped by testament', () => {
    render(<BookNav />)
    expect(screen.getByText('Antigo Testamento')).toBeInTheDocument()
    expect(screen.getByText('Novo Testamento')).toBeInTheDocument()
    expect(screen.getByText('Jonas')).toBeInTheDocument()
    expect(screen.getByText('Judas')).toBeInTheDocument()
  })

  it('renders a chapter grid sized to the selected book', () => {
    render(<BookNav book="Jonah" chapter={2} />)
    expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '5' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'true')
  })

  it('reports the selected edition, book and chapter', async () => {
    const user = userEvent.setup()
    const onEditionChange = vi.fn()
    const onSelectBook = vi.fn()
    const onSelectChapter = vi.fn()
    render(
      <BookNav
        onEditionChange={onEditionChange}
        onSelectBook={onSelectBook}
        onSelectChapter={onSelectChapter}
        book="Jonah"
      />,
    )

    await user.click(screen.getByRole('button', { name: /Protestante/ }))
    expect(onEditionChange).toHaveBeenCalledWith('protestant')

    await user.click(screen.getByText('Judas'))
    expect(onSelectBook).toHaveBeenCalledWith('Jude')

    await user.click(screen.getByRole('button', { name: '3' }))
    expect(onSelectChapter).toHaveBeenCalledWith(3)
  })
})

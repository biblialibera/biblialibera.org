import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ChapterView } from './ChapterView'
import type { ReaderBook } from './readerData'

const book: ReaderBook = {
  code: 'Jonah',
  name: 'Jonas',
  abbrev: 'Jn',
  slug: 'jonas',
  status: { formal: 'checked', simple: 'checked' },
  chapters: [
    {
      chapter: 1,
      formal: [
        { verse: 1, text: 'A palavra do SENHOR veio a Jonas.', footnotes: [] },
        { verse: 2, text: 'Levanta-te e vai a Nínive.', footnotes: ['Nínive: capital da Assíria.'] },
      ],
      simple: [
        { verse: 1, text: 'O SENHOR falou com Jonas.', footnotes: [] },
        { verse: 2, text: 'Vá até a cidade de Nínive.', footnotes: [] },
      ],
    },
  ],
}

describe('ChapterView', () => {
  it('renders the chapter heading and the selected register', () => {
    render(<ChapterView book={book} chapter={1} register="formal" onRegisterChange={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Jonas 1' })).toBeInTheDocument()
    expect(screen.getByText(/Levanta-te e vai a Nínive/)).toBeInTheDocument()
    expect(screen.queryByText(/Vá até a cidade de Nínive/)).not.toBeInTheDocument()
  })

  it('swaps the text when the register changes', () => {
    const { rerender } = render(
      <ChapterView book={book} chapter={1} register="formal" onRegisterChange={() => {}} />,
    )
    rerender(<ChapterView book={book} chapter={1} register="simple" onRegisterChange={() => {}} />)
    expect(screen.getByText(/Vá até a cidade de Nínive/)).toBeInTheDocument()
    expect(screen.queryByText(/Levanta-te e vai a Nínive/)).not.toBeInTheDocument()
  })

  it('reports the register choice from the toggle', () => {
    const onRegisterChange = vi.fn()
    render(<ChapterView book={book} chapter={1} register="formal" onRegisterChange={onRegisterChange} />)
    fireEvent.click(screen.getByText('Simples'))
    expect(onRegisterChange).toHaveBeenCalledWith('simple')
  })

  it('renders footnotes for the chapter, anchored per register', () => {
    const { container } = render(
      <ChapterView book={book} chapter={1} register="formal" onRegisterChange={() => {}} />,
    )
    expect(screen.getByText(/capital da Assíria/)).toBeInTheDocument()
    expect(container.querySelector('a[href="#formal-nota-1"]')).not.toBeNull()
  })

  it('shows the review status seal', () => {
    render(<ChapterView book={book} chapter={1} register="formal" onRegisterChange={() => {}} />)
    expect(screen.getByText('Verificado')).toBeInTheDocument()
  })
})

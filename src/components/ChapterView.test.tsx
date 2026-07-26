import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ChapterView } from './ChapterView'
import type { ReaderBook } from './readerData'

const book: ReaderBook = {
  code: 'Jonah',
  name: 'Jonas',
  abbrev: 'Jn',
  slug: 'jonas',
  status: { formal: 'checked' },
  original: { corpus: 'wlc', edition: 'Westminster Leningrad Codex', language: 'Hebraico', dir: 'rtl' },
  chapters: [
    {
      chapter: 1,
      formal: [
        { verse: 1, text: 'A palavra do SENHOR veio a Jonas.', footnotes: [] },
        { verse: 2, text: 'Levanta-te e vai a Nínive.', footnotes: ['Nínive: capital da Assíria.'] },
      ],
      original: [
        { verse: 1, text: 'וַיְהִי דְּבַר־יְהוָה אֶל־יוֹנָה' },
        { verse: 2, text: 'קוּם לֵךְ אֶל־נִינְוֵה' },
      ],
    },
  ],
}

describe('ChapterView', () => {
  it('renders the chapter heading and the selected register', () => {
    render(<ChapterView book={book} chapter={1} view="formal" onViewChange={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Jonas 1' })).toBeInTheDocument()
    expect(screen.getByText(/Levanta-te e vai a Nínive/)).toBeInTheDocument()
    expect(screen.queryByText(/Vá até a cidade de Nínive/)).not.toBeInTheDocument()
  })

  it('swaps the text when the view changes', () => {
    const { rerender } = render(<ChapterView book={book} chapter={1} view="formal" onViewChange={() => {}} />)
    rerender(<ChapterView book={book} chapter={1} view="original" onViewChange={() => {}} />)
    expect(screen.getByText('קוּם לֵךְ אֶל־נִינְוֵה')).toBeInTheDocument()
    expect(screen.queryByText(/Levanta-te e vai a Nínive/)).not.toBeInTheDocument()
  })

  it('offers the original as a second view, labelled with its language', () => {
    render(<ChapterView book={book} chapter={1} view="formal" onViewChange={() => {}} />)
    expect(screen.getByRole('radio', { name: 'Original (Hebraico)' })).toBeInTheDocument()
  })

  it('reports the view choice from the toggle', () => {
    const onViewChange = vi.fn()
    render(<ChapterView book={book} chapter={1} view="formal" onViewChange={onViewChange} />)
    fireEvent.click(screen.getByRole('radio', { name: 'Original (Hebraico)' }))
    expect(onViewChange).toHaveBeenCalledWith('original')
  })

  it('renders footnotes for the register, anchored per register', () => {
    const { container } = render(<ChapterView book={book} chapter={1} view="formal" onViewChange={() => {}} />)
    expect(screen.getByText(/capital da Assíria/)).toBeInTheDocument()
    expect(container.querySelector('a[href="#formal-nota-1"]')).not.toBeNull()
  })

  it('shows the review seal for a register', () => {
    render(<ChapterView book={book} chapter={1} view="formal" onViewChange={() => {}} />)
    expect(screen.getByText('Verificado')).toBeInTheDocument()
  })

  it('renders the original text right-to-left with the edition citation and no seal', () => {
    const { container } = render(<ChapterView book={book} chapter={1} view="original" onViewChange={() => {}} />)
    expect(screen.getByText('קוּם לֵךְ אֶל־נִינְוֵה')).toBeInTheDocument()
    expect(container.querySelector('[dir="rtl"]')).not.toBeNull()
    expect(screen.getByText('Westminster Leningrad Codex')).toBeInTheDocument()
    expect(screen.queryByText('Verificado')).not.toBeInTheDocument()
  })
})

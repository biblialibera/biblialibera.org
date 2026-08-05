import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ChapterView } from './ChapterView'
import type { ReaderBook, View } from './readerData'
import type { VerseClick, VerseRange } from './verseSelection'
import { parseVerseHash } from './verseSelection'

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

interface Options {
  view?: View
  onViewChange?: (view: View) => void
  selection?: VerseRange | null
  onSelectVerse?: (verse: number, click: VerseClick) => void
}

function chapter({
  view = 'formal',
  onViewChange = () => {},
  selection = null,
  onSelectVerse = () => {},
}: Options = {}) {
  return (
    <ChapterView
      book={book}
      chapter={1}
      view={view}
      onViewChange={onViewChange}
      selection={selection}
      onSelectVerse={onSelectVerse}
    />
  )
}

const renderChapter = (options: Options = {}) => render(chapter(options))

const verseEl = (container: HTMLElement, verse: number) => container.querySelector(`#v${verse}`) as HTMLElement

describe('ChapterView', () => {
  it('renders the chapter heading and the selected register', () => {
    renderChapter()
    expect(screen.getByRole('heading', { name: 'Jonas 1' })).toBeInTheDocument()
    expect(screen.getByText(/Levanta-te e vai a Nínive/)).toBeInTheDocument()
    expect(screen.queryByText(/Vá até a cidade de Nínive/)).not.toBeInTheDocument()
  })

  it('swaps the text when the view changes', () => {
    const { rerender } = renderChapter()
    rerender(chapter({ view: 'original' }))
    expect(screen.getByText('קוּם לֵךְ אֶל־נִינְוֵה')).toBeInTheDocument()
    expect(screen.queryByText(/Levanta-te e vai a Nínive/)).not.toBeInTheDocument()
  })

  it('offers the original as a second view, labelled with its language', () => {
    renderChapter()
    expect(screen.getByRole('radio', { name: 'Original (Hebraico)' })).toBeInTheDocument()
  })

  it('reports the view choice from the toggle', () => {
    const onViewChange = vi.fn()
    renderChapter({ onViewChange })
    fireEvent.click(screen.getByRole('radio', { name: 'Original (Hebraico)' }))
    expect(onViewChange).toHaveBeenCalledWith('original')
  })

  it('renders footnotes for the register, anchored per register', () => {
    const { container } = renderChapter()
    expect(screen.getByText(/capital da Assíria/)).toBeInTheDocument()
    expect(container.querySelector('a[href="#fn-formal-1"]')).not.toBeNull()
    expect(container.querySelector('#fn-formal-1')).not.toBeNull()
  })

  // Reading a note is a detour: there has to be a way back to the verse that
  // sent you there, naming the verse so the way back is not a guess.
  it('links each footnote back to the verse that carries its marker', () => {
    renderChapter()
    const back = screen.getByRole('link', { name: 'Voltar ao versículo 2' })
    expect(back).toHaveAttribute('href', '#fnref-formal-1')
  })

  it('anchors the marker the footnote links back to', () => {
    const { container } = renderChapter()
    expect(container.querySelector('#fnref-formal-1')).not.toBeNull()
  })

  // The way back must not be readable as a verse selection, or following it
  // would drop the passage the reader had highlighted.
  it('uses a way-back anchor that cannot be parsed as a verse', () => {
    renderChapter()
    const href = screen.getByRole('link', { name: 'Voltar ao versículo 2' }).getAttribute('href') ?? ''
    expect(parseVerseHash(href)).toBeUndefined()
  })

  it('shows the review seal for a register', () => {
    renderChapter()
    expect(screen.getByText('Verificado')).toBeInTheDocument()
  })

  it('renders the original text right-to-left with the edition citation and no seal', () => {
    const { container } = renderChapter({ view: 'original' })
    expect(screen.getByText('קוּם לֵךְ אֶל־נִינְוֵה')).toBeInTheDocument()
    expect(container.querySelector('[dir="rtl"]')).not.toBeNull()
    expect(screen.getByText('Westminster Leningrad Codex')).toBeInTheDocument()
    expect(screen.queryByText('Verificado')).not.toBeInTheDocument()
  })
})

describe('ChapterView verse selection', () => {
  it('gives every verse an anchor id so #v2 resolves', () => {
    const { container } = renderChapter()
    expect(verseEl(container, 1)).not.toBeNull()
    expect(verseEl(container, 2)).not.toBeNull()
  })

  it('anchors the original register verses too', () => {
    const { container } = renderChapter({ view: 'original' })
    expect(verseEl(container, 2)).not.toBeNull()
  })

  it('reports a plain click on a verse', () => {
    const onSelectVerse = vi.fn()
    const { container } = renderChapter({ onSelectVerse })
    fireEvent.click(verseEl(container, 2))
    expect(onSelectVerse).toHaveBeenCalledWith(2, { shiftKey: false, touch: false })
  })

  it('reports the shift modifier so the caller can extend a range', () => {
    const onSelectVerse = vi.fn()
    const { container } = renderChapter({ onSelectVerse })
    fireEvent.click(verseEl(container, 2), { shiftKey: true })
    expect(onSelectVerse).toHaveBeenCalledWith(2, { shiftKey: true, touch: false })
  })

  it('reports clicks in the original register too', () => {
    const onSelectVerse = vi.fn()
    const { container } = renderChapter({ view: 'original', onSelectVerse })
    fireEvent.click(verseEl(container, 1))
    expect(onSelectVerse).toHaveBeenCalledWith(1, { shiftKey: false, touch: false })
  })

  // Verses stay prose: they are not widgets, so a screen reader still reads
  // them sentence by sentence and Psalm 119 does not become 176 tab stops.
  it('leaves verses as text rather than turning them into buttons', () => {
    const { container } = renderChapter({ selection: { start: 2, end: 2 } })
    expect(verseEl(container, 2)).not.toHaveAttribute('role')
    expect(verseEl(container, 2)).not.toHaveAttribute('tabindex')
  })

  // A footnote marker sits inside the verse paragraph. Clicking it must jump
  // to the note, not quietly reselect the verse underneath it.
  it('does not select the verse when a footnote marker is clicked', () => {
    const onSelectVerse = vi.fn()
    renderChapter({ onSelectVerse })
    fireEvent.click(screen.getByRole('link', { name: 'nota 1' }))
    expect(onSelectVerse).not.toHaveBeenCalled()
  })

  // Dragging across a verse to copy it ends in a click; honouring that click
  // would change the selection every time someone copies a phrase.
  it('does not select the verse while text is being highlighted', () => {
    const onSelectVerse = vi.fn()
    const { container } = renderChapter({ onSelectVerse })
    const getSelection = vi.spyOn(window, 'getSelection').mockReturnValue({ isCollapsed: false } as Selection)
    fireEvent.click(verseEl(container, 2))
    expect(onSelectVerse).not.toHaveBeenCalled()
    getSelection.mockRestore()
  })

  it('marks only the verses in the range as current', () => {
    const { container } = renderChapter({ selection: { start: 2, end: 2 } })
    expect(verseEl(container, 1)).not.toHaveAttribute('aria-current')
    expect(verseEl(container, 2)).toHaveAttribute('aria-current', 'true')
  })

  it('highlights the selected verse and leaves the others plain', () => {
    const { container } = renderChapter({ selection: { start: 2, end: 2 } })
    expect(verseEl(container, 2).className).toContain('bg-[var(--color-selection)]')
    expect(verseEl(container, 1).className).not.toContain('bg-[var(--color-selection)]')
  })

  it('highlights every verse of a range', () => {
    const { container } = renderChapter({ selection: { start: 1, end: 2 } })
    expect(verseEl(container, 1).className).toContain('bg-[var(--color-selection)]')
    expect(verseEl(container, 2).className).toContain('bg-[var(--color-selection)]')
  })

  // The original register keeps its own font, size and direction classes: the
  // highlight is appended to them, it does not replace them.
  it('keeps the original register styling when a verse is highlighted', () => {
    const { container } = renderChapter({ view: 'original', selection: { start: 1, end: 1 } })
    const verse = verseEl(container, 1)
    expect(verse.className).toContain('bg-[var(--color-selection)]')
    expect(verse.className).toContain('text-[var(--text-xl)]')
  })
})

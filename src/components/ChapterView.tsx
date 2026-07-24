import { Badge } from '../design-system/components/core'
import { Footnote, FootnoteList, RegisterToggle, ReviewSeal, VerseBlock } from '../design-system/components/reading'
import type { ReaderBook, View } from './readerData'
import { renderVerseText } from './scriptureText'

export interface ChapterViewProps {
  book: ReaderBook
  chapter: number
  view: View
  onViewChange: (view: View) => void
}

/**
 * ChapterView: one chapter of a loaded book in the selected view. The two pt
 * registers (formal/simple) render with the note apparatus and the review
 * seal; the original view renders the source text plain (no divine-name or
 * footnote treatment, which are pt-specific), in its own reading direction
 * and font, with the edition citation in place of the seal.
 */
export function ChapterView({ book, chapter, view, onViewChange }: ChapterViewProps) {
  const current = book.chapters.find((c) => c.chapter === chapter)
  const original = book.original

  const options = [
    { value: 'formal', label: 'Formal' },
    { value: 'simple', label: 'Simples' },
    ...(original ? [{ value: 'original', label: `Original (${original.language})` }] : []),
  ]

  return (
    <div className="mx-auto max-w-[var(--reading-measure)]">
      <div className="mb-[var(--space-6)] flex flex-wrap items-center justify-between gap-[var(--space-4)] border-b border-[var(--color-border)] pb-[var(--space-5)]">
        <h1 className="m-0 font-serif text-[var(--text-2xl)] text-[var(--color-text)]">
          {book.name} {chapter}
        </h1>
        <div className="flex flex-wrap items-center gap-[var(--space-4)]">
          <RegisterToggle value={view} onChange={(value) => onViewChange(value as View)} options={options} />
          {view === 'original' ? (
            original && <Badge>{original.edition}</Badge>
          ) : (
            <ReviewSeal status={book.status[view]} size="sm" />
          )}
        </div>
      </div>

      {view === 'original' ? (
        <OriginalChapter verses={current?.original ?? []} dir={original?.dir ?? 'ltr'} />
      ) : (
        <RegisterChapter verses={current?.[view] ?? []} idPrefix={view} />
      )}
    </div>
  )
}

interface RegisterChapterProps {
  verses: { verse: number; text: string; footnotes: string[] }[]
  idPrefix: string
}

function RegisterChapter({ verses, idPrefix }: RegisterChapterProps) {
  let noteNumber = 1
  const rendered = verses.map((verse) => {
    const result = renderVerseText(verse.text, verse.footnotes, idPrefix, noteNumber)
    noteNumber += result.notes.length
    return { verse: verse.verse, ...result }
  })
  const notes = rendered.flatMap((v) => v.notes)

  return (
    <div key={idPrefix}>
      {rendered.map(({ verse, body }) => (
        <VerseBlock key={verse} number={verse}>
          {body}
        </VerseBlock>
      ))}
      {notes.length > 0 && (
        <FootnoteList>
          {notes.map((note) => (
            <Footnote key={note.number} n={note.number} id={`${idPrefix}-nota-${note.number}`}>
              {note.text}
            </Footnote>
          ))}
        </FootnoteList>
      )}
    </div>
  )
}

interface OriginalChapterProps {
  verses: { verse: number; text: string }[]
  dir: 'rtl' | 'ltr'
}

function OriginalChapter({ verses, dir }: OriginalChapterProps) {
  if (verses.length === 0) {
    return (
      <p className="font-sans text-[var(--text-sm)] text-[var(--color-text-muted)]">
        Texto original não disponível para este capítulo.
      </p>
    )
  }

  return (
    <div dir={dir} className="font-[family-name:var(--font-original)]">
      {verses.map((v) => (
        <p
          key={v.verse}
          className="m-0 mb-[var(--space-4)] text-[var(--text-xl)] leading-[var(--leading-relaxed)] text-[var(--color-text-verse)]"
        >
          <sup className="me-[0.35em] align-super font-mono text-[var(--text-xs)] text-[var(--color-verse-number)]">
            {v.verse}
          </sup>
          {v.text}
        </p>
      ))}
    </div>
  )
}

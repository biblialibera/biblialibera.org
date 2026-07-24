import { Footnote, FootnoteList, RegisterToggle, ReviewSeal, VerseBlock } from '../design-system/components/reading'
import type { ReaderBook, Register } from './readerData'
import { renderVerseText } from './scriptureText'

export interface ChapterViewProps {
  book: ReaderBook
  chapter: number
  register: Register
  onRegisterChange: (register: Register) => void
}

/**
 * ChapterView: one chapter of a loaded book in the selected register. The
 * live sibling of RegisterDemo, but over a full book: the register toggle
 * swaps the text in place, footnotes are numbered across the chapter and
 * anchored per register, and the review seal reflects the book's status.
 */
export function ChapterView({ book, chapter, register, onRegisterChange }: ChapterViewProps) {
  const current = book.chapters.find((c) => c.chapter === chapter)
  const verses = current ? current[register] : []

  let noteNumber = 1
  const rendered = verses.map((verse) => {
    const result = renderVerseText(verse.text, verse.footnotes, register, noteNumber)
    noteNumber += result.notes.length
    return { verse: verse.verse, ...result }
  })
  const notes = rendered.flatMap((v) => v.notes)

  return (
    <div className="mx-auto max-w-[var(--reading-measure)]">
      <div className="mb-[var(--space-6)] flex flex-wrap items-center justify-between gap-[var(--space-4)] border-b border-[var(--color-border)] pb-[var(--space-5)]">
        <h1 className="m-0 font-serif text-[var(--text-2xl)] text-[var(--color-text)]">
          {book.name} {chapter}
        </h1>
        <div className="flex items-center gap-[var(--space-4)]">
          <RegisterToggle value={register} onChange={(value) => onRegisterChange(value as Register)} />
          <ReviewSeal status={book.status[register]} size="sm" />
        </div>
      </div>

      <div key={register}>
        {rendered.map(({ verse, body }) => (
          <VerseBlock key={verse} number={verse}>
            {body}
          </VerseBlock>
        ))}
        {notes.length > 0 && (
          <FootnoteList>
            {notes.map((note) => (
              <Footnote key={note.number} n={note.number} id={`${register}-nota-${note.number}`}>
                {note.text}
              </Footnote>
            ))}
          </FootnoteList>
        )}
      </div>
    </div>
  )
}

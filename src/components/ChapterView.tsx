import { Badge } from '../design-system/components/core'
import { RegisterToggle, ReviewSeal, VerseBlock } from '../design-system/components/reading'
import type { ReaderBook, View } from './readerData'
import { PassageFootnotes } from './PassageFootnotes'
import type { PassageVerse } from './scriptureText'
import { renderPassage } from './scriptureText'
import { verseInteractionProps } from './verseInteraction'
import type { VerseClick, VerseRange } from './verseSelection'
import { isVerseSelected } from './verseSelection'

export interface ChapterViewProps {
  book: ReaderBook
  chapter: number
  view: View
  onViewChange: (view: View) => void
  /** The verses currently selected, highlighted and reflected in the URL. */
  selection: VerseRange | null
  onSelectVerse: (verse: number, click: VerseClick) => void
}

/**
 * ChapterView: one chapter of a loaded book in the selected view. The pt
 * text renders with the note apparatus and the review seal; the original
 * view renders the source text plain (no divine-name or footnote treatment,
 * which are pt-specific), in its own reading direction and font, with the
 * edition citation in place of the seal.
 */
export function ChapterView({ book, chapter, view, onViewChange, selection, onSelectVerse }: ChapterViewProps) {
  const current = book.chapters.find((c) => c.chapter === chapter)
  const original = book.original

  const options = [
    { value: 'formal', label: 'Português' },
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
        <OriginalChapter
          verses={current?.original ?? []}
          dir={original?.dir ?? 'ltr'}
          selection={selection}
          onSelectVerse={onSelectVerse}
        />
      ) : (
        <RegisterChapter
          verses={current?.[view] ?? []}
          idPrefix={view}
          selection={selection}
          onSelectVerse={onSelectVerse}
        />
      )}
    </div>
  )
}

interface RegisterChapterProps {
  verses: PassageVerse[]
  idPrefix: string
  selection: VerseRange | null
  onSelectVerse: (verse: number, click: VerseClick) => void
}

function RegisterChapter({ verses, idPrefix, selection, onSelectVerse }: RegisterChapterProps) {
  const { rendered, notes } = renderPassage(verses, idPrefix)

  return (
    <div key={idPrefix}>
      {rendered.map(({ verse, body }) => (
        <VerseBlock
          key={verse}
          number={verse}
          {...verseInteractionProps({
            verse,
            selected: isVerseSelected(selection, verse),
            onSelect: onSelectVerse,
          })}
        >
          {body}
        </VerseBlock>
      ))}
      <PassageFootnotes notes={notes} idPrefix={idPrefix} />
    </div>
  )
}

interface OriginalChapterProps {
  verses: { verse: number; text: string }[]
  dir: 'rtl' | 'ltr'
  selection: VerseRange | null
  onSelectVerse: (verse: number, click: VerseClick) => void
}

function OriginalChapter({ verses, dir, selection, onSelectVerse }: OriginalChapterProps) {
  if (verses.length === 0) {
    return (
      <p className="font-sans text-[var(--text-sm)] text-[var(--color-text-muted)]">
        Texto original não disponível para este capítulo.
      </p>
    )
  }

  return (
    <div dir={dir} className="font-[family-name:var(--font-original)]">
      {verses.map((v) => {
        const props = verseInteractionProps({
          verse: v.verse,
          selected: isVerseSelected(selection, v.verse),
          onSelect: onSelectVerse,
        })
        return (
          <p
            key={v.verse}
            {...props}
            className={`m-0 mb-[var(--space-4)] text-[var(--text-xl)] leading-[var(--leading-relaxed)] text-[var(--color-text-verse)] ${props.className}`}
          >
            <sup className="me-[0.35em] align-super font-mono text-[var(--text-xs)] text-[var(--color-verse-number)]">
              {v.verse}
            </sup>
            {v.text}
          </p>
        )
      })}
    </div>
  )
}

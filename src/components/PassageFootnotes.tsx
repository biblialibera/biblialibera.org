import { Footnote, FootnoteList } from '../design-system/components/reading'
import type { PassageNote } from './scriptureText'
import { footnoteElementId, footnoteRefElementId } from './verseSelection'

export interface PassageFootnotesProps {
  notes: PassageNote[]
  idPrefix: string
}

/**
 * PassageFootnotes: the notes at the foot of a passage, each linking back to
 * the marker it came from. The `fn-`/`fnref-` ids are the other half of what
 * `renderVerseText` emits inline, so the two must be renamed together.
 */
export function PassageFootnotes({ notes, idPrefix }: PassageFootnotesProps) {
  if (notes.length === 0) return null

  return (
    <FootnoteList>
      {notes.map((note) => (
        <Footnote key={note.number} n={note.number} id={footnoteElementId(idPrefix, note.number)}>
          {note.text}{' '}
          <a
            href={`#${footnoteRefElementId(idPrefix, note.number)}`}
            aria-label={`Voltar ao versículo ${note.verse}`}
            className="whitespace-nowrap font-sans text-[var(--color-footnote-marker)] no-underline hover:underline"
          >
            ↩
          </a>
        </Footnote>
      ))}
    </FootnoteList>
  )
}

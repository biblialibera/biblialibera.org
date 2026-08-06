import type { ReactNode } from 'react'
import { DivineName, FootnoteRef } from '../design-system/components/reading'
import { footnoteElementId, footnoteRefElementId } from './verseSelection'

const DIVINE_NAMES: Record<string, string> = {
  SENHOR: 'Senhor',
  DEUS: 'Deus',
}

const DIVINE_NAME_PATTERN = new RegExp(`\\b(${Object.keys(DIVINE_NAMES).join('|')})\\b`, 'g')

export interface RenderedVerse {
  body: ReactNode[]
  /** Footnotes for this verse, paired with the ref number used inline. */
  notes: { number: number; text: string }[]
}

/**
 * renderVerseText: turns a bundled Verse's clean text + footnotes array
 * (from the `biblialibera` package: markers and italics already stripped)
 * into JSX: the divine name (SENHOR/DEUS) gets the small-caps treatment via
 * <DivineName>, and each footnote becomes a numbered <FootnoteRef> at the
 * end of the verse, since the package does not carry the original inline
 * marker position. `nextNumber` lets footnote numbers keep counting across
 * the verses of a passage; `idPrefix` scopes anchor ids so multiple views
 * can render on the same page without collisions. Footnote anchors carry an
 * `fn-` prefix so jumping to one is never mistaken for a verse selection,
 * which lives in the same location hash; the marker itself is anchored
 * `fnref-` so the note at the foot of the chapter can link back to it.
 */
export function renderVerseText(text: string, footnotes: string[], idPrefix: string, nextNumber: number): RenderedVerse {
  const body: ReactNode[] = text
    .split(DIVINE_NAME_PATTERN)
    .map((part, i) => (i % 2 === 1 ? <DivineName key={`name-${i}`}>{DIVINE_NAMES[part]}</DivineName> : part))

  const notes = footnotes.map((noteText, i) => ({ number: nextNumber + i, text: noteText }))
  for (const note of notes) {
    // The id sits on a wrapper: FootnoteRef takes its own props, and this keeps
    // the design system component as it came.
    body.push(
      <span key={`ref-${note.number}`} id={footnoteRefElementId(idPrefix, note.number)}>
        <FootnoteRef n={note.number} href={`#${footnoteElementId(idPrefix, note.number)}`} />
      </span>,
    )
  }

  return { body, notes }
}

export interface PassageVerse {
  verse: number
  text: string
  footnotes: string[]
}

export interface PassageNote {
  number: number
  text: string
  /** The verse the note hangs off, which its back-link names. */
  verse: number
}

/**
 * Renders every verse of a passage, numbering the notes continuously across
 * them, and gathers those notes for `PassageFootnotes`.
 */
export function renderPassage(verses: PassageVerse[], idPrefix: string) {
  let nextNumber = 1
  const rendered = verses.map((verse) => {
    const result = renderVerseText(verse.text, verse.footnotes, idPrefix, nextNumber)
    nextNumber += result.notes.length
    return { verse: verse.verse, ...result }
  })

  return {
    rendered,
    notes: rendered.flatMap((v) => v.notes.map((note) => ({ ...note, verse: v.verse }))),
  }
}

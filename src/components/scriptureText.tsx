import type { ReactNode } from 'react'
import { DivineName, FootnoteRef } from '../design-system/components/reading'

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
 * can render on the same page without collisions.
 */
export function renderVerseText(text: string, footnotes: string[], idPrefix: string, nextNumber: number): RenderedVerse {
  const body: ReactNode[] = text
    .split(DIVINE_NAME_PATTERN)
    .map((part, i) => (i % 2 === 1 ? <DivineName key={`name-${i}`}>{DIVINE_NAMES[part]}</DivineName> : part))

  const notes = footnotes.map((noteText, i) => ({ number: nextNumber + i, text: noteText }))
  for (const note of notes) {
    body.push(<FootnoteRef key={`ref-${note.number}`} n={note.number} href={`#${idPrefix}-nota-${note.number}`} />)
  }

  return { body, notes }
}

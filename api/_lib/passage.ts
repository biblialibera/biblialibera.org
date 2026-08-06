/**
 * The passage a link preview is about, resolved from the URL a reader shared.
 *
 * The chapter text is fetched, not imported: see scripts/build-og-text.mjs for
 * why (the reader data is 14MB and an @vercel/og function bundle caps at
 * 500KB). Every function that needs text goes through `loadChapter`, and the
 * fetch is injectable so the tests and the local card preview can read the
 * same files off the disk.
 */

import type { VerseRange } from '../../src/components/verseSelection.js'
import { passageReference } from '../../src/components/verseSelection.js'

export type Status = 'draft' | 'checked' | 'reviewed'

/** One file of public/og/<slug>/<chapter>.json. */
export interface ChapterText {
  book: string
  abbrev: string
  slug: string
  chapter: number
  status: Status
  verses: { n: number; t: string }[]
}

export interface Passage {
  /** "João 3:16-18", or "João 3" when the link names no verses. */
  reference: string
  text: string
  status: Status
  bookName: string
  chapter: number
  /** The verses actually found, which is not always the ones asked for. */
  range: VerseRange | null
}

export type Fetch = (url: string) => Promise<{ ok: boolean; json: () => Promise<unknown> }>

/** The chapter text behind a reader path, or null when there is no such chapter. */
export async function loadChapter(
  origin: string,
  slug: string,
  chapter: number,
  fetchImpl: Fetch,
): Promise<ChapterText | null> {
  if (!/^[a-z0-9-]+$/.test(slug) || !Number.isSafeInteger(chapter) || chapter < 1) return null

  try {
    const response = await fetchImpl(`${origin}/og/${slug}/${chapter}.json`)
    if (!response.ok) return null
    return (await response.json()) as ChapterText
  } catch {
    // A preview is a nicety: a network hiccup here must not take the page down.
    return null
  }
}

/**
 * The passage a range names inside a chapter.
 *
 * A range that names verses the chapter does not have (a link made before a
 * verse boundary moved, or one typed by hand) falls back to the chapter as a
 * whole rather than to a reference that does not match the text underneath it:
 * the preview would otherwise quote one passage and label it another.
 */
export function buildPassage(chapter: ChapterText, range: VerseRange | null): Passage {
  const selected = range ? chapter.verses.filter((v) => v.n >= range.start && v.n <= range.end) : []
  const verses = selected.length > 0 ? selected : chapter.verses
  const found = selected.length > 0 && range ? { start: verses[0].n, end: verses[verses.length - 1].n } : null

  return {
    reference: passageReference(chapter.book, chapter.chapter, found),
    text: verses.map((v) => v.t).join(' '),
    status: chapter.status,
    bookName: chapter.book,
    chapter: chapter.chapter,
    range: found,
  }
}

/**
 * Cuts text to `max` characters on a word boundary. Both the card and the
 * preview description quote a passage that can run for a whole chapter, and a
 * word sliced in half reads as a bug rather than as an excerpt.
 */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text

  const cut = text.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:]+$/, '')}...`
}

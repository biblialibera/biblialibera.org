import indexData from '../data/themes/index.json'
import type { ChapterId } from './readerData'
import type { VerseId } from './verseSelection'

/** One verse inside a curated passage. */
export interface ThemeVerse {
  verse: VerseId
  text: string
}

/** A passage cited by a theme, with its text already resolved at build time. */
export interface ThemePassage {
  /** Display label, e.g. "1 Coríntios 13:4-7". */
  reference: string
  book: string
  abbrev: string
  bookSlug: string
  chapter: ChapterId
  start: VerseId
  end: VerseId
  /**
   * The editions this passage can be opened in. Every curated passage today
   * reads the same in both, and the themes build refuses to emit one that does
   * not; a book only one edition carries would land here as a single key.
   */
  editions: string[]
  verses: ThemeVerse[]
}

export interface Theme {
  slug: string
  name: string
  summary: string
  passages: ThemePassage[]
}

/** Light entry: enough to list the themes without loading any passage text. */
export interface ThemeIndexEntry {
  slug: string
  name: string
  summary: string
  passageCount: number
  verseCount: number
  references: string[]
}

export const themeIndex = indexData as ThemeIndexEntry[]

export function themeBySlug(slug: string): ThemeIndexEntry | undefined {
  return themeIndex.find((t) => t.slug === slug)
}

// index.json is imported statically above, so exclude it: the glob only owns
// the per-theme chunks.
const themeLoaders = import.meta.glob([
  '../data/themes/*.json',
  '!../data/themes/index.json',
]) as Record<string, () => Promise<{ default: Theme }>>

/** Lazy-load one theme's passages (each theme is its own chunk). */
export async function loadTheme(slug: string): Promise<Theme> {
  const loader = themeLoaders[`../data/themes/${slug}.json`]
  if (!loader) throw new Error(`theme not found: ${slug}`)
  return (await loader()).default
}

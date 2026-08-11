import type { NavGroup } from '../design-system/components/reading'
import indexData from '../data/reader/index.json'
import type { VerseId } from './verseSelection'

export type Register = 'formal'
/** What the reader can show: the pt register plus the original text. */
export type View = Register | 'original'
export type Status = 'draft' | 'checked' | 'reviewed'

/**
 * A chapter's label, not its number: Sirach opens with the translator's
 * prologue, whose chapter is "praef". Everywhere else it is a number written
 * out, and it is what the URL carries.
 */
export type ChapterId = string

export interface ReaderVerse {
  verse: VerseId
  text: string
  footnotes: string[]
}

export interface OriginalVerse {
  verse: VerseId
  text: string
  /**
   * Which source text this verse came from. Per verse rather than per book
   * because an assembled book mixes them: the Catholic Esther is the Hebrew
   * with Greek blocks woven in, and the two do not even read in the same
   * direction.
   */
  corpus: string | null
}

/** Original-language edition metadata for a book (null if none is bundled). */
export interface OriginalInfo {
  corpus: string
  /** Edition citation, e.g. "Westminster Leningrad Codex". */
  edition: string
  /** pt-BR language label, e.g. "Hebraico" / "Grego". */
  language: string
  dir: 'rtl' | 'ltr'
}

export interface ReaderChapter {
  chapter: ChapterId
  formal: ReaderVerse[]
  original: OriginalVerse[]
}

export interface ReaderBook {
  code: string
  name: string
  abbrev: string
  slug: string
  status: Record<Register, Status>
  original: OriginalInfo | null
  chapters: ReaderChapter[]
}

export interface ReaderIndexEntry {
  slug: string
  code: string
  /** Which book file to load: two editions can disagree, see `chapters`. */
  file: string
  name: string
  abbrev: string
  canon: 'AT' | 'DC' | 'NT'
  /**
   * The chapters, as a count when they are plainly `1..n` and as the full list
   * of labels when they are not. Only Sirach is not, and spelling every chapter
   * out for all 139 entries would quadruple an index the landing bundle
   * carries. Read it through `chapterIds`.
   */
  chapters: number | ChapterId[]
  status: Record<Register, Status>
  original: { language: string } | null
}

/** One edition, with the books it contains in its own order. */
export interface ReaderEdition {
  /** What the URL and localStorage carry, e.g. "catolica". */
  key: string
  name: string
  summary: string
  books: ReaderIndexEntry[]
}

export const editions = indexData as ReaderEdition[]

export function editionByKey(key: string | undefined): ReaderEdition | undefined {
  return editions.find((e) => e.key === key)
}

/** The chapters of a book, always as labels, whichever form the index used. */
export function chapterIds(entry: ReaderIndexEntry): ChapterId[] {
  const { chapters } = entry
  return typeof chapters === 'number' ? Array.from({ length: chapters }, (_, i) => String(i + 1)) : chapters
}

/**
 * How a chapter is written out. Numbers speak for themselves; Sirach opens
 * with the translator's prologue, whose chapter is `praef` in the sources, and
 * printing that raw would leave the one chapter that needs a name without one.
 */
export function chapterLabel(chapter: ChapterId): string {
  return chapter === 'praef' ? 'Prólogo' : chapter
}

/** The same, cut to fit the chapter rail's square cells. */
export function chapterShortLabel(chapter: ChapterId): string {
  return chapter === 'praef' ? 'Pr' : chapter
}

export function bookBySlug(edition: ReaderEdition, slug: string): ReaderIndexEntry | undefined {
  return edition.books.find((b) => b.slug === slug)
}

export function bookByCode(edition: ReaderEdition, code: string): ReaderIndexEntry | undefined {
  return edition.books.find((b) => b.code === code)
}

const SECTIONS: { section: string; canons: ReaderIndexEntry['canon'][] }[] = [
  { section: 'Antigo Testamento', canons: ['AT', 'DC'] },
  { section: 'Novo Testamento', canons: ['NT'] },
]

export interface BookGroup {
  section: string
  books: ReaderIndexEntry[]
}

/**
 * An edition's books by testament, whole entries: AT and DC fall under
 * "Antigo Testamento", NT under "Novo Testamento". The edition's own order is
 * preserved (the deuterocanonical books are interleaved, not appended), and
 * empty sections are dropped so the nav only shows what exists.
 *
 * Entries rather than the trimmed shape `navGroups` hands the design system,
 * because the reader's own rail links to books by slug.
 */
export function bookGroups(edition: ReaderEdition): BookGroup[] {
  return SECTIONS.map(({ section, canons }) => ({
    section,
    books: edition.books.filter((b) => canons.includes(b.canon)),
  })).filter((group) => group.books.length > 0)
}

/** The same grouping in the shape BookNav takes, for the small-screen popover. */
export function navGroups(edition: ReaderEdition): NavGroup[] {
  return bookGroups(edition).map(({ section, books }) => ({
    section,
    items: books.map((b) => ({ code: b.code, name: b.name, abbrev: b.abbrev, chapters: chapterIds(b) })),
  }))
}

// index.json is imported statically above; exclude it so the glob only owns
// the per-book chunks (otherwise it is both static and dynamic: ineffective).
const bookLoaders = import.meta.glob(['../data/reader/*.json', '!../data/reader/index.json']) as Record<
  string,
  () => Promise<{ default: ReaderBook }>
>

/**
 * Lazy-load a book's full data by file name (each book is its own chunk).
 *
 * By file rather than by OSIS code because the Catholic Esther and Daniel carry
 * the Greek additions and are therefore different books from the Protestant
 * ones under the same code; every other book is one file read by both editions.
 */
export async function loadBook(file: string): Promise<ReaderBook> {
  const loader = bookLoaders[`../data/reader/${file}.json`]
  if (!loader) throw new Error(`reader book not found: ${file}`)
  return (await loader()).default
}

const REGISTER_KEY = 'bl.reader.register'
const VIEWS: View[] = ['formal', 'original']

/** Remembered view choice; 'formal' when unset/invalid. Guarded for private mode. */
export function readStoredRegister(): View {
  try {
    const stored = window.localStorage.getItem(REGISTER_KEY)
    if (stored && (VIEWS as string[]).includes(stored)) return stored as View
  } catch {
    // localStorage can throw (private mode, blocked storage): fall back to default.
  }
  return 'formal'
}

export function storeRegister(view: View): void {
  try {
    window.localStorage.setItem(REGISTER_KEY, view)
  } catch {
    // Ignore: remembering the choice is a nicety, not required for reading.
  }
}

import type { NavGroup } from '../design-system/components/reading'
import indexData from '../data/reader/index.json'

export type Register = 'formal'
/** What the reader can show: the pt register plus the original text. */
export type View = Register | 'original'
export type Status = 'draft' | 'checked' | 'reviewed'

export interface ReaderVerse {
  verse: number
  text: string
  footnotes: string[]
}

export interface OriginalVerse {
  verse: number
  text: string
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
  chapter: number
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
  name: string
  abbrev: string
  canon: 'AT' | 'DC' | 'NT'
  chapters: number
  status: Record<Register, Status>
  original: { language: string } | null
}

export const readerIndex = indexData as ReaderIndexEntry[]

export function bookBySlug(slug: string): ReaderIndexEntry | undefined {
  return readerIndex.find((b) => b.slug === slug)
}

export function bookByCode(code: string): ReaderIndexEntry | undefined {
  return readerIndex.find((b) => b.code === code)
}

/**
 * BookNav groups from the translated books: AT and DC fall under "Antigo
 * Testamento", NT under "Novo Testamento". Canonical order is preserved, and
 * empty sections are dropped so the nav only shows what exists.
 */
export function navGroups(): NavGroup[] {
  const sections: { section: string; canons: ReaderIndexEntry['canon'][] }[] = [
    { section: 'Antigo Testamento', canons: ['AT', 'DC'] },
    { section: 'Novo Testamento', canons: ['NT'] },
  ]

  return sections
    .map(({ section, canons }) => ({
      section,
      items: readerIndex
        .filter((b) => canons.includes(b.canon))
        .map((b) => ({ code: b.code, name: b.name, abbrev: b.abbrev, chapters: b.chapters })),
    }))
    .filter((group) => group.items.length > 0)
}

// index.json is imported statically above; exclude it so the glob only owns
// the per-book chunks (otherwise it is both static and dynamic: ineffective).
const bookLoaders = import.meta.glob(['../data/reader/*.json', '!../data/reader/index.json']) as Record<
  string,
  () => Promise<{ default: ReaderBook }>
>

/** Lazy-load a book's full data by OSIS code (each book is its own chunk). */
export async function loadBook(code: string): Promise<ReaderBook> {
  const loader = bookLoaders[`../data/reader/${code}.json`]
  if (!loader) throw new Error(`reader book not found: ${code}`)
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

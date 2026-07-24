import type { NavGroup } from '../design-system/components/reading'
import indexData from '../data/reader/index.json'

export type Register = 'formal' | 'simple'
export type Status = 'draft' | 'checked' | 'reviewed'

export interface ReaderVerse {
  verse: number
  text: string
  footnotes: string[]
}

export interface ReaderChapter {
  chapter: number
  formal: ReaderVerse[]
  simple: ReaderVerse[]
}

export interface ReaderBook {
  code: string
  name: string
  abbrev: string
  slug: string
  status: Record<Register, Status>
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
const REGISTERS: Register[] = ['formal', 'simple']

/** Remembered register choice; 'formal' when unset/invalid. Guarded for private mode. */
export function readStoredRegister(): Register {
  try {
    const stored = window.localStorage.getItem(REGISTER_KEY)
    if (stored && (REGISTERS as string[]).includes(stored)) return stored as Register
  } catch {
    // localStorage can throw (private mode, blocked storage): fall back to default.
  }
  return 'formal'
}

export function storeRegister(register: Register): void {
  try {
    window.localStorage.setItem(REGISTER_KEY, register)
  } catch {
    // Ignore: remembering the choice is a nicety, not required for reading.
  }
}

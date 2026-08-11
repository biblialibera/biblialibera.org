import { beforeEach, describe, expect, it } from 'vitest'
import {
  bookBySlug,
  chapterIds,
  editionByKey,
  editions,
  loadBook,
  navGroups,
  readStoredRegister,
  storeRegister,
} from './readerData'

const catholic = editionByKey('catolica')!
const protestant = editionByKey('protestante')!

describe('readerData', () => {
  it('ships the two editions the site offers', () => {
    expect(editions.map((e) => e.key)).toEqual(['catolica', 'protestante'])
    expect(catholic.books).toHaveLength(73)
    expect(protestant.books).toHaveLength(66)
  })

  it('resolves a book by slug inside an edition', () => {
    const ps = bookBySlug(catholic, 'salmos')
    expect(ps?.code).toBe('Ps')
    expect(ps?.chapters).toBe(150)
  })

  it('returns undefined for an unknown slug', () => {
    expect(bookBySlug(catholic, 'naoexiste')).toBeUndefined()
  })

  // The deuterocanonical books are the whole point of having two editions, and
  // the Catholic one interleaves them rather than appending them.
  it('carries the deuterocanon only in the Catholic edition, in canonical order', () => {
    expect(bookBySlug(catholic, 'tobias')?.canon).toBe('DC')
    expect(bookBySlug(protestant, 'tobias')).toBeUndefined()

    const codes = catholic.books.map((b) => b.code)
    expect(codes.indexOf('Tob')).toBeGreaterThan(codes.indexOf('Neh'))
    expect(codes.indexOf('Tob')).toBeLessThan(codes.indexOf('Esth'))
  })

  // Assembled books are different books under the same code, so they cannot
  // share a file: the Catholic Daniel carries Susanna and Bel as chapters 13
  // and 14, and its chapter 3 runs to verse 100.
  it('points the two editions at different files where they disagree', () => {
    expect(bookBySlug(catholic, 'daniel')?.file).toBe('Dan.catolica')
    expect(bookBySlug(catholic, 'daniel')?.chapters).toBe(14)
    expect(bookBySlug(protestant, 'daniel')?.file).toBe('Dan')
    expect(bookBySlug(protestant, 'daniel')?.chapters).toBe(12)
    expect(bookBySlug(catholic, 'joao')?.file).toBe(bookBySlug(protestant, 'joao')?.file)
  })

  // Sirach opens with the translator's prologue, whose chapter is not a number.
  it('spells out chapter labels when they are not 1..n', () => {
    expect(chapterIds(bookBySlug(catholic, 'jonas')!)).toEqual(['1', '2', '3', '4'])
    expect(chapterIds(bookBySlug(catholic, 'eclesiastico')!).slice(0, 3)).toEqual(['praef', '1', '2'])
  })

  it('groups nav by testament in canonical order', () => {
    const groups = navGroups(catholic)
    expect(groups.map((g) => g.section)).toEqual(['Antigo Testamento', 'Novo Testamento'])

    const at = groups[0].items.map((b) => b.code)
    expect(at).toContain('Gen')
    expect(at).toContain('Ps')
    expect(at.indexOf('Gen')).toBeLessThan(at.indexOf('Ps'))

    expect(groups[1].items.map((b) => b.code)).toContain('Mark')
  })

  it('lazy-loads a book with the formal register and the original merged per chapter', async () => {
    const jonah = await loadBook('Jonah')
    expect(jonah.code).toBe('Jonah')
    expect(jonah.chapters).toHaveLength(4)
    expect(jonah.original?.language).toBe('Hebraico')
    expect(jonah.original?.dir).toBe('rtl')
    const [first] = jonah.chapters
    expect(first.chapter).toBe('1')
    expect(first.formal[0].verse).toBe('1')
    expect(typeof first.formal[0].text).toBe('string')
    expect(typeof first.original[0].text).toBe('string')
  })

  // The Greek additions to Esther hang off a host verse as lettered
  // sub-verses, so a verse is addressed by label and "1" alone names one of
  // several.
  it('addresses the Catholic Esther by sub-verse label', async () => {
    const esther = await loadBook('Esth.catolica')
    const [first] = esther.chapters
    expect(first.formal.slice(0, 3).map((v) => v.verse)).toEqual(['1a', '1b', '1c'])
    expect(first.formal.map((v) => v.verse)).toContain('1')
  })

  // An assembled book mixes source texts, and the two do not read in the same
  // direction: setting one direction for the whole chapter would lay half of
  // it out backwards.
  it('records the source corpus per original verse', async () => {
    const esther = await loadBook('Esth.catolica')
    const corpora = new Set(esther.chapters[0].original.map((v) => v.corpus))
    expect(corpora).toEqual(new Set(['lxx', 'wlc']))
  })

  it('rejects an unknown book file', async () => {
    await expect(loadBook('Nope')).rejects.toThrow(/not found/)
  })

  describe('remembered register', () => {
    beforeEach(() => window.localStorage.clear())

    it('defaults to formal when unset', () => {
      expect(readStoredRegister()).toBe('formal')
    })

    it('round-trips the stored choice', () => {
      storeRegister('original')
      expect(readStoredRegister()).toBe('original')
    })

    it('ignores an invalid stored value', () => {
      window.localStorage.setItem('bl.reader.register', 'bogus')
      expect(readStoredRegister()).toBe('formal')
    })
  })
})

import { beforeEach, describe, expect, it } from 'vitest'
import { bookBySlug, loadBook, navGroups, readStoredRegister, storeRegister } from './readerData'

describe('readerData', () => {
  it('resolves a book by slug', () => {
    const ps = bookBySlug('salmos')
    expect(ps?.code).toBe('Ps')
    expect(ps?.chapters).toBe(150)
  })

  it('returns undefined for an unknown slug', () => {
    expect(bookBySlug('naoexiste')).toBeUndefined()
  })

  it('groups nav by testament in canonical order', () => {
    const groups = navGroups()
    expect(groups.map((g) => g.section)).toEqual(['Antigo Testamento', 'Novo Testamento'])

    const at = groups[0].items.map((b) => b.code)
    expect(at).toContain('Gen')
    expect(at).toContain('Ps')
    expect(at.indexOf('Gen')).toBeLessThan(at.indexOf('Ps'))

    expect(groups[1].items.map((b) => b.code)).toContain('Mark')
  })

  it('lazy-loads a book with both registers merged per chapter', async () => {
    const jonah = await loadBook('Jonah')
    expect(jonah.code).toBe('Jonah')
    expect(jonah.chapters).toHaveLength(4)
    const [first] = jonah.chapters
    expect(first.chapter).toBe(1)
    expect(first.formal[0].verse).toBe(1)
    expect(typeof first.formal[0].text).toBe('string')
    expect(typeof first.simple[0].text).toBe('string')
  })

  it('rejects an unknown book code', async () => {
    await expect(loadBook('Nope')).rejects.toThrow(/not found/)
  })

  describe('remembered register', () => {
    beforeEach(() => window.localStorage.clear())

    it('defaults to formal when unset', () => {
      expect(readStoredRegister()).toBe('formal')
    })

    it('round-trips the stored choice', () => {
      storeRegister('simple')
      expect(readStoredRegister()).toBe('simple')
    })

    it('ignores an invalid stored value', () => {
      window.localStorage.setItem('bl.reader.register', 'bogus')
      expect(readStoredRegister()).toBe('formal')
    })
  })
})

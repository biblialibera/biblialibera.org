import { beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_EDITION, isEditionKey, readStoredEdition, storeEdition } from './editions'
import { editions } from './readerData'

describe('editions', () => {
  beforeEach(() => window.localStorage.clear())

  it('offers exactly what the content build produced', () => {
    expect(editions.map((e) => e.key)).toEqual(['catolica', 'protestante'])
    expect(isEditionKey('catolica')).toBe(true)
    expect(isEditionKey('ortodoxa')).toBe(false)
    expect(isEditionKey(null)).toBe(false)
  })

  // The default is what a link with no edition in it resolves to, and what
  // /temas points at before anyone has chosen. It has to be the superset, so
  // nothing is hidden from a visitor who never answered.
  it('defaults to the edition with the most books', () => {
    expect(DEFAULT_EDITION).toBe('catolica')
    const largest = [...editions].sort((a, b) => b.books.length - a.books.length)[0]
    expect(DEFAULT_EDITION).toBe(largest.key)
  })

  // Null rather than the default: it is the difference between "has not chosen"
  // and "chose the Catholic one", and it is what makes /ler ask the first time.
  it('reports no choice until one is made', () => {
    expect(readStoredEdition()).toBeNull()
    storeEdition('protestante')
    expect(readStoredEdition()).toBe('protestante')
  })

  it('ignores a stored value that is not an edition', () => {
    window.localStorage.setItem('bl.reader.edition', 'ortodoxa')
    expect(readStoredEdition()).toBeNull()
  })

  it('keeps the choice apart from the remembered register', () => {
    storeEdition('catolica')
    expect(window.localStorage.getItem('bl.reader.register')).toBeNull()
  })
})

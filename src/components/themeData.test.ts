import { describe, expect, it } from 'vitest'
import { themeBySlug, themeIndex } from './themeData'

describe('themeData', () => {
  describe('index', () => {
    it('ships every theme with passages and a summary', () => {
      expect(themeIndex.length).toBeGreaterThan(0)
      for (const theme of themeIndex) {
        expect(theme.summary).not.toBe('')
        expect(theme.passageCount).toBeGreaterThan(0)
        expect(theme.references).toHaveLength(theme.passageCount)
      }
    })

    it('has no duplicate slugs', () => {
      const slugs = themeIndex.map((t) => t.slug)
      expect(new Set(slugs).size).toBe(slugs.length)
    })

    it('resolves a theme by slug', () => {
      expect(themeBySlug(themeIndex[0].slug)?.name).toBe(themeIndex[0].name)
      expect(themeBySlug('nao-existe')).toBeUndefined()
    })
  })
})

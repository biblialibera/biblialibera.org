import { describe, expect, it, vi } from 'vitest'
import type { ChapterText } from './passage.ts'
import { buildPassage, loadChapter, truncate } from './passage.ts'

const CHAPTER: ChapterText = {
  book: 'João',
  abbrev: 'Jo',
  slug: 'joao',
  chapter: 3,
  status: 'checked',
  verses: [
    { n: 16, t: 'Porque Deus amou o mundo de tal maneira.' },
    { n: 17, t: 'Pois Deus não enviou o Filho ao mundo para julgar o mundo.' },
    { n: 18, t: 'Quem nele crê não é julgado.' },
  ],
}

const respondWith = (body: ChapterText | null) =>
  vi.fn().mockResolvedValue({ ok: body !== null, json: async () => body })

describe('loadChapter', () => {
  it('reads the chapter off the static copy the build writes', async () => {
    const fetchImpl = respondWith(CHAPTER)
    await expect(loadChapter('https://biblialibera.org', 'joao', 3, fetchImpl)).resolves.toEqual(CHAPTER)
    expect(fetchImpl).toHaveBeenCalledWith('https://biblialibera.org/og/joao/3.json')
  })

  it('answers nothing for a chapter that is not there', async () => {
    await expect(loadChapter('https://biblialibera.org', 'joao', 99, respondWith(null))).resolves.toBeNull()
  })

  // A preview is a nicety. If the fetch fails the page still has to unfurl with
  // the site's own tags rather than take a 500 with it.
  it('answers nothing when the fetch throws', async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error('network'))
    await expect(loadChapter('https://biblialibera.org', 'joao', 3, fetchImpl)).resolves.toBeNull()
  })

  // The slug lands in a URL path: anything that is not a slug never gets there.
  it('refuses a slug that is not one, without asking the network', async () => {
    const fetchImpl = respondWith(CHAPTER)
    await expect(loadChapter('https://biblialibera.org', '../../etc/passwd', 3, fetchImpl)).resolves.toBeNull()
    await expect(loadChapter('https://biblialibera.org', 'joao', Number('x'), fetchImpl)).resolves.toBeNull()
    await expect(loadChapter('https://biblialibera.org', 'joao', 0, fetchImpl)).resolves.toBeNull()
    expect(fetchImpl).not.toHaveBeenCalled()
  })
})

describe('buildPassage', () => {
  it('quotes the verses the link names', () => {
    const passage = buildPassage(CHAPTER, { start: 16, end: 17 })
    expect(passage.reference).toBe('João 3:16-17')
    expect(passage.text).toBe(`${CHAPTER.verses[0].t} ${CHAPTER.verses[1].t}`)
    expect(passage.status).toBe('checked')
  })

  it('quotes the whole chapter when the link names no verses', () => {
    const passage = buildPassage(CHAPTER, null)
    expect(passage.reference).toBe('João 3')
    expect(passage.range).toBeNull()
  })

  // The reference and the text have to describe each other. A range half past
  // the end of the chapter names what was actually found, not what was asked.
  it('names what it found when the range runs past the end', () => {
    const passage = buildPassage(CHAPTER, { start: 17, end: 40 })
    expect(passage.reference).toBe('João 3:17-18')
    expect(passage.text).toBe(`${CHAPTER.verses[1].t} ${CHAPTER.verses[2].t}`)
  })

  it('falls back to the chapter when the range misses it entirely', () => {
    const passage = buildPassage(CHAPTER, { start: 90, end: 95 })
    expect(passage.reference).toBe('João 3')
    expect(passage.text).toContain(CHAPTER.verses[0].t)
  })
})

describe('truncate', () => {
  it('leaves text that fits alone', () => {
    expect(truncate('No princípio', 40)).toBe('No princípio')
  })

  it('cuts on a word boundary', () => {
    expect(truncate('No princípio era a Palavra', 15)).toBe('No princípio...')
  })

  it('drops the punctuation it would otherwise cut against', () => {
    expect(truncate('No princípio, era a Palavra', 14)).toBe('No princípio...')
  })

  // A single word longer than the budget has no boundary to cut on, and must
  // still come back inside it.
  it('cuts mid-word when there is no boundary to use', () => {
    expect(truncate('a'.repeat(40), 10)).toBe(`${'a'.repeat(10)}...`)
  })
})

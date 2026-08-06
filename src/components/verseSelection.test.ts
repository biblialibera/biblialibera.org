import { describe, expect, it } from 'vitest'
import {
  EMPTY_SELECTION,
  footnoteElementId,
  footnoteRefElementId,
  formatVerseParam,
  isVerseSelected,
  nextSelection,
  parseLegacyVerseHash,
  parseVerseQuery,
  passagePath,
  passageReference,
  rangesEqual,
  verseElementId,
  verseSearch,
} from './verseSelection'


// The selection used to live in the hash. Links handed out back then still
// have to land on their passage, so the reader reads this form once on arrival
// and rewrites the URL into the query form.
describe('parseLegacyVerseHash', () => {
  it('reads a single verse and a range', () => {
    expect(parseLegacyVerseHash('#v16')).toEqual({ start: 16, end: 16 })
    expect(parseLegacyVerseHash('#v16-18')).toEqual({ start: 16, end: 18 })
  })

  it('works without the leading hash', () => {
    expect(parseLegacyVerseHash('v3-4')).toEqual({ start: 3, end: 4 })
  })

  it('normalises a backwards range', () => {
    expect(parseLegacyVerseHash('#v18-16')).toEqual({ start: 16, end: 18 })
  })

  it('finds no passage in an empty hash', () => {
    expect(parseLegacyVerseHash('')).toBeNull()
    expect(parseLegacyVerseHash('#')).toBeNull()
  })

  // Following a note must never be mistaken for selecting a verse, which is
  // what the fn- prefix on those anchors is for.
  it('finds no passage in a footnote anchor or any other', () => {
    expect(parseLegacyVerseHash('#fn-formal-1')).toBeNull()
    expect(parseLegacyVerseHash('#fnref-original-12')).toBeNull()
    expect(parseLegacyVerseHash('#conteudo')).toBeNull()
    expect(parseLegacyVerseHash('#v16x')).toBeNull()
    expect(parseLegacyVerseHash('#v')).toBeNull()
  })

  it('applies the same guards as the query form', () => {
    expect(parseLegacyVerseHash('#v0')).toBeNull()
    expect(parseLegacyVerseHash('#v0-3')).toBeNull()
    expect(parseLegacyVerseHash(`#v${'9'.repeat(400)}`)).toBeNull()
  })
})

describe('verseSearch', () => {
  it('collapses a one-verse range', () => {
    expect(verseSearch({ start: 9, end: 9 })).toBe('?v=9')
  })

  it('writes a range', () => {
    expect(verseSearch({ start: 1, end: 4 })).toBe('?v=1-4')
  })

  // Not `?v=`: an empty parameter left behind is one more thing in a URL
  // people are meant to copy, and it would come back as no selection anyway.
  it('drops the parameter when nothing is selected', () => {
    expect(verseSearch(null)).toBe('')
  })

  it('round-trips through parseVerseQuery', () => {
    for (const range of [{ start: 1, end: 1 }, { start: 2, end: 7 }, { start: 150, end: 176 }]) {
      expect(parseVerseQuery(verseSearch(range))).toEqual(range)
    }
  })
})

describe('isVerseSelected', () => {
  it('covers the whole inclusive range', () => {
    const range = { start: 16, end: 18 }
    expect([15, 16, 17, 18, 19].map((v) => isVerseSelected(range, v))).toEqual([false, true, true, true, false])
  })

  it('selects nothing when there is no range', () => {
    expect(isVerseSelected(null, 1)).toBe(false)
  })
})

describe('rangesEqual', () => {
  it('compares by value', () => {
    expect(rangesEqual({ start: 1, end: 2 }, { start: 1, end: 2 })).toBe(true)
    expect(rangesEqual({ start: 1, end: 2 }, { start: 1, end: 3 })).toBe(false)
  })

  it('treats two empty selections as equal', () => {
    expect(rangesEqual(null, null)).toBe(true)
    expect(rangesEqual(null, { start: 1, end: 1 })).toBe(false)
  })
})

describe('nextSelection with a mouse', () => {
  const click = { shiftKey: false, touch: false }
  const shiftClick = { shiftKey: true, touch: false }

  it('selects a single verse', () => {
    expect(nextSelection(EMPTY_SELECTION, 16, click)).toEqual({ range: { start: 16, end: 16 }, anchor: 16 })
  })

  it('extends forwards on shift-click', () => {
    const first = nextSelection(EMPTY_SELECTION, 16, click)
    expect(nextSelection(first, 18, shiftClick)).toEqual({ range: { start: 16, end: 18 }, anchor: 16 })
  })

  it('extends backwards on shift-click', () => {
    const first = nextSelection(EMPTY_SELECTION, 16, click)
    expect(nextSelection(first, 14, shiftClick)).toEqual({ range: { start: 14, end: 16 }, anchor: 16 })
  })

  // The anchor is the verse the reader picked, so widening then narrowing
  // keeps pivoting on it instead of creeping along with the range edge.
  it('keeps pivoting on the original anchor when re-extending', () => {
    let state = nextSelection(EMPTY_SELECTION, 16, click)
    state = nextSelection(state, 20, shiftClick)
    state = nextSelection(state, 18, shiftClick)
    expect(state).toEqual({ range: { start: 16, end: 18 }, anchor: 16 })
  })

  it('shift-clicking with nothing selected just selects that verse', () => {
    expect(nextSelection(EMPTY_SELECTION, 5, shiftClick)).toEqual({ range: { start: 5, end: 5 }, anchor: 5 })
  })

  it('replaces the selection on a plain click elsewhere', () => {
    const range = nextSelection(nextSelection(EMPTY_SELECTION, 16, click), 18, shiftClick)
    expect(nextSelection(range, 30, click)).toEqual({ range: { start: 30, end: 30 }, anchor: 30 })
  })

  it('clears when clicking the only selected verse', () => {
    const first = nextSelection(EMPTY_SELECTION, 16, click)
    expect(nextSelection(first, 16, click)).toEqual(EMPTY_SELECTION)
  })

  it('does not clear when clicking a verse inside a range', () => {
    const range = nextSelection(nextSelection(EMPTY_SELECTION, 16, click), 20, shiftClick)
    expect(nextSelection(range, 18, click)).toEqual({ range: { start: 18, end: 18 }, anchor: 18 })
  })
})

describe('nextSelection with a finger', () => {
  const tap = { shiftKey: false, touch: true }

  it('selects a single verse on the first tap', () => {
    expect(nextSelection(EMPTY_SELECTION, 16, tap)).toEqual({ range: { start: 16, end: 16 }, anchor: 16 })
  })

  // There is no shift key on a phone, so a second tap outside the selection is
  // what extends a range there.
  it('extends when tapping a verse outside the selection', () => {
    const first = nextSelection(EMPTY_SELECTION, 16, tap)
    expect(nextSelection(first, 18, tap)).toEqual({ range: { start: 16, end: 18 }, anchor: 16 })
  })

  it('extends backwards too', () => {
    const first = nextSelection(EMPTY_SELECTION, 16, tap)
    expect(nextSelection(first, 12, tap)).toEqual({ range: { start: 12, end: 16 }, anchor: 16 })
  })

  // Without this, a range on touch would be a trap: every further tap would
  // widen it and there would be no way back to a single verse.
  it('collapses to one verse when tapping inside the range', () => {
    const range = nextSelection(nextSelection(EMPTY_SELECTION, 16, tap), 20, tap)
    expect(nextSelection(range, 18, tap)).toEqual({ range: { start: 18, end: 18 }, anchor: 18 })
  })

  it('clears when tapping the only selected verse', () => {
    const first = nextSelection(EMPTY_SELECTION, 16, tap)
    expect(nextSelection(first, 16, tap)).toEqual(EMPTY_SELECTION)
  })
})

describe('element ids', () => {
  it('names a verse, which is what the reader scrolls to', () => {
    expect(verseElementId(16)).toBe('v16')
  })

  it('prefixes footnotes so they never parse as verses', () => {
    expect(footnoteElementId('formal', 3)).toBe('fn-formal-3')
    expect(parseLegacyVerseHash(`#${footnoteElementId('formal', 3)}`)).toBeNull()
  })

  it('prefixes the way-back marker so it never parses as a verse either', () => {
    expect(footnoteRefElementId('formal', 3)).toBe('fnref-formal-3')
    expect(parseLegacyVerseHash(`#${footnoteRefElementId('formal', 3)}`)).toBeNull()
  })

  it('keeps the note and its marker on distinct anchors', () => {
    expect(footnoteElementId('formal', 1)).not.toBe(footnoteRefElementId('formal', 1))
  })
})

describe('passagePath', () => {
  // One URL form: what the thematic index links to, what the share button
  // hands over and what the address bar shows are the same string, so a URL
  // copied from any of them unfurls into the passage it names.
  it('carries the passage where a preview crawler can see it', () => {
    expect(passagePath('josue', 1, { start: 9, end: 9 })).toBe('/ler/josue/1?v=9')
    expect(passagePath('salmos', 23, { start: 1, end: 4 })).toBe('/ler/salmos/23?v=1-4')
  })

  it('points at the chapter alone when nothing is selected', () => {
    expect(passagePath('joao', 3, null)).toBe('/ler/joao/3')
  })

  it('round-trips: the path a link carries selects the same verses on arrival', () => {
    const range = { start: 16, end: 18 }
    const [, search] = passagePath('joao', 3, range).split('?')
    expect(parseVerseQuery(`?${search}`)).toEqual(range)
  })
})

describe('parseVerseQuery', () => {
  it('reads a single verse', () => {
    expect(parseVerseQuery('?v=16')).toEqual({ start: 16, end: 16 })
  })

  it('reads a range', () => {
    expect(parseVerseQuery('?v=16-18')).toEqual({ start: 16, end: 18 })
  })

  it('finds the passage among other parameters', () => {
    expect(parseVerseQuery('?utm_source=whatsapp&v=3-4')).toEqual({ start: 3, end: 4 })
  })

  it('reports no passage when the query has none', () => {
    expect(parseVerseQuery('')).toBeNull()
    expect(parseVerseQuery('?utm_source=whatsapp')).toBeNull()
  })

  // The query form has no `v` prefix of its own, so the hash form landing here
  // is a malformed link, not a second spelling to accept.
  it('rejects the hash spelling', () => {
    expect(parseVerseQuery('?v=v16')).toBeNull()
  })

  it('applies the same guards as the hash form', () => {
    expect(parseVerseQuery('?v=0')).toBeNull()
    expect(parseVerseQuery('?v=abc')).toBeNull()
    expect(parseVerseQuery(`?v=${'9'.repeat(400)}`)).toBeNull()
    expect(parseVerseQuery('?v=18-16')).toEqual({ start: 16, end: 18 })
  })
})

describe('formatVerseParam', () => {
  it('writes a single verse', () => {
    expect(formatVerseParam({ start: 16, end: 16 })).toBe('16')
  })

  it('writes a range', () => {
    expect(formatVerseParam({ start: 16, end: 18 })).toBe('16-18')
  })

  it('round-trips through the query', () => {
    const range = { start: 16, end: 18 }
    expect(parseVerseQuery(`?v=${formatVerseParam(range)}`)).toEqual(range)
  })
})

describe('passageReference', () => {
  it('writes a single verse', () => {
    expect(passageReference('João', 3, { start: 16, end: 16 })).toBe('João 3:16')
  })

  it('writes a range', () => {
    expect(passageReference('João', 3, { start: 16, end: 18 })).toBe('João 3:16-18')
  })

  it('names the chapter alone when nothing is selected', () => {
    expect(passageReference('João', 3, null)).toBe('João 3')
  })
})

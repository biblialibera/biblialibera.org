import { describe, expect, it } from 'vitest'
import {
  EMPTY_SELECTION,
  footnoteElementId,
  footnoteRefElementId,
  formatVerseHash,
  isVerseSelected,
  nextSelection,
  parseVerseHash,
  passagePath,
  rangesEqual,
  verseElementId,
} from './verseSelection'

describe('parseVerseHash', () => {
  it('reads a single verse', () => {
    expect(parseVerseHash('#v16')).toEqual({ start: 16, end: 16 })
  })

  it('reads a range', () => {
    expect(parseVerseHash('#v16-18')).toEqual({ start: 16, end: 18 })
  })

  it('works without the leading hash', () => {
    expect(parseVerseHash('v3-4')).toEqual({ start: 3, end: 4 })
  })

  it('normalises a backwards range', () => {
    expect(parseVerseHash('#v18-16')).toEqual({ start: 16, end: 18 })
  })

  it('reports an empty hash as no selection', () => {
    expect(parseVerseHash('')).toBeNull()
    expect(parseVerseHash('#')).toBeNull()
  })

  it('reports verse zero as no selection rather than a range', () => {
    expect(parseVerseHash('#v0')).toBeNull()
    expect(parseVerseHash('#v0-3')).toBeNull()
  })

  // A long enough digit run parses as Infinity, which would otherwise survive
  // into a range and come back out as "#v2-Infinity".
  it('reports a number no chapter could hold as no selection', () => {
    const huge = '9'.repeat(400)
    expect(parseVerseHash(`#v${huge}`)).toBeNull()
    expect(parseVerseHash(`#v2-${huge}`)).toBeNull()
    expect(parseVerseHash('#v99999999999999999999')).toBeNull()
  })

  // The whole reason footnotes are prefixed: jumping to a note must not be
  // read as "the reader deselected the passage".
  it('leaves the selection alone for a footnote anchor', () => {
    expect(parseVerseHash('#fn-formal-1')).toBeUndefined()
    expect(parseVerseHash('#fn-original-12')).toBeUndefined()
  })

  it('leaves the selection alone for any other anchor', () => {
    expect(parseVerseHash('#conteudo')).toBeUndefined()
    expect(parseVerseHash('#v16x')).toBeUndefined()
    expect(parseVerseHash('#v')).toBeUndefined()
  })
})

describe('formatVerseHash', () => {
  it('collapses a one-verse range', () => {
    expect(formatVerseHash({ start: 9, end: 9 })).toBe('#v9')
  })

  it('writes a range', () => {
    expect(formatVerseHash({ start: 1, end: 4 })).toBe('#v1-4')
  })

  it('drops the hash when nothing is selected', () => {
    expect(formatVerseHash(null)).toBe('')
  })

  it('round-trips through parseVerseHash', () => {
    for (const range of [{ start: 1, end: 1 }, { start: 2, end: 7 }, { start: 150, end: 176 }]) {
      expect(parseVerseHash(formatVerseHash(range))).toEqual(range)
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
  it('names a verse so that #v16 resolves as a plain anchor', () => {
    expect(verseElementId(16)).toBe('v16')
    expect(formatVerseHash({ start: 16, end: 16 })).toBe(`#${verseElementId(16)}`)
  })

  it('prefixes footnotes so they never parse as verses', () => {
    expect(footnoteElementId('formal', 3)).toBe('fn-formal-3')
    expect(parseVerseHash(`#${footnoteElementId('formal', 3)}`)).toBeUndefined()
  })

  it('prefixes the way-back marker so it never parses as a verse either', () => {
    expect(footnoteRefElementId('formal', 3)).toBe('fnref-formal-3')
    expect(parseVerseHash(`#${footnoteRefElementId('formal', 3)}`)).toBeUndefined()
  })

  it('keeps the note and its marker on distinct anchors', () => {
    expect(footnoteElementId('formal', 1)).not.toBe(footnoteRefElementId('formal', 1))
  })
})

describe('passagePath', () => {
  it('points at a single verse', () => {
    expect(passagePath('josue', 1, 9, 9)).toBe('/ler/josue/1#v9')
  })

  it('points at a range', () => {
    expect(passagePath('salmos', 23, 1, 4)).toBe('/ler/salmos/23#v1-4')
  })
})

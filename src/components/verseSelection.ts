/**
 * Verse selection: the reader keeps the selected verse or verse range in the
 * location hash (`#v16`, `#v16-18`) so any reading position is a shareable
 * URL.
 *
 * The hash is shared with the footnote anchors, which is why those are
 * prefixed `fn-`: `parseVerseHash` can then tell "the URL says no verses are
 * selected" apart from "the URL is pointing at something else entirely", and
 * jumping to a footnote no longer wipes the highlight.
 */

export interface VerseRange {
  start: number
  end: number
}

export interface SelectionState {
  range: VerseRange | null
  /**
   * The verse a range grows from. Kept separate from `range.start` so that
   * extending backwards (shift-clicking above the first selected verse) keeps
   * pivoting on the verse the reader originally picked.
   */
  anchor: number | null
}

export interface VerseClick {
  shiftKey: boolean
  /** True when the click came from a finger, which has no shift key. */
  touch: boolean
}

const VERSE_HASH = /^v(\d+)(?:-(\d+))?$/

export const EMPTY_SELECTION: SelectionState = { range: null, anchor: null }

/** The DOM id of a verse, so `#v16` also works as a plain anchor. */
export function verseElementId(verse: number): string {
  return `v${verse}`
}

/** The DOM id of a footnote. Prefixed so it never parses as a verse hash. */
export function footnoteElementId(idPrefix: string, n: number): string {
  return `fn-${idPrefix}-${n}`
}

/**
 * The DOM id of the inline marker a footnote points back to. Also prefixed:
 * following a note back to the text must not rewrite the selected passage.
 */
export function footnoteRefElementId(idPrefix: string, n: number): string {
  return `fnref-${idPrefix}-${n}`
}

/**
 * Reads a selection out of a location hash.
 *
 * Returns the range when the hash names verses, `null` when the hash is empty
 * or names impossible verses (nothing is selected), and `undefined` when the
 * hash belongs to something else, meaning the caller should leave whatever is
 * currently selected alone.
 */
export function parseVerseHash(hash: string): VerseRange | null | undefined {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  if (raw === '') return null

  const match = VERSE_HASH.exec(raw)
  if (!match) return undefined

  const start = Number(match[1])
  const end = match[2] === undefined ? start : Number(match[2])
  // A digit run long enough to overflow parses as Infinity, and a chapter has
  // no verse 9e308: treat anything outside the safe integers as no selection
  // rather than letting it reach a range or a formatted "#v2-Infinity".
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end)) return null
  if (start < 1 || end < 1) return null

  return start <= end ? { start, end } : { start: end, end: start }
}

/** The hash for a selection. Empty when nothing is selected, which drops the hash. */
export function formatVerseHash(range: VerseRange | null): string {
  if (!range) return ''
  return range.start === range.end ? `#v${range.start}` : `#v${range.start}-${range.end}`
}

export function isVerseSelected(range: VerseRange | null, verse: number): boolean {
  return range !== null && verse >= range.start && verse <= range.end
}

export function rangesEqual(a: VerseRange | null, b: VerseRange | null): boolean {
  if (a === null || b === null) return a === b
  return a.start === b.start && a.end === b.end
}

/**
 * The selection after clicking a verse.
 *
 * Shift-click extends from the anchor. Touch has no shift key, so tapping a
 * verse outside the selection extends too; tapping one inside it collapses
 * back to that single verse, which is how a reader on a phone escapes a range
 * without a modifier. Clicking the only selected verse clears the selection.
 */
export function nextSelection(state: SelectionState, verse: number, click: VerseClick): SelectionState {
  const { range, anchor } = state
  const inside = isVerseSelected(range, verse)

  if (anchor !== null && (click.shiftKey || (click.touch && !inside))) {
    return { range: { start: Math.min(anchor, verse), end: Math.max(anchor, verse) }, anchor }
  }

  if (range !== null && range.start === verse && range.end === verse) {
    return EMPTY_SELECTION
  }

  return { range: { start: verse, end: verse }, anchor: verse }
}

/** The reader path for a passage, with its verses selected. */
export function passagePath(bookSlug: string, chapter: number, start: number, end: number): string {
  return `/ler/${bookSlug}/${chapter}${formatVerseHash({ start, end })}`
}

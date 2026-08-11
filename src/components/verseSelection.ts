/**
 * Verse selection: the reader keeps the selected verse or verse range in the
 * query (`?v=16`, `?v=16-18`), so every reading position is a shareable URL.
 *
 * The query rather than the hash, which is where this started, because a hash
 * is a browser-only fragment: it never reaches the server, so a link preview
 * crawler receiving one of those URLs would only ever see the bare chapter and
 * the card would quote the wrong thing. In the query, the URL in the address
 * bar is the URL worth copying, with no share button in between.
 *
 * The cost of that is the browser's own anchor jump: `#v16` used to bring the
 * passage into view for free, and now nothing does until the reader's own
 * effect scrolls to it. That effect is not a nicety, it is what "open a link
 * and land on the verse" is made of.
 *
 * The hash still belongs to the footnote anchors, which is why those keep
 * their `fn-` prefix: an old `#v16` link, from when the selection lived there,
 * still has to be told apart from a note and turned into the query form.
 *
 * The functions under `api/` import this module too, which is why it stays
 * free of imports: both sides have to agree on what `?v=` means down to the
 * malformed cases.
 */

/**
 * How a verse is named: its label, not its number.
 *
 * Almost always a plain number written out ("16"), but in the Catholic Esther
 * the Greek additions hang off a host verse as lettered sub-verses, and chapter
 * 5 runs `1, 1a … 1k, 2, 2a … 2e, 3`. There "1" no longer names one verse, so
 * the label is the identity: it is what goes in `?v=`, what the DOM id is built
 * from, and what a reference prints.
 */
export type VerseId = string

export interface VerseRange {
  start: VerseId
  end: VerseId
}

export interface SelectionState {
  range: VerseRange | null
  /**
   * The verse a range grows from. Kept separate from `range.start` so that
   * extending backwards (shift-clicking above the first selected verse) keeps
   * pivoting on the verse the reader originally picked.
   */
  anchor: VerseId | null
}

export interface VerseClick {
  shiftKey: boolean
  /** True when the click came from a finger, which has no shift key. */
  touch: boolean
}

/** A verse label: a number, optionally followed by a sub-verse letter. */
const VERSE_ID = /^(\d+)([a-z]{1,2})?$/
const LEGACY_VERSE_HASH = /^v([0-9a-z]+)(?:-([0-9a-z]+))?$/
const VERSE_PARAM = /^([0-9a-z]+)(?:-([0-9a-z]+))?$/
/** The query parameter the selection lives in. */
export const VERSE_PARAM_KEY = 'v'

export const EMPTY_SELECTION: SelectionState = { range: null, anchor: null }

/**
 * A verse label read off a URL, normalized, or null when it names no verse.
 *
 * Normalizing matters because the label is compared for equality all over the
 * reader: `?v=007` and `?v=7` have to be the same verse, or a hand-typed link
 * highlights nothing while looking like it should.
 */
export function parseVerseId(raw: string): VerseId | null {
  const match = VERSE_ID.exec(raw)
  if (!match) return null

  const number = Number(match[1])
  // A digit run long enough to overflow parses as Infinity, and a chapter has
  // no verse 9e308: treat anything outside the safe integers as no verse rather
  // than letting it reach a range or a formatted "?v=2-Infinity".
  if (!Number.isSafeInteger(number) || number < 1) return null

  return `${number}${match[2] ?? ''}`
}

/**
 * Reading order for two verse labels: by number first, then by sub-verse
 * letter, with the host verse ahead of its additions ("1" before "1a").
 *
 * A total order rather than a lookup into the chapter, so that this module can
 * stay import-free and the link-preview functions can decide what a range
 * covers with nothing but the URL in hand.
 */
export function compareVerses(a: VerseId, b: VerseId): number {
  const left = VERSE_ID.exec(a)
  const right = VERSE_ID.exec(b)
  if (!left || !right) return 0

  const byNumber = Number(left[1]) - Number(right[1])
  if (byNumber !== 0) return byNumber

  return (left[2] ?? '').localeCompare(right[2] ?? '')
}

/** The DOM id of a verse: what the reader scrolls to, and a plain anchor. */
export function verseElementId(verse: VerseId): string {
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
 * The passage a `?v=16-18` query names, or null when it names none.
 *
 * Takes the whole query string (`location.search`), and answers null for a
 * malformed value as well as for a missing one: an unreadable `v` means the
 * URL selected nothing, never that it selected something impossible.
 */
export function parseVerseQuery(search: string): VerseRange | null {
  const raw = new URLSearchParams(search).get(VERSE_PARAM_KEY)
  if (raw === null) return null

  const match = VERSE_PARAM.exec(raw)
  if (!match) return null

  return rangeFromMatch(match)
}

/**
 * The passage an old `#v16` link names, from when the selection lived in the
 * hash. Null for a footnote anchor or anything else, which is what the `fn-`
 * prefix on those buys: the reader turns whatever this finds into the query
 * form, and links handed out back then keep landing on their passage.
 */
export function parseLegacyVerseHash(hash: string): VerseRange | null {
  const raw = hash.startsWith('#') ? hash.slice(1) : hash
  const match = LEGACY_VERSE_HASH.exec(raw)
  return match ? rangeFromMatch(match) : null
}

/** `[, start, end?]` from either pattern to a range. */
function rangeFromMatch(match: RegExpExecArray): VerseRange | null {
  const start = parseVerseId(match[1])
  const end = match[2] === undefined ? start : parseVerseId(match[2])
  if (start === null || end === null) return null

  return compareVerses(start, end) <= 0 ? { start, end } : { start: end, end: start }
}

/** The `v` query value for a selection, e.g. `16` or `16-18`. */
export function formatVerseParam(range: VerseRange): string {
  return range.start === range.end ? range.start : `${range.start}-${range.end}`
}

/**
 * The query string for a selection, ready to navigate with. Empty when nothing
 * is selected, which drops the parameter instead of leaving `?v=` behind.
 */
export function verseSearch(range: VerseRange | null): string {
  return range ? `?${VERSE_PARAM_KEY}=${formatVerseParam(range)}` : ''
}

export function isVerseSelected(range: VerseRange | null, verse: VerseId): boolean {
  return range !== null && compareVerses(verse, range.start) >= 0 && compareVerses(verse, range.end) <= 0
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
export function nextSelection(state: SelectionState, verse: VerseId, click: VerseClick): SelectionState {
  const { range, anchor } = state
  const inside = isVerseSelected(range, verse)

  if (anchor !== null && (click.shiftKey || (click.touch && !inside))) {
    const forward = compareVerses(anchor, verse) <= 0
    return { range: { start: forward ? anchor : verse, end: forward ? verse : anchor }, anchor }
  }

  if (range !== null && range.start === verse && range.end === verse) {
    return EMPTY_SELECTION
  }

  return { range: { start: verse, end: verse }, anchor: verse }
}

/**
 * How a passage is written out: "João 3:16", "João 3:16-18", "João 3" when
 * nothing is selected. Same shape the thematic index uses for its references.
 */
export function passageReference(bookName: string, chapter: string, range: VerseRange | null): string {
  if (!range) return `${bookName} ${chapter}`
  return `${bookName} ${chapter}:${formatVerseParam(range)}`
}

/**
 * The reader path for a passage, with its verses selected.
 *
 * The one URL form there is: what the thematic index links to, what the share
 * button hands over, and what the address bar shows while reading are the same
 * string, so any of them can be copied anywhere and still unfurl.
 *
 * The edition leads, because the two editions disagree about what a reference
 * names: Dn 3,24 is the Prayer of Azariah in the Catholic edition and the
 * Hebrew verse in the Protestant one. A reader's own choice of edition is
 * remembered separately; what a link carries is what the link opens.
 */
export function passagePath(
  edition: string,
  bookSlug: string,
  chapter: string,
  range: VerseRange | null,
): string {
  return `/ler/${edition}/${bookSlug}/${chapter}${verseSearch(range)}`
}

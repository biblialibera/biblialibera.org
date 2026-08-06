/**
 * The shared card: what a link to biblialibera.org looks like inside WhatsApp.
 *
 * Built as plain `{ type, props }` objects rather than JSX. Satori accepts
 * them directly, and it keeps the functions free of a JSX pipeline: nothing
 * here depends on how Vercel's bundler happens to be configured to compile
 * .tsx, and `node --experimental-strip-types` can run the same module for the
 * local preview (npm run preview-og).
 *
 * The palette is the design system's, hard-coded: Satori resolves no CSS
 * variables, so tokens/colors.css cannot be the source here. Keep the two in
 * step by hand. Same for the seal, which is SealMark from Logo.tsx redrawn as
 * an SVG string.
 */

import type { Status } from './passage.js'
import { truncate } from './passage.js'

const PAPER = '#faf7f0'
const INK = '#26221c'
const INK_MUTED = '#6b6155'
const LINE = '#d8cdb6'
const OXBLOOD = '#9a3b2e'

const SEALS: Record<Status, { label: string; fg: string; bg: string; bd: string }> = {
  draft: { label: 'Rascunho', fg: '#8c8171', bg: '#efe8da', bd: '#ddd2bd' },
  checked: { label: 'Verificado', fg: '#9a7226', bg: '#f4ead2', bd: '#e6d3a6' },
  reviewed: { label: 'Revisado', fg: '#4f6b3f', bg: '#e6ecdc', bd: '#cdd9bd' },
}

export const SERIF = 'Source Serif 4'
export const SANS = 'Source Sans 3'
export const MONO = 'IBM Plex Mono'

export interface Element {
  type: string
  props: Record<string, unknown>
  key: null
}

type Child = Element | string | false | null | undefined

/**
 * Satori's element shape. `false` children drop out, so a slot can be optional.
 *
 * An element with no children leaves `children` off entirely rather than
 * setting it to `[]`: Satori reads an empty array as "more than one child" and
 * refuses to lay the element out unless it declares `display: flex`, which a
 * spacer or an image has no business declaring.
 */
function el(type: string, props: Record<string, unknown>, ...children: Child[]): Element {
  const kept = children.filter((c): c is Element | string => c !== false && c !== null && c !== undefined)
  if (kept.length === 0) return { type, props, key: null }
  return { type, props: { ...props, children: kept.length === 1 ? kept[0] : kept }, key: null }
}

// SealMark (Logo.tsx) as markup Satori can rasterise: the book knocked out in
// paper on a solid oxblood medallion.
const SEAL_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <circle cx="32" cy="32" r="30" fill="${OXBLOOD}"/>
  <path d="M32 45 C25 40 17 39 11 40 L11 23 C17 22 25 23 32 28 Z" fill="${PAPER}"/>
  <path d="M32 45 C39 40 47 39 53 40 L53 23 C47 22 39 23 32 28 Z" fill="${PAPER}"/>
  <g stroke="${PAPER}" stroke-width="1.8" stroke-linecap="round" fill="none">
    <path d="M32 27 L32 8"/><path d="M32 27 L26 10"/><path d="M32 27 L38 10"/>
    <path d="M32 27 L21.5 14"/><path d="M32 27 L42.5 14"/>
  </g>
  <path d="M32 28 L32 45" stroke="${OXBLOOD}" stroke-width="1.5"/>
</svg>`

const SEAL_URI = `data:image/svg+xml;base64,${Buffer.from(SEAL_SVG).toString('base64')}`

export interface CardContent {
  /** The small line above the text: a reference, or what kind of page this is. */
  eyebrow: string
  /** The quoted passage, or the page's own words. */
  body: string
  /** The review status, when the text has one. Themes and the site itself do not. */
  status?: Status
  /** Replaces the status pill with a plain line, for pages that carry a caveat. */
  note?: string
}

/**
 * The longest excerpt that fits the five lines the card has room for at its
 * smallest size. Chosen against the rendered output, not from the type metrics:
 * see npm run preview-og.
 */
export const CARD_MAX_CHARS = 270

/**
 * Body type shrinks in steps as the passage grows. Satori has no text autofit,
 * and a single size that fits a whole chapter would leave one verse looking
 * lost on the card.
 */
function bodySize(length: number): number {
  if (length > 200) return 36
  if (length > 110) return 44
  return 54
}

export function cardElement({ eyebrow, body, status, note }: CardContent): Element {
  const text = truncate(body, CARD_MAX_CHARS)
  const seal = status ? SEALS[status] : null

  return el(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        background: PAPER,
        padding: '72px 80px 60px',
        position: 'relative',
      },
    },
    // The rubric rule along the top edge: the same oxblood the reader uses for
    // verse numbers, so the card is recognisably from this site at thumbnail size.
    el('div', {
      style: { position: 'absolute', top: 0, left: 0, width: '1200px', height: '12px', background: OXBLOOD },
    }),
    el(
      'div',
      { style: { display: 'flex', alignItems: 'center', gap: '18px' } },
      el('img', { src: SEAL_URI, width: 46, height: 46 }),
      el(
        'div',
        { style: { display: 'flex', fontFamily: SERIF, fontSize: '30px', letterSpacing: '-0.012em' } },
        el('span', { style: { color: INK } }, 'Biblia '),
        el('span', { style: { color: OXBLOOD } }, 'Libera'),
      ),
    ),
    el(
      'div',
      {
        style: {
          display: 'flex',
          fontFamily: MONO,
          fontSize: '25px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: OXBLOOD,
          marginTop: '46px',
        },
      },
      eyebrow,
    ),
    // Takes the rest of the height and clips: the text is cut to fit before it
    // gets here, but a long word or an unlucky wrap must never be able to spill
    // over the rule at the bottom.
    el(
      'div',
      {
        style: {
          display: 'flex',
          flexGrow: 1,
          overflow: 'hidden',
          fontFamily: SERIF,
          fontSize: `${bodySize(text.length)}px`,
          lineHeight: 1.34,
          color: INK,
          marginTop: '20px',
        },
      },
      text,
    ),
    el(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: `1px solid ${LINE}`,
          paddingTop: '26px',
          fontFamily: SANS,
          fontSize: '22px',
          color: INK_MUTED,
        },
      },
      seal
        ? el(
            'div',
            {
              style: {
                display: 'flex',
                padding: '6px 18px',
                borderRadius: '999px',
                background: seal.bg,
                border: `1px solid ${seal.bd}`,
                color: seal.fg,
                fontSize: '20px',
              },
            },
            seal.label,
          )
        : el('div', { style: { display: 'flex' } }, note ?? ''),
      el('div', { style: { display: 'flex', fontFamily: MONO, letterSpacing: '0.06em' } }, 'biblialibera.org'),
    ),
  )
}

/**
 * Every character the card draws, which is what the fonts get subset to.
 *
 * The eyebrow is counted twice, once uppercased: `textTransform` runs inside
 * Satori, after the font is chosen, so a subset built from the original casing
 * would be missing the very glyphs the reference is drawn with. The wordmark,
 * the domain and the seal labels come from this module rather than from the
 * caller, so they have to be added here or they come out blank.
 */
export function cardText({ eyebrow, body, note }: CardContent): string {
  const seals = Object.values(SEALS).map((s) => s.label)
  return [eyebrow, eyebrow.toUpperCase(), body, note ?? '', 'Biblia Libera', 'biblialibera.org', ...seals].join(' ')
}

/** Satori takes the CSS weight as a literal, not any number. */
type FontWeight = 400 | 500 | 600

interface GoogleFont {
  name: string
  weight: FontWeight
}

const CARD_FONTS: GoogleFont[] = [
  { name: SERIF, weight: 400 },
  { name: SANS, weight: 600 },
  { name: MONO, weight: 500 },
]

export interface LoadedFont {
  name: string
  data: ArrayBuffer
  weight: FontWeight
  style: 'normal'
}

/**
 * The fonts the card draws with, subset to the characters it actually uses.
 *
 * Fetched from Google Fonts at render time instead of committed: Satori only
 * reads ttf/otf/woff, and three full families would eat most of the 500KB a
 * function bundle is allowed. Asking css2 for `&text=` returns a truetype face
 * carrying just these glyphs, a few KB each. Requesting without a browser
 * user-agent is what makes Google answer in truetype rather than woff2.
 */
export async function loadCardFonts(content: CardContent): Promise<LoadedFont[]> {
  const glyphs = [...new Set(cardText(content))].join('')
  return Promise.all(CARD_FONTS.map((font) => loadGoogleFont(font, glyphs)))
}

async function loadGoogleFont({ name, weight }: GoogleFont, text: string): Promise<LoadedFont> {
  const family = name.replace(/ /g, '+')
  const url = `https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`
  const css = await (await fetch(url)).text()
  const source = /src: url\((.+?)\) format\('(?:opentype|truetype)'\)/.exec(css)
  if (!source) throw new Error(`no truetype face for ${name} ${weight}`)

  const response = await fetch(source[1])
  if (!response.ok) throw new Error(`failed to download ${name} ${weight}`)

  return { name, data: await response.arrayBuffer(), weight, style: 'normal' }
}

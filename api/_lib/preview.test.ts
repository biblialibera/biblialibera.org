import { describe, expect, it, vi } from 'vitest'
import type { ChapterText } from './passage.ts'
import { cardContentFor, defaultPreview, renderPreviewHtml, resolvePreview } from './preview.ts'

const ORIGIN = 'https://biblialibera.org'

const CHAPTER: ChapterText = {
  book: 'João',
  abbrev: 'Jo',
  slug: 'joao',
  chapter: 3,
  status: 'checked',
  verses: [
    { n: 16, t: 'Porque Deus amou o mundo de tal maneira que deu o seu Filho unigênito.' },
    { n: 17, t: 'Ele disse: "não vim julgar o mundo".' },
  ],
}

const chapterFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => CHAPTER })
const missingFetch = vi.fn().mockResolvedValue({ ok: false, json: async () => null })

const reader = (verses: { start: number; end: number } | null) => ({
  origin: ORIGIN,
  kind: 'reader',
  slug: 'joao',
  chapter: '3',
  verses,
})

describe('resolvePreview for the reader', () => {
  it('titles the unfurl with the passage and quotes it underneath', async () => {
    const preview = await resolvePreview(reader({ start: 16, end: 16 }), chapterFetch)
    expect(preview?.title).toBe('João 3:16')
    expect(preview?.description).toBe(CHAPTER.verses[0].t)
  })

  // WhatsApp resolves og:image against nothing: a relative URL is a missing
  // image, and a missing image is a link that does not unfurl at all.
  it('points at the card with an absolute URL', async () => {
    const preview = await resolvePreview(reader({ start: 16, end: 17 }), chapterFetch)
    expect(preview?.image).toBe(`${ORIGIN}/api/og?kind=reader&slug=joao&chapter=3&v=16-17`)
  })

  it('links back to the page that was shared, passage and all', async () => {
    const preview = await resolvePreview(reader({ start: 16, end: 17 }), chapterFetch)
    expect(preview?.url).toBe(`${ORIGIN}/ler/joao/3?v=16-17`)
  })

  it('drops the passage from both when the link names no verses', async () => {
    const preview = await resolvePreview(reader(null), chapterFetch)
    expect(preview?.title).toBe('João 3')
    expect(preview?.url).toBe(`${ORIGIN}/ler/joao/3`)
    expect(preview?.image).toBe(`${ORIGIN}/api/og?kind=reader&slug=joao&chapter=3`)
  })

  // The image URL is what WhatsApp caches the preview under, so it has to name
  // the passage the card actually drew, not the one the link asked for.
  it('names the verses that exist when the link overshoots the chapter', async () => {
    const preview = await resolvePreview(reader({ start: 17, end: 90 }), chapterFetch)
    expect(preview?.title).toBe('João 3:17')
    expect(preview?.image).toBe(`${ORIGIN}/api/og?kind=reader&slug=joao&chapter=3&v=17`)
  })

  it('answers nothing for a chapter that does not exist', async () => {
    await expect(resolvePreview(reader(null), missingFetch)).resolves.toBeNull()
  })
})

describe('resolvePreview for a theme', () => {
  const theme = { origin: ORIGIN, kind: 'theme', slug: 'amor', chapter: null, verses: null }

  it('titles the unfurl with the theme and counts its passages', async () => {
    const preview = await resolvePreview(theme, chapterFetch)
    expect(preview?.title).toBe('Amor · Índice temático')
    expect(preview?.description).toMatch(/\d+ passagens\.$/)
    expect(preview?.url).toBe(`${ORIGIN}/temas/amor`)
  })

  it('answers nothing for a theme that does not exist', async () => {
    await expect(resolvePreview({ ...theme, slug: 'inexistente' }, chapterFetch)).resolves.toBeNull()
  })
})

describe('resolvePreview for anything else', () => {
  it('answers nothing, leaving the route to the site-wide tags', async () => {
    const request = { origin: ORIGIN, kind: null, slug: null, chapter: null, verses: null }
    await expect(resolvePreview(request, chapterFetch)).resolves.toBeNull()
  })
})

describe('renderPreviewHtml', () => {
  it('writes the tags a crawler comes for', async () => {
    const preview = await resolvePreview(reader({ start: 16, end: 16 }), chapterFetch)
    const html = renderPreviewHtml(preview!)

    expect(html).toContain('<meta property="og:title" content="João 3:16" />')
    // The ampersands between the image parameters are escaped, as an attribute
    // value has to be: a crawler reads them back as the URL that was meant.
    expect(html).toContain(`<meta property="og:image" content="${preview!.image.replace(/&/g, '&amp;')}" />`)
    expect(html).toContain('<meta property="og:image:width" content="1200" />')
    expect(html).toContain('<meta name="twitter:card" content="summary_large_image" />')
  })

  // Scripture is full of quoted speech, and an unescaped quotation mark closes
  // the content attribute early: the tag then carries half a verse.
  it('escapes the quotation marks the text is full of', () => {
    const html = renderPreviewHtml({
      title: 'João 3:17',
      description: CHAPTER.verses[1].t,
      image: `${ORIGIN}/api/og`,
      url: `${ORIGIN}/ler/joao/3`,
    })

    expect(html).toContain('&quot;não vim julgar o mundo&quot;')
    expect(html).not.toContain('"não vim')
  })

  // Some unfurlers follow a redirect and would then read the SPA shell's
  // generic tags instead of these.
  it('does not redirect', () => {
    const html = renderPreviewHtml(defaultPreview(ORIGIN))
    expect(html).not.toContain('http-equiv')
  })
})

describe('cardContentFor', () => {
  it('draws the passage with the review status of the book it came from', async () => {
    const content = await cardContentFor(reader({ start: 16, end: 16 }), chapterFetch)
    expect(content).toEqual({ eyebrow: 'João 3:16', body: CHAPTER.verses[0].t, status: 'checked' })
  })

  // The thematic index has not been through human review. The page says so, and
  // the card travels further than the page.
  it('carries the missing review over to a theme card', async () => {
    const content = await cardContentFor({ origin: ORIGIN, kind: 'theme', slug: 'amor', chapter: null, verses: null }, chapterFetch)
    expect(content.eyebrow).toBe('Amor')
    expect(content.note).toBe('Índice sem revisão humana')
    expect(content.status).toBeUndefined()
  })

  // A card that fails to render is a link that does not unfurl, so there is
  // always something to draw.
  it('falls back to the site card when the passage cannot be found', async () => {
    const content = await cardContentFor(reader({ start: 1, end: 1 }), missingFetch)
    expect(content.eyebrow).toBe('Das línguas originais')
  })
})

/**
 * The Open Graph preview a link unfurls into, and the stub page carrying it.
 *
 * Only social crawlers ever reach this: vercel.json routes them here by
 * user-agent and leaves every human on the static SPA, which is why the stub
 * can be this thin. Search engines are deliberately not on that list, so they
 * keep getting the real app and no one has to reason about two versions of the
 * same page competing in an index.
 */

import type { VerseRange } from '../../src/components/verseSelection.js'
import { formatVerseParam } from '../../src/components/verseSelection.js'
import type { CardContent } from './card.js'
import type { Fetch } from './passage.js'
import { buildPassage, loadChapter, truncate } from './passage.js'
import themeSource from '../../src/data/themes.source.json' with { type: 'json' }

/** How much of a passage the unfurled description shows before it is cut. */
const DESCRIPTION_MAX_CHARS = 200

const SITE_NAME = 'Biblia Libera'
const SITE_DESCRIPTION =
  'Tradução aberta e transparente da Bíblia, do hebraico e do grego para o português contemporâneo.'

export interface Preview {
  title: string
  description: string
  /** Absolute, as required: a crawler has no page to resolve a relative one against. */
  image: string
  /** The page the reader actually shared, which the preview links back to. */
  url: string
}

export interface PreviewRequest {
  origin: string
  kind: string | null
  slug: string | null
  chapter: string | null
  verses: VerseRange | null
}

/** The preview for a shared URL, or null when the route carries nothing specific. */
export async function resolvePreview(request: PreviewRequest, fetchImpl: Fetch): Promise<Preview | null> {
  if (request.kind === 'reader') return readerPreview(request, fetchImpl)
  if (request.kind === 'theme') return themePreview(request)
  return null
}

async function readerPreview({ origin, slug, chapter, verses }: PreviewRequest, fetchImpl: Fetch): Promise<Preview | null> {
  if (!slug) return null

  const chapterNumber = Number(chapter)
  const text = await loadChapter(origin, slug, chapterNumber, fetchImpl)
  if (!text) return null

  const passage = buildPassage(text, verses)
  const image = new URL('/api/og', origin)
  image.searchParams.set('kind', 'reader')
  image.searchParams.set('slug', slug)
  image.searchParams.set('chapter', String(chapterNumber))
  if (passage.range) image.searchParams.set('v', formatVerseParam(passage.range))

  const page = new URL(`/ler/${slug}/${chapterNumber}`, origin)
  if (passage.range) page.searchParams.set('v', formatVerseParam(passage.range))

  return {
    title: passage.reference,
    description: truncate(passage.text, DESCRIPTION_MAX_CHARS),
    image: image.toString(),
    url: page.toString(),
  }
}

function themePreview({ origin, slug }: PreviewRequest): Preview | null {
  const theme = themeSource.themes.find((t) => t.slug === slug)
  if (!theme) return null

  const image = new URL('/api/og', origin)
  image.searchParams.set('kind', 'theme')
  image.searchParams.set('slug', theme.slug)

  const count = theme.passages.length

  return {
    title: `${theme.name} · Índice temático`,
    description: `${theme.summary} ${count} ${count === 1 ? 'passagem' : 'passagens'}.`,
    image: image.toString(),
    url: new URL(`/temas/${theme.slug}`, origin).toString(),
  }
}

/**
 * What the card draws for a shared URL.
 *
 * Always answers something: an unreachable chapter or an unknown theme falls
 * back to the site's own card rather than to a broken image, since a missing
 * og:image is what makes WhatsApp drop the preview altogether.
 */
export async function cardContentFor(request: PreviewRequest, fetchImpl: Fetch): Promise<CardContent> {
  if (request.kind === 'reader' && request.slug) {
    const chapter = await loadChapter(request.origin, request.slug, Number(request.chapter), fetchImpl)
    if (chapter) {
      const passage = buildPassage(chapter, request.verses)
      return { eyebrow: passage.reference, body: passage.text, status: passage.status }
    }
  }

  if (request.kind === 'theme') {
    const theme = themeSource.themes.find((t) => t.slug === request.slug)
    // The thematic index is curated here and has not been through human review;
    // the page says so, and the card that travels further than the page has to
    // say so too.
    if (theme) return { eyebrow: theme.name, body: theme.summary, note: 'Índice sem revisão humana' }
  }

  // The landing page's own headline, so the site's card and its first screen
  // say the same thing.
  return { eyebrow: 'Das línguas originais', body: 'A Bíblia em português atual, livre para todos.', note: 'CC BY 4.0' }
}

/**
 * The stub the crawler is served: the tags it came for, plus enough of a page
 * that a person who lands here by accident is not staring at a blank document.
 * No redirect, deliberately: some unfurlers follow one and would then read the
 * SPA shell's generic tags instead of these.
 */
export function renderPreviewHtml(preview: Preview): string {
  const tags = [
    ['og:type', 'article'],
    ['og:site_name', SITE_NAME],
    ['og:title', preview.title],
    ['og:description', preview.description],
    ['og:image', preview.image],
    ['og:image:width', '1200'],
    ['og:image:height', '630'],
    ['og:url', preview.url],
  ]

  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeHtml(preview.title)} · ${SITE_NAME}</title>
    <meta name="description" content="${escapeHtml(preview.description)}" />
${tags.map(([property, content]) => `    <meta property="${property}" content="${escapeHtml(content)}" />`).join('\n')}
    <meta name="twitter:card" content="summary_large_image" />
    <link rel="canonical" href="${escapeHtml(preview.url)}" />
  </head>
  <body>
    <h1>${escapeHtml(preview.title)}</h1>
    <p>${escapeHtml(preview.description)}</p>
    <p><a href="${escapeHtml(preview.url)}">Ler em ${SITE_NAME}</a></p>
  </body>
</html>
`
}

/** The site-wide tags, for a route with nothing of its own to say. */
export function defaultPreview(origin: string): Preview {
  return {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    image: new URL('/api/og', origin).toString(),
    url: new URL('/', origin).toString(),
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

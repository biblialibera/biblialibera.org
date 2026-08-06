/**
 * Serves the Open Graph stub to social crawlers.
 *
 * vercel.json rewrites `/ler/:slug/:chapter` and `/temas/:slug` here when the
 * user-agent is one of the unfurlers, passing the route as query parameters
 * and carrying the original `?v=` along. Every other visitor is untouched and
 * still gets the static index.html, so the reader pays nothing for this.
 */

import { parseVerseQuery } from '../src/components/verseSelection.ts'
import { defaultPreview, renderPreviewHtml, resolvePreview } from './_lib/preview.ts'

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const origin = publicOrigin(request, url)

  const preview =
    (await resolvePreview(
      {
        origin,
        kind: url.searchParams.get('kind'),
        slug: url.searchParams.get('slug'),
        chapter: url.searchParams.get('chapter'),
        verses: parseVerseQuery(url.search),
      },
      fetch,
    )) ?? defaultPreview(origin)

  return new Response(renderPreviewHtml(preview), {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      // A day at the edge, a week of serving the stale copy while it refreshes:
      // the text behind a preview only moves when the site is deployed again.
      'cache-control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}

/**
 * The origin as the world sees it. `request.url` inside a function carries the
 * internal host, and an og:image URL built from that would point somewhere the
 * crawler cannot reach.
 */
function publicOrigin(request: Request, url: URL): string {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  if (!host) return url.origin

  const proto = request.headers.get('x-forwarded-proto') ?? 'https'
  return `${proto}://${host}`
}

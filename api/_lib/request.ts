/**
 * Reads an incoming request into the route both functions answer for.
 *
 * Shared so the card and the tags can never disagree about which passage a
 * request is about, and so the one fiddly part, the origin, has a single
 * answer.
 */

import { parseVerseQuery } from '../../src/components/verseSelection.js'
import type { PreviewRequest } from './preview.js'

export function previewRequestFrom(request: Request): PreviewRequest {
  const url = new URL(request.url)

  return {
    origin: publicOrigin(request, url),
    kind: url.searchParams.get('kind'),
    edition: url.searchParams.get('edition'),
    slug: url.searchParams.get('slug'),
    chapter: url.searchParams.get('chapter'),
    verses: parseVerseQuery(url.search),
  }
}

/**
 * The origin as the world sees it. The URL a function is invoked with carries
 * the internal host, and an og:image built from that would point somewhere the
 * crawler cannot reach, so the forwarded headers win when they are there.
 */
function publicOrigin(request: Request, url: URL): string {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  if (!host) return url.origin

  const proto = request.headers.get('x-forwarded-proto') ?? 'https'
  return `${proto}://${host}`
}

/**
 * Renders the card a shared link unfurls into: 1200x630 PNG, drawn by Satori.
 *
 * The URL is deliberately short and derived only from the route
 * (`?kind=reader&slug=joao&chapter=3&v=16-18`), never carrying the verse text
 * itself: WhatsApp caches a preview image by URL, and the text has to stay a
 * function of the data rather than of whatever a stale link happens to spell.
 */

import { ImageResponse } from '@vercel/og'
import type { ReactElement } from 'react'
import { parseVerseQuery } from '../src/components/verseSelection.ts'
import { cardElement, loadCardFonts } from './_lib/card.ts'
import { cardContentFor } from './_lib/preview.ts'

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') ?? 'https'

  const content = await cardContentFor(
    {
      origin: host ? `${proto}://${host}` : url.origin,
      kind: url.searchParams.get('kind'),
      slug: url.searchParams.get('slug'),
      chapter: url.searchParams.get('chapter'),
      verses: parseVerseQuery(url.search),
    },
    fetch,
  )

  const fonts = await loadCardFonts(content)

  return new ImageResponse(cardElement(content) as unknown as ReactElement, {
    width: 1200,
    height: 630,
    fonts,
    headers: {
      'cache-control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}

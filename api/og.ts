/**
 * Renders the card a shared link unfurls into: 1200x630 PNG, drawn by Satori.
 *
 * The URL is deliberately short and derived only from the route
 * (`?kind=reader&slug=joao&chapter=3&v=16-18`), never carrying the verse text
 * itself: WhatsApp caches a preview image by URL, and the text has to stay a
 * function of the data rather than of whatever a stale link happens to spell.
 *
 * Exported as `{ fetch }`, the Web Handler form. A bare `export default
 * function handler(...)` is the older Node signature, and Vercel then calls it
 * with (req, res) instead of a Request: `req.url` is a path, `new URL()` of it
 * throws, and the function crashes on every invocation. The `fetch` export also
 * answers every method in one place, which matters because some unfurlers send
 * HEAD before they send GET.
 */

import { ImageResponse } from '@vercel/og'
import type { ReactElement } from 'react'
import { cardElement, loadCardFonts } from './_lib/card.js'
import { cardContentFor } from './_lib/preview.js'
import { previewRequestFrom } from './_lib/request.js'

export default {
  async fetch(request: Request): Promise<Response> {
    const content = await cardContentFor(previewRequestFrom(request), fetch)
    const fonts = await loadCardFonts(content)

    return new ImageResponse(cardElement(content) as unknown as ReactElement, {
      width: 1200,
      height: 630,
      fonts,
      headers: {
        'cache-control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
      },
    })
  },
}

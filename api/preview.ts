/**
 * Serves the Open Graph stub to social crawlers.
 *
 * vercel.json rewrites `/ler/:slug/:chapter` and `/temas/:slug` here when the
 * user-agent is one of the unfurlers, passing the route as query parameters
 * and carrying the original `?v=` along. Every other visitor is untouched and
 * still gets the static index.html, so the reader pays nothing for this.
 *
 * Exported as `{ fetch }`: see the note in og.ts for why a bare default
 * function is not the same thing.
 */

import { defaultPreview, renderPreviewHtml, resolvePreview } from './_lib/preview.js'
import { previewRequestFrom } from './_lib/request.js'

export default {
  async fetch(request: Request): Promise<Response> {
    const previewRequest = previewRequestFrom(request)
    const preview = (await resolvePreview(previewRequest, fetch)) ?? defaultPreview(previewRequest.origin)

    return new Response(renderPreviewHtml(preview), {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        // A day at the edge, a week of serving the stale copy while it refreshes:
        // the text behind a preview only moves when the site is deployed again.
        'cache-control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
      },
    })
  },
}

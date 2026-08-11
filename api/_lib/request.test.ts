import { describe, expect, it } from 'vitest'
import { previewRequestFrom } from './request.js'

const url = 'https://internal.vercel.app/api/og?kind=reader&edition=catolica&slug=joao&chapter=3&v=16-18'

describe('previewRequestFrom', () => {
  it('reads the route out of the query the rewrite passes along', () => {
    const request = previewRequestFrom(new Request(url))
    expect(request.kind).toBe('reader')
    expect(request.edition).toBe('catolica')
    expect(request.slug).toBe('joao')
    expect(request.chapter).toBe('3')
    expect(request.verses).toEqual({ start: '16', end: '18' })
  })

  // A function is invoked on an internal host. An og:image built from that
  // points somewhere no crawler can reach, and the preview arrives with no
  // image at all.
  it('takes the origin from the host the world used', () => {
    const request = previewRequestFrom(
      new Request(url, { headers: { 'x-forwarded-host': 'biblialibera.org', 'x-forwarded-proto': 'https' } }),
    )
    expect(request.origin).toBe('https://biblialibera.org')
  })

  it('falls back to the plain host header', () => {
    const request = previewRequestFrom(new Request(url, { headers: { host: 'preview.vercel.app' } }))
    expect(request.origin).toBe('https://preview.vercel.app')
  })

  it('falls back to the URL itself when nothing was forwarded', () => {
    expect(previewRequestFrom(new Request(url)).origin).toBe('https://internal.vercel.app')
  })

  it('carries no passage when the link names none', () => {
    expect(previewRequestFrom(new Request('https://biblialibera.org/api/og')).verses).toBeNull()
  })
})

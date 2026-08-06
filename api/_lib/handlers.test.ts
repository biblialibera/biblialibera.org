/**
 * The handlers as Vercel invokes them, and the two ways the first deploy of
 * this feature broke. Both were invisible to the unit tests, which call the
 * library underneath, and both only showed up in production logs.
 *
 * The file lives under _lib rather than next to the handlers because Vercel
 * turns every .ts file directly inside /api into a function: a test file there
 * would deploy as a route. Anything under an underscore-prefixed directory is
 * ignored, which is what _lib is for.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { afterEach, describe, expect, it, vi } from 'vitest'
import og from '../og.js'
import preview from '../preview.js'
import type { ChapterText } from './passage.js'

const CHAPTER: ChapterText = {
  book: 'João',
  abbrev: 'Jo',
  slug: 'joao',
  chapter: 3,
  status: 'checked',
  verses: [{ n: 16, t: 'Porque Deus amou o mundo de tal maneira.' }],
}

afterEach(() => vi.unstubAllGlobals())

const crawlerRequest = (url: string) =>
  new Request(url, {
    headers: {
      'user-agent': 'WhatsApp/2.23.20.0',
      'x-forwarded-host': 'biblialibera.org',
      'x-forwarded-proto': 'https',
    },
  })

// Failure one: a bare `export default async function handler(request)` is the
// older Node signature, so Vercel calls it with (req, res) instead of a
// Request. `new URL(req.url)` then throws on a bare path and every invocation
// 500s.
describe('the preview function', () => {
  it('is exported as a Web Handler, not as a Node one', () => {
    expect(typeof preview.fetch).toBe('function')
  })

  it('answers a crawler with the tags for the passage', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => CHAPTER }),
    )

    const response = await preview.fetch(
      crawlerRequest('https://internal.vercel.app/api/preview?kind=reader&slug=joao&chapter=3&v=16'),
    )
    const html = await response.text()

    expect(response.headers.get('content-type')).toBe('text/html; charset=utf-8')
    expect(html).toContain('<meta property="og:title" content="João 3:16" />')
    // Built from the forwarded host: the internal one is unreachable.
    expect(html).toContain('content="https://biblialibera.org/api/og?kind=reader')
  })

  it('still answers with the site tags when the chapter cannot be loaded', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')))

    const response = await preview.fetch(
      crawlerRequest('https://internal.vercel.app/api/preview?kind=reader&slug=joao&chapter=3'),
    )

    expect(response.status).toBe(200)
    expect(await response.text()).toContain('<meta property="og:title" content="Biblia Libera" />')
  })
})

describe('the card function', () => {
  // Not invoked here: rendering downloads font subsets from Google. The card
  // itself is checked by rendering it to a file, npm run preview-og.
  it('is exported as a Web Handler, not as a Node one', () => {
    expect(typeof og.fetch).toBe('function')
  })
})

// Failure two: Vercel does not bundle these functions. It compiles each file
// on its own and lets Node resolve the imports at runtime, so a specifier
// ending in .ts points at a file that no longer exists over there:
// ERR_MODULE_NOT_FOUND, on every invocation. TypeScript and Vitest both
// resolve ./x.js back to x.ts, so the .js extension is right everywhere; only
// the runtime can tell, which is why this is checked as text.
describe('the imports the functions ship with', () => {
  // From the project root: Vitest serves this module over its own protocol, so
  // import.meta.url is not a file path here.
  const apiDir = `${process.cwd()}/api/`

  const sources = readdirSync(apiDir, { recursive: true, encoding: 'utf8' })
    .filter((name) => name.endsWith('.ts') && !name.endsWith('.test.ts'))
    .map((name) => ({ name, code: readFileSync(`${apiDir}${name}`, 'utf8') }))

  it('covers every module under api/', () => {
    expect(sources.length).toBeGreaterThan(4)
  })

  it.each(sources)('resolves at runtime: $name', ({ code }) => {
    const relative = [...code.matchAll(/from '(\.[^']+)'/g)].map(([, specifier]) => specifier)
    expect(relative.length).toBeGreaterThan(0)
    expect(relative.filter((specifier) => specifier.endsWith('.ts'))).toEqual([])
    expect(relative.filter((specifier) => !/\.(js|json)$/.test(specifier))).toEqual([])
  })
})

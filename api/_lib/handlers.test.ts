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
import vercelConfig from '../../vercel.json' with { type: 'json' }
import readerIndex from '../../src/data/reader/index.json' with { type: 'json' }

const CHAPTER: ChapterText = {
  book: 'João',
  abbrev: 'Jo',
  slug: 'joao',
  edition: 'catolica',
  chapter: '3',
  status: 'checked',
  verses: [{ n: '16', t: 'Porque Deus amou o mundo de tal maneira.' }],
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
      crawlerRequest(
        'https://internal.vercel.app/api/preview?kind=reader&edition=catolica&slug=joao&chapter=3&v=16',
      ),
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
      crawlerRequest('https://internal.vercel.app/api/preview?kind=reader&edition=catolica&slug=joao&chapter=3'),
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

// The rewrite is the only thing that tells a function which edition a shared
// link was reading, and nothing else in the suite can see it: it is JSON that
// only Vercel reads, and a wrong value there means every card quotes the wrong
// edition while every test stays green.
describe('the rewrite that sends crawlers here', () => {
  const readerRewrites = vercelConfig.rewrites.filter((r) => r.destination.includes('kind=reader'))

  it('carries the edition from the path', () => {
    const withEdition = readerRewrites.find((r) => r.source === '/ler/:edition/:slug/:chapter')
    expect(withEdition?.destination).toContain('edition=:edition')
  })

  // Links handed out before the edition moved into the path are still out
  // there, and they mean whichever edition a reader with no preference gets.
  it('resolves an edition-less link the same way the app does', () => {
    const legacy = readerRewrites.find((r) => r.source === '/ler/:slug/:chapter')
    // The same fallback the app applies, read off the generated index rather
    // than off src/components/editions.ts: importing that here would pull the
    // reader's Vite-only module graph into the api TypeScript project.
    expect(legacy?.destination).toContain(`edition=${readerIndex[0].key}`)
  })

  it('leaves every other visitor on the static app', () => {
    expect(vercelConfig.rewrites.at(-1)).toEqual({ source: '/(.*)', destination: '/index.html' })
    for (const rewrite of readerRewrites) {
      expect(rewrite.has?.[0].value).toContain('WhatsApp')
    }
  })
})

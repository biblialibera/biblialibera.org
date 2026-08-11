// Renders the link-preview cards to PNG files so they can be looked at without
// deploying:
//
//   npm run sync-og-text && npm run preview-og
//
// Output: .og-preview/<name>.png (gitignored)
//
// It runs the real api/_lib code, with the chapter text read off the disk
// instead of fetched, so what comes out here is what the function draws in
// production. Node runs the TypeScript directly (type stripping), which is why
// those modules import each other with explicit .ts extensions.
//
// The one thing this cannot check is the unfurl itself: only a public URL can
// tell you whether WhatsApp is happy with the tags. Deploy a preview and paste
// a link into a chat.

import { ImageResponse } from '@vercel/og';
import { mkdirSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { cardElement, loadCardFonts } from '../api/_lib/card.ts';
import { cardContentFor } from '../api/_lib/preview.ts';

const publicDir = new URL('../public/', import.meta.url);
const outDir = new URL('../.og-preview/', import.meta.url);

/** Stands in for fetch: /og/catolica/joao/3.json is that path under public/. */
const fileFetch = async (url) => {
  const path = new URL(new URL(url).pathname.replace(/^\//, ''), publicDir);
  try {
    const body = await readFile(fileURLToPath(path), 'utf8');
    return { ok: true, json: async () => JSON.parse(body) };
  } catch {
    return { ok: false, json: async () => null };
  }
};

const samples = [
  { name: 'verse', kind: 'reader', edition: 'catolica', slug: 'joao', chapter: '3', v: '16' },
  { name: 'range', kind: 'reader', edition: 'catolica', slug: 'joao', chapter: '3', v: '16-18' },
  { name: 'range-long', kind: 'reader', edition: 'catolica', slug: 'salmos', chapter: '23', v: '1-6' },
  { name: 'chapter', kind: 'reader', edition: 'protestante', slug: 'genesis', chapter: '1', v: null },
  { name: 'rtl-book', kind: 'reader', edition: 'catolica', slug: 'isaias', chapter: '53', v: '5' },
  // Deuterocanonical, so it only exists in one of the two editions.
  { name: 'deuterocanonical', kind: 'reader', edition: 'catolica', slug: 'tobias', chapter: '4', v: '15' },
  // The same reference in the two editions, which is the whole reason the
  // edition is in the URL: this is the Prayer of Azariah in one and the
  // Hebrew verse in the other.
  { name: 'daniel-catolica', kind: 'reader', edition: 'catolica', slug: 'daniel', chapter: '3', v: '24' },
  { name: 'daniel-protestante', kind: 'reader', edition: 'protestante', slug: 'daniel', chapter: '3', v: '24' },
  // Lettered sub-verses, which only the assembled Esther has.
  { name: 'sub-verse', kind: 'reader', edition: 'catolica', slug: 'ester', chapter: '5', v: '1a-1c' },
  { name: 'theme', kind: 'theme', edition: null, slug: 'amor', chapter: null, v: null },
  { name: 'site', kind: null, edition: null, slug: null, chapter: null, v: null },
];

mkdirSync(fileURLToPath(outDir), { recursive: true });

for (const sample of samples) {
  const verses = sample.v ? parseRange(sample.v) : null;
  const content = await cardContentFor({ origin: 'https://biblialibera.org', ...sample, verses }, fileFetch);
  const fonts = await loadCardFonts(content);
  const image = new ImageResponse(cardElement(content), { width: 1200, height: 630, fonts });
  const buffer = Buffer.from(await image.arrayBuffer());
  const path = fileURLToPath(new URL(`${sample.name}.png`, outDir));
  writeFileSync(path, buffer);
  console.log(`${path}  ${(buffer.length / 1024).toFixed(0)}KB  ${content.eyebrow}`);
}

function parseRange(value) {
  const [start, end] = value.split('-');
  return { start, end: end ?? start };
}

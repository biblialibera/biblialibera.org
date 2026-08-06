// Writes the chapter text the link-preview functions read, one small file per
// chapter, into public/ so it ships as a plain static asset:
//
//   node scripts/build-og-text.mjs
//
// Output: public/og/<slug>/<chapter>.json
//
// The functions under api/ cannot import src/data/reader/ directly. @vercel/og
// caps a function bundle at 500KB including every asset it pulls in, and the
// reader data is 14MB; the Vercel docs answer for exactly this case is to fetch
// the data at runtime instead of bundling it. So the card and the meta tags
// fetch these files off our own CDN, which also keeps them cached next to the
// image they feed.
//
// Only what a preview needs is copied: the pt (formal) text, no footnotes and
// no original-language text. That is what keeps a chapter around 3KB instead of
// the tens of KB it occupies in the reader data.

import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dataDir = new URL('../src/data/reader/', import.meta.url);
const outDir = new URL('../public/og/', import.meta.url);

const readJson = (url) => JSON.parse(readFileSync(url, 'utf8'));

const readerIndex = readJson(new URL('index.json', dataDir));

rmSync(outDir, { recursive: true, force: true });

let chapters = 0;

for (const entry of readerIndex) {
  const book = readJson(new URL(`${entry.code}.json`, dataDir));
  const bookDir = new URL(`${entry.slug}/`, outDir);
  mkdirSync(fileURLToPath(bookDir), { recursive: true });

  for (const chapter of book.chapters) {
    const payload = {
      book: book.name,
      abbrev: book.abbrev,
      slug: book.slug,
      chapter: chapter.chapter,
      status: book.status.formal,
      verses: chapter.formal.map((v) => ({ n: v.verse, t: v.text })),
    };
    writeFileSync(fileURLToPath(new URL(`${chapter.chapter}.json`, bookDir)), JSON.stringify(payload), 'utf8');
    chapters += 1;
  }
}

console.log(`build-og-text: ${chapters} chapters from ${readerIndex.length} books`);

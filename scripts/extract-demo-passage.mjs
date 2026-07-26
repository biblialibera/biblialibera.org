// Extracts the small excerpt the landing page's live demo needs (Salmo 23,
// verses 1-4, formal register and original text) from the `biblialibera`
// package into a tiny local JSON file, instead of shipping the whole book
// (~800kB) to the browser bundle. Re-run after updating the `biblialibera`
// dependency:
//
//   node scripts/extract-demo-passage.mjs

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ptFormalPs from '../node_modules/biblialibera/data/pt/formal/Ps.json' with { type: 'json' };
import ptManifest from '../node_modules/biblialibera/data/pt/manifest.json' with { type: 'json' };
import { corpora, getBook } from 'biblialibera/original';

const BOOK = 'Ps';
const CHAPTER = 23;
const VERSE_COUNT = 4;

// Reading direction and pt-BR language label per original corpus, same as
// scripts/build-reader-data.mjs.
const CORPUS_META = {
  wlc: { language: 'Hebraico', dir: 'rtl' },
  n4: { language: 'Grego', dir: 'ltr' },
  lxx: { language: 'Grego', dir: 'ltr' },
};

function excerpt(book) {
  const chapter = book.chapters.find((c) => c.chapter === CHAPTER);
  if (!chapter) throw new Error(`chapter ${CHAPTER} not found`);
  return chapter.verses.slice(0, VERSE_COUNT).map(({ verse, text, footnotes }) => ({ verse, text, footnotes }));
}

function originalExcerpt() {
  const book = getBook(BOOK);
  if (!book) throw new Error(`${BOOK}: no original text bundled`);
  const meta = CORPUS_META[book.corpus];
  if (!meta) throw new Error(`${BOOK}: unknown corpus ${book.corpus}`);
  const chapter = book.chapters.find((c) => c.chapter === String(CHAPTER));
  if (!chapter) throw new Error(`chapter ${CHAPTER} not found in original`);
  const editionByCorpus = new Map(corpora().map((c) => [c.code, c.name]));
  return {
    info: { corpus: book.corpus, edition: editionByCorpus.get(book.corpus), language: meta.language, dir: meta.dir },
    verses: chapter.verses.slice(0, VERSE_COUNT).map(({ verse, text }) => ({ verse, text })),
  };
}

const status = ptManifest.books.find((b) => b.book === BOOK)?.status;
if (!status) throw new Error(`book ${BOOK} not found in manifest`);

const original = originalExcerpt();

const data = {
  book: BOOK,
  chapter: CHAPTER,
  status: { formal: status.formal },
  formal: excerpt(ptFormalPs),
  original: original.verses,
  originalInfo: original.info,
};

const outPath = fileURLToPath(new URL('../src/data/psalm23.json', import.meta.url));
writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log(`wrote ${outPath}`);

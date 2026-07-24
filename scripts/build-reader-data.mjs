// Generates the reader's data from the `biblialibera` package: a light index
// of the translated books plus one file per book carrying both registers and
// the original-language text, so the reader can lazy-load a single book on
// demand instead of shipping the whole corpus to the browser. Re-run after
// updating the `biblialibera` dependency:
//
//   node scripts/build-reader-data.mjs
//
// Outputs:
//   src/data/reader/index.json   one light entry per translated book (no text)
//   src/data/reader/<CODE>.json  full book: both registers + the original,
//                                keyed per chapter
//
// The manifest is the source of truth for which books exist; canon order and
// classification come from scripts/canon.mjs; the original text comes from the
// separate `biblialibera/original` bundle (Hebrew WLC, Greek Nestle 1904, LXX).

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ptManifest from '../node_modules/biblialibera/data/pt/manifest.json' with { type: 'json' };
import { corpora, getBook } from 'biblialibera/original';
import { CANON, slugify } from './canon.mjs';

const REGISTERS = ['formal', 'simple'];
const pkgUrl = (register, code) =>
  new URL(`../node_modules/biblialibera/data/pt/${register}/${code}.json`, import.meta.url);

// Reading direction and pt-BR language label per original corpus; the edition
// name (for the citation shown in place of the review seal) comes from the
// package's corpora() metadata.
const CORPUS_META = {
  wlc: { language: 'Hebraico', dir: 'rtl' },
  n4: { language: 'Grego', dir: 'ltr' },
  lxx: { language: 'Grego', dir: 'ltr' },
};
const editionByCorpus = new Map(corpora().map((c) => [c.code, c.name]));

const canonByCode = new Map(CANON.map(([code, name, abbrev, canon]) => [code, { name, abbrev, canon }]));

function readBook(register, code) {
  return JSON.parse(readFileSync(pkgUrl(register, code), 'utf8'));
}

/** Original text for a book, keyed by chapter string, plus its metadata. */
function readOriginal(code) {
  const book = getBook(code);
  if (!book) return null;
  const meta = CORPUS_META[book.corpus];
  if (!meta) throw new Error(`${code}: unknown corpus ${book.corpus}`);
  return {
    info: { corpus: book.corpus, edition: editionByCorpus.get(book.corpus), language: meta.language, dir: meta.dir },
    byChapter: new Map(book.chapters.map((c) => [String(c.chapter), c.verses])),
  };
}

/** Merge the registers and the original of one book into per-chapter rows. */
function mergeChapters(byRegister, originalByChapter) {
  const chapterNumbers = byRegister.formal.chapters.map((c) => c.chapter);
  return chapterNumbers.map((n) => {
    const row = { chapter: n };
    for (const register of REGISTERS) {
      const chapter = byRegister[register].chapters.find((c) => c.chapter === n);
      if (!chapter) throw new Error(`${byRegister.formal.book}: chapter ${n} missing in ${register}`);
      row[register] = chapter.verses.map(({ verse, text, footnotes }) => ({ verse, text, footnotes }));
    }
    const original = originalByChapter?.get(String(n)) ?? [];
    row.original = original.map(({ verse, text }) => ({ verse, text }));
    return row;
  });
}

const outDir = new URL('../src/data/reader/', import.meta.url);
mkdirSync(outDir, { recursive: true });

// Manifest order is not guaranteed canonical, so walk CANON and keep the
// books the manifest actually carries.
const manifestByCode = new Map(ptManifest.books.map((b) => [b.book, b]));
const translated = CANON.map(([code]) => code).filter((code) => manifestByCode.has(code));

const index = [];

for (const code of translated) {
  const meta = manifestByCode.get(code);
  const canonMeta = canonByCode.get(code);
  const status = { formal: meta.status.formal, simple: meta.status.simple };
  const slug = slugify(canonMeta.name);

  for (const register of REGISTERS) {
    if (!meta.status[register]) throw new Error(`${code}: register ${register} not in manifest`);
  }

  const byRegister = { formal: readBook('formal', code), simple: readBook('simple', code) };
  const original = readOriginal(code);
  const book = {
    code,
    name: canonMeta.name,
    abbrev: canonMeta.abbrev,
    slug,
    status,
    original: original?.info ?? null,
    chapters: mergeChapters(byRegister, original?.byChapter),
  };

  const bookPath = fileURLToPath(new URL(`${code}.json`, outDir));
  writeFileSync(bookPath, JSON.stringify(book) + '\n', 'utf8');

  index.push({
    slug,
    code,
    name: canonMeta.name,
    abbrev: canonMeta.abbrev,
    canon: canonMeta.canon,
    chapters: meta.chapters,
    status,
    original: original ? { language: original.info.language } : null,
  });
}

const indexPath = fileURLToPath(new URL('index.json', outDir));
writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n', 'utf8');
console.log(`wrote ${indexPath} (${index.length} books) + ${index.length} book files`);

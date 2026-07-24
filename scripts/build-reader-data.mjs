// Generates the reader's data from the `biblialibera` package: a light index
// of the translated books plus one file per book carrying both registers,
// so the reader can lazy-load a single book on demand instead of shipping the
// whole corpus to the browser. Re-run after updating the `biblialibera`
// dependency:
//
//   node scripts/build-reader-data.mjs
//
// Outputs:
//   src/data/reader/index.json   one light entry per translated book (no text)
//   src/data/reader/<CODE>.json  full book, both registers, keyed per chapter
//
// The manifest is the source of truth for which books exist; canon order and
// classification come from scripts/canon.mjs.

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ptManifest from '../node_modules/biblialibera/data/pt/manifest.json' with { type: 'json' };
import { CANON, slugify } from './canon.mjs';

const REGISTERS = ['formal', 'simple'];
const pkgUrl = (register, code) =>
  new URL(`../node_modules/biblialibera/data/pt/${register}/${code}.json`, import.meta.url);

const canonByCode = new Map(CANON.map(([code, name, abbrev, canon]) => [code, { name, abbrev, canon }]));

function readBook(register, code) {
  return JSON.parse(readFileSync(pkgUrl(register, code), 'utf8'));
}

/** Merge the two registers of one book into { chapter, formal, simple } rows. */
function mergeChapters(byRegister) {
  const chapterNumbers = byRegister.formal.chapters.map((c) => c.chapter);
  return chapterNumbers.map((n) => {
    const row = { chapter: n };
    for (const register of REGISTERS) {
      const chapter = byRegister[register].chapters.find((c) => c.chapter === n);
      if (!chapter) throw new Error(`${byRegister.formal.book}: chapter ${n} missing in ${register}`);
      row[register] = chapter.verses.map(({ verse, text, footnotes }) => ({ verse, text, footnotes }));
    }
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
  const book = {
    code,
    name: canonMeta.name,
    abbrev: canonMeta.abbrev,
    slug,
    status,
    chapters: mergeChapters(byRegister),
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
  });
}

const indexPath = fileURLToPath(new URL('index.json', outDir));
writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n', 'utf8');
console.log(`wrote ${indexPath} (${index.length} books) + ${index.length} book files`);

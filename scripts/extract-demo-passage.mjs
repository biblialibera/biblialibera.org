// Extracts the small excerpt the landing page's live demo needs (Salmo 23,
// verses 1-4, both registers) from the `biblialibera` package into a tiny
// local JSON file, instead of shipping the whole book (~800kB) to the
// browser bundle. Re-run after updating the `biblialibera` dependency:
//
//   node scripts/extract-demo-passage.mjs

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ptFormalPs from '../node_modules/biblialibera/data/pt/formal/Ps.json' with { type: 'json' };
import ptSimplePs from '../node_modules/biblialibera/data/pt/simple/Ps.json' with { type: 'json' };
import ptManifest from '../node_modules/biblialibera/data/pt/manifest.json' with { type: 'json' };

const BOOK = 'Ps';
const CHAPTER = 23;
const VERSE_COUNT = 4;

function excerpt(book) {
  const chapter = book.chapters.find((c) => c.chapter === CHAPTER);
  if (!chapter) throw new Error(`chapter ${CHAPTER} not found`);
  return chapter.verses.slice(0, VERSE_COUNT).map(({ verse, text, footnotes }) => ({ verse, text, footnotes }));
}

const status = ptManifest.books.find((b) => b.book === BOOK)?.status;
if (!status) throw new Error(`book ${BOOK} not found in manifest`);

const data = {
  book: BOOK,
  chapter: CHAPTER,
  status,
  formal: excerpt(ptFormalPs),
  simple: excerpt(ptSimplePs),
};

const outPath = fileURLToPath(new URL('../src/data/psalm23.json', import.meta.url));
writeFileSync(outPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
console.log(`wrote ${outPath}`);

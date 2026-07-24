// Extracts the full book list + review status the landing page shows
// (Status honesto section): every book of the Catholic canon (73 books,
// deuterocanon interleaved in the traditional order, since the project is
// ecumenical, this is the superset), cross-referenced against the
// `biblialibera` package's manifest for translation status. Books the
// manifest doesn't carry yet are marked "not-translated". Re-run after
// updating the `biblialibera` dependency:
//
//   node scripts/extract-book-status.mjs
//
// The canon table (order, pt-BR names, classification) is a canon fact, not
// translation progress, so it lives in scripts/canon.mjs, shared with
// build-reader-data.mjs.

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ptManifest from '../node_modules/biblialibera/data/pt/manifest.json' with { type: 'json' };
import { CANON } from './canon.mjs';

const statusByBook = new Map(ptManifest.books.map((b) => [b.book, b.status.formal]));

const rows = CANON.map(([osis, name, abbrev, canon]) => ({
  book: name,
  ref: abbrev,
  canon,
  status: statusByBook.get(osis) ?? 'not-translated',
}));

const translated = rows.filter((r) => r.status !== 'not-translated').length;

const outPath = fileURLToPath(new URL('../src/data/books.json', import.meta.url));
writeFileSync(outPath, JSON.stringify(rows, null, 2) + '\n', 'utf8');
console.log(`wrote ${outPath} (${rows.length} books, ${translated} translated)`);

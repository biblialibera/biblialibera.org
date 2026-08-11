// Extracts the full book list + review status the landing page shows
// (Status honesto section). The Catholic edition is what it lists, because it
// is the superset: 73 books with the deuterocanon interleaved in the
// traditional order, which is also the ecumenical thing to show. Re-run after
// updating the `biblialibera` dependency:
//
//   node scripts/extract-book-status.mjs
//
// Order, pt-BR names, abbreviations and canon class all come from the package
// (see scripts/editions.mjs); a book the package does not carry yet would
// simply not be listed, and one carried without the formal register is marked
// "not-translated".

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import pt from 'biblialibera/pt';
import { canonOf } from './editions.mjs';

const rows = pt
  .edition('catholic')
  .books()
  .map((book) => ({
    book: book.name,
    ref: book.abbrev,
    canon: canonOf(book.class),
    status: book.status.formal ?? 'not-translated',
  }));

const translated = rows.filter((r) => r.status !== 'not-translated').length;

const outPath = fileURLToPath(new URL('../src/data/books.json', import.meta.url));
writeFileSync(outPath, JSON.stringify(rows, null, 2) + '\n', 'utf8');
console.log(`wrote ${outPath} (${rows.length} books, ${translated} translated)`);

// The editions the site publishes, and the naming shared by every content
// script. Replaces the hand-written canon table this repo used to carry: from
// `biblialibera` 0.5.0 the package classifies every book (`class`) and
// assembles the editions itself (`edition('catholic')`), so book order, pt-BR
// names, abbreviations and which books belong to which edition are all answers
// the package gives. Duplicating them here is how they drift.
//
// Consumed by build-reader-data.mjs, extract-book-status.mjs, build-og-text.mjs
// and build-themes.mjs.

/**
 * The two editions the reader offers, in the order the picker shows them.
 *
 * `key` is what goes in the URL (`/ler/catolica/joao/3`) and in localStorage,
 * so it is pt-BR like every other visible string; `pkg` is the key the package
 * assembles by. The package also ships a `new-testament` edition, deliberately
 * left out: a reader who wants only the NT is served by the book rail.
 */
export const EDITIONS = [
  {
    key: 'catolica',
    pkg: 'catholic',
    name: 'Católica',
    books: 73,
    summary: 'Com os deuterocanônicos, e com os acréscimos gregos em Ester e Daniel.',
  },
  {
    key: 'protestante',
    pkg: 'protestant',
    name: 'Protestante',
    books: 66,
    summary: 'Só os protocanônicos do Antigo Testamento, mais o Novo Testamento.',
  },
];

/** The edition a visitor who never chose one reads: the superset, nothing hidden. */
export const DEFAULT_EDITION = 'catolica';

/** Testament grouping from the package's canon class. */
export function canonOf(bookClass) {
  if (bookClass === 'newTestament') return 'NT';
  if (bookClass === 'deuterocanonical') return 'DC';
  return 'AT';
}

/** URL slug from a pt-BR book name: strip accents, lowercase, spaces to hyphens. */
export function slugify(name) {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-');
}

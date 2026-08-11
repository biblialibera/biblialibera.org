// Generates the reader's data from the `biblialibera` package: one light index
// per edition plus one file per book carrying the formal register and the
// original-language text, so the reader can lazy-load a single book on demand
// instead of shipping the whole corpus to the browser. Re-run after updating
// the `biblialibera` dependency:
//
//   node scripts/build-reader-data.mjs
//
// Outputs:
//   src/data/reader/index.json     the editions, each with its book list (no text)
//   src/data/reader/<FILE>.json    full book: the formal register + the
//                                  original, keyed per chapter
//
// The package is the source of truth for everything here: which books exist,
// their pt-BR names and abbreviations, their canon class, the order they come
// in and how an edition assembles them (scripts/editions.mjs only names the
// editions the site offers). Nothing about the canon is written down twice.
//
// Two books come out different per edition: the Catholic Esther and Daniel
// carry the Greek additions, which renumbers them (Daniel gains chapters 13 and
// 14, and its chapter 3 runs to verse 100). Those get a file per edition,
// `Esth.catolica.json`; the other 71 books are byte-identical in both editions
// and are written once.

import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import pt from 'biblialibera/pt';
import { corpora, getBook as getOriginalBook } from 'biblialibera/original';
import { EDITIONS, canonOf, slugify } from './editions.mjs';

// Reading direction and pt-BR language label per original corpus; the edition
// name (for the citation shown in place of the review seal) comes from the
// package's corpora() metadata.
const CORPUS_META = {
  wlc: { language: 'Hebraico', dir: 'rtl' },
  n4: { language: 'Grego', dir: 'ltr' },
  lxx: { language: 'Grego', dir: 'ltr' },
};
const editionByCorpus = new Map(corpora().map((c) => [c.code, c.name]));

// Which corpus each bundled original text belongs to, by OSIS code. An
// assembled book mixes them: the Catholic Esther is Hebrew with Greek blocks
// woven in, so the corpus is a property of the verse, not of the book.
const corpusByCode = new Map(
  pt.books().map(({ book }) => [book, getOriginalBook(book)?.corpus ?? null]),
);

/** The corpus an original verse came from, read off its osisID's book. */
function corpusOfOriginal(original) {
  return corpusByCode.get(original.id.split('.')[0]) ?? null;
}

/**
 * One book as the reader loads it: every chapter with the pt (formal) verses
 * and the matching original-language ones.
 *
 * `withOriginal` does the alignment, by osisID, including across an assembly:
 * it is what puts the Greek of the Esther additions next to the Hebrew of the
 * verses around them. Verses are addressed by label (`"16"`, `"1a"`) rather
 * than by number, because in the Catholic Esther the additions hang off a host
 * verse as lettered sub-verses and `1` alone no longer names one verse.
 */
function readBook(edition, summary) {
  const book = edition.getBook(summary.book, { register: 'formal', withOriginal: true });
  if (!book) throw new Error(`${summary.book}: not bundled in the ${edition.name} edition`);

  const versesPerCorpus = new Map();

  const chapters = book.chapters.map(({ chapter, verses }) => {
    const formal = [];
    const original = [];

    for (const verse of verses) {
      const label = `${verse.verse}${verse.sub ?? ''}`;
      formal.push({ verse: label, text: verse.text, footnotes: verse.footnotes });

      if (!verse.original) continue;
      const corpus = corpusOfOriginal(verse.original);
      if (corpus && !CORPUS_META[corpus]) throw new Error(`${summary.book}: unknown corpus ${corpus}`);
      if (corpus) versesPerCorpus.set(corpus, (versesPerCorpus.get(corpus) ?? 0) + 1);
      original.push({ verse: label, text: verse.original.text, corpus });
    }

    return { chapter: String(chapter), formal, original };
  });

  return { chapters, versesPerCorpus };
}

/**
 * The original-language metadata a book's header shows: the citation next to
 * the text and the reading direction. A book that mixes corpora (the Catholic
 * Esther, Hebrew plus Greek) names both editions and takes its direction from
 * the corpus most of it is in; the verses that disagree carry their own.
 */
function originalInfo(versesPerCorpus) {
  const byWeight = [...versesPerCorpus].sort(([, a], [, b]) => b - a);
  if (byWeight.length === 0) return null;

  const [main] = byWeight[0];
  const list = byWeight.map(([corpus]) => corpus);
  return {
    corpus: main,
    edition: list.map((c) => editionByCorpus.get(c)).join(' + '),
    language: [...new Set(list.map((c) => CORPUS_META[c].language))].join(' e '),
    dir: CORPUS_META[main].dir,
  };
}

/**
 * A book's chapters for the index: the count when they are plainly `1..n`,
 * which is every book but one, and the full list of labels when they are not.
 *
 * Sirach opens with the translator's prologue, whose chapter is `praef` rather
 * than a number, so a count alone cannot describe it. Spelling every chapter
 * out for all 139 entries would quadruple the index the landing bundle carries
 * to say one thing about one book.
 */
function chapterIds(ids) {
  const sequential = ids.every((id, i) => id === String(i + 1));
  return sequential ? ids.length : ids;
}

const outDir = new URL('../src/data/reader/', import.meta.url);
rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const written = new Set();
const index = [];

for (const { key, pkg, name, summary } of EDITIONS) {
  const edition = pt.edition(pkg);
  const books = [];

  for (const bookSummary of edition.books()) {
    // Only an assembled book differs between editions; everything else is the
    // same file read twice.
    const file = bookSummary.assembled ? `${bookSummary.book}.${key}` : bookSummary.book;
    const slug = slugify(bookSummary.name);
    const status = { formal: bookSummary.status.formal };
    if (!status.formal) throw new Error(`${bookSummary.book}: register formal not bundled`);

    const { chapters, versesPerCorpus } = readBook(edition, bookSummary);
    const original = originalInfo(versesPerCorpus);

    if (!written.has(file)) {
      written.add(file);
      const book = {
        code: bookSummary.book,
        name: bookSummary.name,
        abbrev: bookSummary.abbrev,
        slug,
        status,
        original,
        chapters,
      };
      writeFileSync(fileURLToPath(new URL(`${file}.json`, outDir)), JSON.stringify(book) + '\n', 'utf8');
    }

    books.push({
      slug,
      code: bookSummary.book,
      file,
      name: bookSummary.name,
      abbrev: bookSummary.abbrev,
      canon: canonOf(bookSummary.class),
      chapters: chapterIds(chapters.map((c) => c.chapter)),
      status,
      original: original ? { language: original.language } : null,
    });
  }

  index.push({ key, name, summary, books });
}

const indexPath = fileURLToPath(new URL('index.json', outDir));
writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n', 'utf8');
console.log(
  `wrote ${indexPath} (${index.map((e) => `${e.key}: ${e.books.length} books`).join(', ')}) + ${written.size} book files`,
);

// Resolves the curated thematic index (src/data/themes.source.json) against the
// reader data and writes what the site actually loads. Re-run after editing the
// source file or after `npm run sync-reader`:
//
//   node scripts/build-themes.mjs
//
// Outputs:
//   src/data/themes/index.json    one light entry per theme (no verse text)
//   src/data/themes/<slug>.json   the theme's passages with their verse text
//
// Every passage in the source file carries an `anchor`: the passage's opening
// words, copied from the text itself. Multi-verse passages also carry an
// `endAnchor`, the opening words of their closing verse. The script asserts the
// resolved passage starts with the one and its last verse starts with the
// other, and fails loudly otherwise. This is not decoration. The Old Testament
// here follows Hebrew (Masoretic) numbering, so references memorised from
// English editions land on the wrong verse (Ps 51:10 is 51:12 here, Joel has
// four chapters, Malachi three). The anchors are what keep the index honest
// when the `biblialibera` dependency is bumped and verse boundaries shift under
// us: without them a renumbering silently repoints every reference.
//
// An anchor has to be the opening words rather than merely present, has to be
// unique within its book, and has to pin both ends of a range. Each of those
// closes a way a drifted reference could otherwise still validate.
//
// Adding a theme: write the reference, run the script, and copy the opening
// words it reports back in as the anchors.

import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const dataDir = new URL('../src/data/reader/', import.meta.url);
const outDir = new URL('../src/data/themes/', import.meta.url);
const sourceUrl = new URL('../src/data/themes.source.json', import.meta.url);

const readJson = (url) => JSON.parse(readFileSync(url, 'utf8'));

const readerIndex = readJson(new URL('index.json', dataDir));
const entryByCode = new Map(readerIndex.map((e) => [e.code, e]));

const bookCache = new Map();
function loadBook(code) {
  if (!bookCache.has(code)) bookCache.set(code, readJson(new URL(`${code}.json`, dataDir)));
  return bookCache.get(code);
}

/** "Matt 6:25-34" / "Ps 23:1" -> { code, chapter, start, end }. */
function parseRef(ref) {
  const match = /^(\S+)\s+(\d+):(\d+)(?:-(\d+))?$/.exec(ref);
  if (!match) throw new Error(`malformed reference: ${ref}`);
  const [, code, chapter, start, end] = match;
  return { code, chapter: Number(chapter), start: Number(start), end: Number(end ?? start) };
}

// Accents, case and punctuation are noise for an equality check on prose, and
// the anchors are typed by hand: compare on a folded form so a missing accent
// or a comma is not a failure.
const fold = (s) =>
  s
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim()
    .toLowerCase();

// The anchor must be the passage's opening words, not merely present somewhere
// inside it. Containment is too weak to be an alarm: if the verses ever shift by
// one, an anchor taken from the middle is still contained by the new range and
// the drift passes silently. Anchored to the start, any change to the first
// verse fails the build.
const startsWith = (text, anchor) => `${fold(text)} `.startsWith(`${fold(anchor)} `);

/** Short anchors match by accident, so they are worth nothing as a drift alarm. */
const MIN_ANCHOR_LENGTH = 12;

// Being the opening words is still not enough on its own. If two verses in the
// same book open the same way (Prov 19:5 and 19:9 are word for word identical,
// Rom 5:3 and 5:11 both open "E não somente isso"), a renumbering that slides a
// reference from one onto the other keeps passing. A reference names its book,
// so that is the scope the anchor has to be unique in: cross-book twins like
// Deut 31:6 and 2Chr 32:7, or the synoptic parallels, are unreachable by drift
// and are left alone.
function countAnchorMatches(book, anchor) {
  const target = fold(anchor);
  let matches = 0;
  for (const chapter of book.chapters) {
    for (let i = 0; i < chapter.formal.length; i += 1) {
      // Anchors may span verses, so join forward, but only far enough to decide.
      let text = '';
      for (let j = i; j < chapter.formal.length; j += 1) {
        text += (j > i ? ' ' : '') + chapter.formal[j].text;
        if (fold(text).length > target.length) break;
      }
      if (startsWith(text, anchor)) matches += 1;
    }
  }
  return matches;
}

const errors = [];

/** Records a problem and yields null, so a failed passage is dropped, not kept. */
const fail = (message) => {
  errors.push(message);
  return null;
};

function resolvePassage(themeSlug, { ref, anchor, endAnchor }) {
  const { code, chapter: chapterNumber, start, end } = parseRef(ref);
  const entry = entryByCode.get(code);
  if (!entry) return fail(`${themeSlug}: ${ref}: book "${code}" is not in the reader index`);
  if (end < start) return fail(`${themeSlug}: ${ref}: verse range runs backwards`);

  const book = loadBook(code);
  const chapter = book.chapters.find((c) => c.chapter === chapterNumber);
  if (!chapter) return fail(`${themeSlug}: ${ref}: ${entry.name} has no chapter ${chapterNumber}`);

  const verses = chapter.formal.filter((v) => v.verse >= start && v.verse <= end);
  const missing = end - start + 1 - verses.length;
  if (missing > 0) {
    const last = chapter.formal.at(-1)?.verse;
    return fail(`${themeSlug}: ${ref}: ${entry.name} ${chapterNumber} ends at verse ${last}`);
  }

  const text = verses.map((v) => v.text).join(' ');
  if (fold(anchor).length < MIN_ANCHOR_LENGTH) {
    return fail(`${themeSlug}: ${ref}: anchor "${anchor}" is too short to be meaningful`);
  }
  if (!startsWith(text, anchor)) {
    return fail(
      `${themeSlug}: ${ref}: anchor "${anchor}" does not open this passage. Resolved text starts: "${text.slice(0, 90)}..."`,
    );
  }
  const matches = countAnchorMatches(book, anchor);
  if (matches > 1) {
    return fail(
      `${themeSlug}: ${ref}: anchor "${anchor}" opens ${matches} different passages in ${entry.name}, so it cannot detect drift. Extend it until it is unique.`,
    );
  }

  // The opening anchor pins verse `start` and nothing else, so a renumbering
  // that merges or splits verses further down still slides the tail of the
  // range without tripping anything. `endAnchor` pins the closing verse the
  // same way, so both ends of a multi-verse passage are held.
  if (end > start) {
    if (!endAnchor) {
      return fail(`${themeSlug}: ${ref}: multi-verse passage needs an endAnchor (opening words of verse ${end})`);
    }
    const lastVerse = verses.at(-1);
    if (fold(endAnchor).length < MIN_ANCHOR_LENGTH) {
      return fail(`${themeSlug}: ${ref}: endAnchor "${endAnchor}" is too short to be meaningful`);
    }
    if (!startsWith(lastVerse.text, endAnchor)) {
      return fail(
        `${themeSlug}: ${ref}: endAnchor "${endAnchor}" does not open verse ${end}. That verse starts: "${lastVerse.text.slice(0, 90)}..."`,
      );
    }
  }

  const label = start === end ? `${entry.name} ${chapterNumber}:${start}` : `${entry.name} ${chapterNumber}:${start}-${end}`;
  return {
    reference: label,
    book: entry.name,
    abbrev: entry.abbrev,
    bookSlug: entry.slug,
    chapter: chapterNumber,
    start,
    end,
    verses: verses.map(({ verse, text: verseText }) => ({ verse, text: verseText })),
  };
}

const source = readJson(sourceUrl);
const seenSlugs = new Set();
const themes = [];

for (const theme of source.themes) {
  if (seenSlugs.has(theme.slug)) errors.push(`duplicate theme slug: ${theme.slug}`);
  seenSlugs.add(theme.slug);
  if (!theme.passages?.length) {
    errors.push(`${theme.slug}: theme has no passages`);
    continue;
  }

  const passages = theme.passages.map((p) => resolvePassage(theme.slug, p)).filter((p) => p !== null);
  themes.push({ ...theme, passages });
}

if (errors.length) {
  console.error(`build-themes: ${errors.length} problem(s)\n`);
  for (const error of errors) console.error(`  - ${error}`);
  process.exit(1);
}

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

for (const theme of themes) {
  const path = fileURLToPath(new URL(`${theme.slug}.json`, outDir));
  writeFileSync(path, JSON.stringify(theme) + '\n', 'utf8');
}

const index = themes.map(({ slug, name, summary, passages }) => ({
  slug,
  name,
  summary,
  passageCount: passages.length,
  verseCount: passages.reduce((total, p) => total + p.verses.length, 0),
  references: passages.map((p) => p.reference),
}));

const indexPath = fileURLToPath(new URL('index.json', outDir));
writeFileSync(indexPath, JSON.stringify(index, null, 2) + '\n', 'utf8');

const passageCount = index.reduce((total, t) => total + t.passageCount, 0);
const verseCount = index.reduce((total, t) => total + t.verseCount, 0);
console.log(`wrote ${indexPath} (${themes.length} themes, ${passageCount} passages, ${verseCount} verses)`);

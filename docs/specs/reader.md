# Reader (leitor) v1

Status: Approved (2026-07-24)

## (a) Problem & goal

The site promises a Bible in contemporary Portuguese; the landing page only
shows a single-passage demo (`RegisterDemo`, Psalm 23). Readers cannot yet
open a translated book and read it. This spec defines the reader: a route
where a visitor picks one of the translated books and reads any chapter, in
either register, with the footnote apparatus and the honest review status.

Scope of v1 (decided with the owner):

- The books the `biblialibera` package currently ships (12 today: Gênesis,
  Êxodo, Salmos, Isaías, Jonas, Sofonias, Mateus, Marcos, Lucas, Tito,
  Filemom, Judas). The package manifest is the source of truth, so the set
  grows automatically as the dependency is bumped.
- Two registers only: `formal` and `simple`. The original-language text
  (Hebrew/Greek) is **not** in the npm package and is out of scope (v2).
- One register at a time, switched with `RegisterToggle` (same interaction as
  the landing demo). No side-by-side view in v1.
- 100% front-end, static, no backend. Book data is generated at build time
  into small JSON files and lazy-loaded per book (Vite code-split). A backend
  arrives only with the community phase, and only for writes/user data, never
  to serve the text.

Out of scope for v1 (note as v2+): original-language register, full-text
search, per-verse deep links (`#v3`), SEO/SSR, community features.

## (b) Developer experience

### Content pipeline (Node build script)

Same pattern as the existing `scripts/extract-*.mjs`: a Node script reads the
package data files and writes small JSON into `src/data/`. New script:

```
npm run sync-reader     # regenerate src/data/reader/*
npm run sync-content    # runs sync-demo-passage + sync-books + sync-reader
```

It emits, for every book the manifest carries:

- `src/data/reader/index.json` — one light entry per translated book (no verse
  text), used to build the book index and the nav without loading any book.
- `src/data/reader/<CODE>.json` — the full book, both registers, keyed by
  register per chapter (e.g. `src/data/reader/Ps.json`). `<CODE>` is the OSIS
  code, matching the package filenames.

### Reading a chapter (component)

`ChapterView` is `RegisterDemo` generalized over a loaded book + chapter. It
receives already-loaded data and is pure/presentational:

```tsx
<ChapterView
  book={bookData}          // ReaderBook (already loaded)
  chapter={23}             // number
  register={register}      // 'formal' | 'simple'
  onRegisterChange={setRegister}
/>
```

It reuses `renderVerseText` + `VerseBlock` + `FootnoteList` + `RegisterToggle`
+ `ReviewSeal` exactly as the demo does, but over `book.chapters[n][register]`.

### The reader page (route + data)

`ReaderChapter` is the route element for `/ler/:slug/:capitulo`. It resolves
the slug, lazy-loads the book, owns the register state and navigation:

```tsx
// resolve slug -> index entry -> lazy import the book file
const entry = bookBySlug(params.slug)          // ReaderIndexEntry | undefined
const book = await loadBook(entry.code)        // dynamic import (code-split)
// navigate chapters / books
navigate(`/ler/${entry.slug}/${chapter + 1}`)
```

`loadBook` is backed by `import.meta.glob('../data/reader/*.json')`, so each
book is its own chunk and only the opened book is fetched.

### The book index (route)

`/ler` renders `BookIndex`: the translated books grouped Antigo/Novo
Testamento, each a link to `/ler/<slug>/1` with its `ReviewSeal` status.

## (c) Public interfaces / types

### Generated data types (`src/components/readerData.ts`)

```ts
export type Register = 'formal' | 'simple'
export type Status = 'draft' | 'checked' | 'reviewed'

export interface ReaderVerse {
  verse: number
  text: string
  footnotes: string[]
}

export interface ReaderChapter {
  chapter: number
  formal: ReaderVerse[]
  simple: ReaderVerse[]
}

export interface ReaderBook {
  code: string                       // OSIS, e.g. "Ps"
  name: string                       // "Salmos"
  abbrev: string                     // "Sl"
  slug: string                       // "salmos"
  status: Record<Register, Status>
  chapters: ReaderChapter[]
}

export interface ReaderIndexEntry {
  slug: string
  code: string
  name: string
  abbrev: string
  canon: 'AT' | 'DC' | 'NT'
  chapters: number
  status: Record<Register, Status>
}
```

### Data helper (`src/components/readerData.ts`)

```ts
import indexData from '../data/reader/index.json'
import type { NavGroup } from '../design-system/components/reading'

export const readerIndex: ReaderIndexEntry[]                  // indexData, typed

export function bookBySlug(slug: string): ReaderIndexEntry | undefined
export function bookByCode(code: string): ReaderIndexEntry | undefined

/** BookNav groups: AT + DC under "Antigo Testamento", NT under "Novo Testamento". */
export function navGroups(): NavGroup[]

/** Lazy-load a book's full data by OSIS code (code-split per book). */
export function loadBook(code: string): Promise<ReaderBook>

/** Remembered register choice; 'formal' when unset/invalid. try/catch guarded. */
export function readStoredRegister(): Register
export function storeRegister(register: Register): void
```

`loadBook` implementation shape:

```ts
const loaders = import.meta.glob('../data/reader/*.json') as
  Record<string, () => Promise<{ default: ReaderBook }>>

export async function loadBook(code: string): Promise<ReaderBook> {
  const loader = loaders[`../data/reader/${code}.json`]
  if (!loader) throw new Error(`reader book not found: ${code}`)
  return (await loader()).default
}
```

Note: `index.json` is imported statically (small, needed on every reader
page); only the per-book files are globbed/lazy.

### Slug rule

`slugify(name)` = NFD-normalize, strip diacritics, lowercase, spaces to
hyphens. `Gênesis -> genesis`, `Êxodo -> exodo`, `Salmos -> salmos`. Future
numbered books resolve too (`1 Coríntios -> 1-corintios`). The slug is
generated into the index and per-book file, never recomputed at runtime.

### Component props

```ts
// src/components/ChapterView.tsx
export interface ChapterViewProps {
  book: ReaderBook
  chapter: number
  register: Register
  onRegisterChange: (r: Register) => void
}

// src/components/BookIndex.tsx
export interface BookIndexProps {
  books?: ReaderIndexEntry[]   // defaults to readerIndex
}
```

Pages `src/pages/ReaderIndex.tsx` and `src/pages/ReaderChapter.tsx` take the
same `{ theme, onToggleTheme }` props Landing takes, and reuse `SiteHeader`
and `SiteFooter`.

### Generated file shapes

`src/data/reader/index.json` (array, canonical order):

```json
[
  { "slug": "genesis", "code": "Gen", "name": "Gênesis", "abbrev": "Gn",
    "canon": "AT", "chapters": 50,
    "status": { "formal": "checked", "simple": "checked" } }
]
```

`src/data/reader/Ps.json`:

```json
{ "code": "Ps", "name": "Salmos", "abbrev": "Sl", "slug": "salmos",
  "status": { "formal": "checked", "simple": "checked" },
  "chapters": [
    { "chapter": 1,
      "formal": [ { "verse": 1, "text": "Feliz é o homem...", "footnotes": [] } ],
      "simple": [ { "verse": 1, "text": "Feliz é a pessoa...", "footnotes": [] } ] }
  ] }
```

## (d) Behavior & edge cases

- **Routes:** `/ler` (index), `/ler/:slug/:capitulo` (chapter). `:capitulo`
  is a positive integer.
- **Unknown slug:** `bookBySlug` returns undefined -> `<Navigate to="/ler"
  replace />`.
- **Chapter out of range or non-numeric:** clamp/redirect to chapter 1 of the
  book with `replace` (e.g. `/ler/salmos/0` or `/ler/salmos/x` ->
  `/ler/salmos/1`). Chapter above the book's count -> redirect to chapter 1.
- **Loading:** `loadBook` is async; while pending, render a minimal, quiet
  placeholder (no layout shift): the chapter heading skeleton or a short
  "Carregando..." line. On import failure (should not happen for indexed
  books), redirect to `/ler`.
- **Register state:** owned by `ReaderChapter`, initialized from
  `localStorage` (key `bl.reader.register`, values `formal`/`simple`),
  defaulting to `formal` when unset or invalid. Every change writes back to
  `localStorage`, so the choice is remembered across chapters, books, and
  sessions. Reads/writes are wrapped in try/catch (private mode can throw).
- **Register switch:** preserves scroll position (only the text swaps). The
  demo already proves this; `key={register}` on the verse container is fine.
- **Chapter change:** scroll to top of the reading column.
- **Footnotes:** numbering restarts per chapter (a chapter is the rendered
  unit) and accumulates across the chapter's verses via
  `renderVerseText(..., nextNumber)`. `idPrefix` = the current register, so
  anchors are `#formal-nota-N` / `#simple-nota-N` (matches the demo, avoids
  collisions).
- **Navigation (BookNav):** the reader passes its own `navGroups()` (the 12
  translated books), not BookNav's stale default. Selecting a book navigates
  to `/ler/<slug>/1`; selecting a chapter navigates within the current book.
  BookNav is shown in a popover/drawer opened from a "Livro e capítulo"
  button in the reader toolbar; on mobile it is a full-width sheet.
- **Prev/next chapter:** chevrons in the toolbar. Disabled at chapter 1
  (prev) and at the last chapter (next). No cross-book roll-over in v1 (see
  Open questions).
- **Edition selector inside BookNav** (Católica/Protestante/NT): cosmetic in
  v1 (only translated books exist, and the component does not actually filter
  by edition). `onEditionChange` is wired to a no-op. See Open questions.
- **Landing "Ler" button:** currently scrolls to the `#ler` demo section. It
  becomes a link/navigate to `/ler`. The on-page live demo stays; rename its
  section anchor to `#demo` and update the hero secondary action/header if it
  referenced `#ler`, so "Ler" unambiguously means the reader.
- **Both registers assumed present:** all shipped books carry both `formal`
  and `simple` (manifest). A book missing a register is out of scope; the
  script asserts both files exist and fails loudly if not.

## (e) Implementation plan

Order matters; each step keeps tests green.

1. **Share the canon table.** Extract the 73-book `[osis, name, abbrev,
   canon]` constant and `slugify` into `scripts/canon.mjs` (ESM, no deps).
   Refactor `scripts/extract-book-status.mjs` to import from it (no behavior
   change; `src/data/books.json` byte-identical after regen).

2. **`scripts/build-reader-data.mjs`.** Import `data/pt/manifest.json`. For
   each manifest book (these are exactly the translated ones), read
   `node_modules/biblialibera/data/pt/formal/<CODE>.json` and
   `.../simple/<CODE>.json` with `fs.readFileSync` + `JSON.parse` (loop, so
   fs-read rather than static import). Build:
   - `index.json`: one `ReaderIndexEntry` per book, in the canonical order of
     `scripts/canon.mjs` (filter to manifest books), `canon` from the table,
     `chapters`/`status`/`name`/`abbrev` from the manifest, `slug` from
     `slugify(name)`.
   - `<CODE>.json`: `{ code, name, abbrev, slug, status, chapters: [{ chapter,
     formal:[{verse,text,footnotes}], simple:[{verse,text,footnotes}] }] }`,
     zipping the two registers' `chapters[].verses[]` by chapter number.
   Assert both registers exist for every book. Write with the same
   `JSON.stringify(x, null, 2) + '\n'` convention.
   Add npm scripts: `sync-reader`, and append it to `sync-content`. Run it;
   commit the generated `src/data/reader/*` files.

3. **`src/components/readerData.ts` (+ `.test.tsx`).** Types above, `readerIndex`
   (typed import of index.json), `bookBySlug`, `bookByCode`, `navGroups`
   (AT+DC -> "Antigo Testamento", NT -> "Novo Testamento"), `loadBook` (via
   `import.meta.glob`), and `readStoredRegister`/`storeRegister` (localStorage
   key `bl.reader.register`, try/catch guarded, default `formal`).

4. **`src/components/ChapterView.tsx` (+ `.test.tsx`).** Generalize
   `RegisterDemo`: heading (`{book.name} {chapter}`), `RegisterToggle` +
   `ReviewSeal status={book.status[register]}`, verses via `renderVerseText` /
   `VerseBlock`, `FootnoteList` with `Footnote` items keyed
   `${register}-nota-${n}`. No CSS inline (Tailwind arbitrary values with
   design-system tokens, like the rest of `src/components`).

5. **`src/components/BookIndex.tsx` (+ `.test.tsx`).** Grouped list (Antigo /
   Novo Testamento) from `readerIndex`, each row a `react-router` `<Link
   to={/ler/${slug}/1}>` with `name`, `abbrev` and `<ReviewSeal
   status={status.formal} size="sm" />`.

6. **Pages + routes.**
   - `src/pages/ReaderIndex.tsx`: `SiteHeader` + intro + `<BookIndex/>` +
     `SiteFooter`.
   - `src/pages/ReaderChapter.tsx`: read `useParams`, resolve slug, `loadBook`
     in an effect with loading/redirect handling, own `register` state
     (`useState(readStoredRegister)`, `onRegisterChange` calls `storeRegister`
     then `setRegister`), toolbar (BookNav popover + prev/next),
     `<ChapterView/>`, `SiteHeader` + `SiteFooter`. Redirects via `<Navigate
     replace/>` / `useNavigate`.
   - `src/App.tsx`: add `<Route path="/ler" .../>` and `<Route
     path="/ler/:slug/:capitulo" .../>`, passing `theme`/`onToggleTheme`.

7. **Landing wiring.** Hero "Ler" navigates to `/ler` (use `react-router`
   `useNavigate` or a `Link`), not the `#ler` scroll. Rename the demo section
   id to `#demo` and update any reference. Update `Landing.test.tsx`
   accordingly.

## (f) Tests & acceptance

New/updated tests (Vitest + Testing Library, `MemoryRouter` for routed
components):

- `readerData.test.tsx`: `bookBySlug('salmos')` resolves to the Ps entry;
  unknown slug -> undefined; `navGroups()` returns two sections with the
  translated books in canonical order.
- `ChapterView.test.tsx`: renders every verse of a given chapter; switching
  `register` swaps the rendered text; a verse with a footnote renders a
  `FootnoteRef` and a matching `Footnote`; `ReviewSeal` shows the book status.
- `BookIndex.test.tsx`: renders the 12 books grouped AT/NT, each linking to
  `/ler/<slug>/1`.
- `ReaderChapter.test.tsx`: at `/ler/salmos/23` renders "Salmos 23" and verse
  text (await the lazy load); unknown slug redirects to `/ler`; out-of-range
  chapter redirects to chapter 1; prev disabled at chapter 1, next disabled at
  the last chapter; a preseeded `localStorage['bl.reader.register'] = 'simple'`
  makes the page open in the simple register, and toggling writes the choice
  back.
- `App.test` (or extend): `/ler` renders the index.
- `Landing.test.tsx`: updated for the "Ler" -> `/ler` behavior and `#demo`
  anchor.

Acceptance ("done"):

- `npm run sync-reader` regenerates `src/data/reader/*` deterministically;
  generated files are committed.
- `/ler` lists the translated books grouped Antigo/Novo Testamento with status
  seals; each links into the book.
- `/ler/salmos/23` reads Psalm 23, toggles formal/simple, shows footnotes and
  the review seal, and navigates via prev/next and the BookNav popover.
- Unknown slug / bad chapter redirect gracefully.
- `npm run test` and `npm run build` both green. New components use Tailwind
  (no inline CSS), UI strings in Portuguese, no em dash.

## (g) Open questions

All resolved with the owner (2026-07-24); recorded here as decisions:

1. **BookNav edition selector** stays visible as a no-op in v1 (no change to
   the ported component); a reader-specific nav can come later.
2. **Prev/next at book boundaries** disable at the edges in v1 (prev at
   chapter 1, next at the last chapter). No cross-book roll-over yet.
3. **Register choice is remembered** across sessions via `localStorage`
   (key `bl.reader.register`), defaulting to `formal`. See Behavior.

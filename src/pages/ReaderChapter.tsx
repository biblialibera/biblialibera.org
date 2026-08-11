import { useEffect, useRef, useState } from 'react'
import { Navigate, Link, useLocation, useNavigate, useParams } from 'react-router'
import { Button } from '../design-system/components/core'
import { BookNav } from '../design-system/components/reading'
import { BookRail } from '../components/BookRail'
import { ChapterRail } from '../components/ChapterRail'
import { ChapterView } from '../components/ChapterView'
import { EditionToggle } from '../components/EditionToggle'
import { Section } from '../components/Section'
import { SharePassage } from '../components/SharePassage'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import type { ChapterId, ReaderBook, View } from '../components/readerData'
import {
  bookByCode,
  bookBySlug,
  bookGroups,
  chapterIds,
  chapterLabel,
  editionByKey,
  editions,
  loadBook,
  navGroups,
  readStoredRegister,
  storeRegister,
} from '../components/readerData'
import type { SelectionState, VerseClick, VerseId, VerseRange } from '../components/verseSelection'
import {
  EMPTY_SELECTION,
  nextSelection,
  parseLegacyVerseHash,
  parseVerseQuery,
  passagePath,
  passageReference,
  rangesEqual,
  verseElementId,
  verseSearch,
} from '../components/verseSelection'

const GITHUB_URL = 'https://github.com/biblialibera/biblialibera'

/** The editions the BookNav popover offers: ours, not the design source's three. */
const NAV_EDITIONS = editions.map((e) => ({ value: e.key, label: e.name, note: String(e.books.length) }))

function selectionOf(range: VerseRange | null): SelectionState {
  return range ? { range, anchor: range.start } : EMPTY_SELECTION
}

export interface ReaderChapterProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

function ReaderChapter({ theme, onToggleTheme }: ReaderChapterProps) {
  const { edicao, slug, capitulo } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  // The edition comes from the URL, never from what this reader chose: a link
  // has to open what the person who shared it was looking at. Their own
  // preference is only consulted where the URL is silent, and is only written
  // when they pick one.
  const edition = editionByKey(edicao)
  const entry = edition && slug ? bookBySlug(edition, slug) : undefined
  const chapter = capitulo
  const file = entry?.file

  const [book, setBook] = useState<ReaderBook | null>(null)
  const [view, setView] = useState<View>(readStoredRegister)
  const [navOpen, setNavOpen] = useState(false)
  const [selection, setSelection] = useState<SelectionState>(() => selectionOf(parseVerseQuery(location.search)))

  // Load the book whenever the book file changes (not on chapter change: the
  // whole book is already in memory once loaded). By file rather than by code,
  // because Esther and Daniel are different books in the two editions.
  useEffect(() => {
    if (!file) return
    let alive = true
    setBook(null)
    loadBook(file).then((b) => alive && setBook(b)).catch(() => alive && setBook(null))
    return () => {
      alive = false
    }
  }, [file])

  // The query owns the selection, so back/forward, a pasted link and a URL
  // copied straight out of the address bar all mean the same thing. Following a
  // footnote only touches the hash, so it no longer has any way of disturbing
  // the passage the reader is about to share.
  useEffect(() => {
    const range = parseVerseQuery(location.search)
    setSelection((current) => (rangesEqual(current.range, range) ? current : selectionOf(range)))
  }, [location.search])

  // Links handed out while the selection lived in the hash still arrive as
  // `#v16`. Move them to the query once, replacing the entry so the back button
  // does not lead to a URL that immediately redirects again.
  useEffect(() => {
    const legacy = parseLegacyVerseHash(location.hash)
    if (!legacy) return
    navigate({ pathname: location.pathname, search: verseSearch(legacy) }, { replace: true })
  }, [location.hash, location.pathname, navigate])

  // The passage the URL points at, from the router's location rather than from
  // window.location: a plain <a href="#fn-1"> does not go through the router, so
  // the two drift apart the moment a reader follows a footnote. Held in a ref
  // because both scroll effects want the current value without wanting to re-run
  // when it changes, and it reads the legacy hash too so an old link still lands
  // on its passage even before the URL is rewritten.
  const linkedRef = useRef<VerseRange | null>(null)
  linkedRef.current = parseVerseQuery(location.search) ?? parseLegacyVerseHash(location.hash)

  // Chapter change starts a fresh read from the top, unless the URL points at
  // a verse: that passage is what the reader came for.
  useEffect(() => {
    if (linkedRef.current) return
    window.scrollTo(0, 0)
  }, [file, chapter])

  // Bring the linked passage into view once its text is on the page, once per
  // chapter arrival. This is the only thing that does it now: with the passage
  // in the query rather than the hash, the browser has no anchor to jump to, so
  // opening a shared link would otherwise land at the top of the chapter with
  // the verse highlighted somewhere out of sight.
  //
  // Toggling the register must not re-scroll: someone who opened ?v=1 and read
  // down to verse 90 would be thrown back to the top of the passage every time
  // they compared it with the original.
  const scrolledFor = useRef<string | null>(null)
  useEffect(() => {
    if (!book) return
    const key = `${book.code}/${chapter}`
    if (scrolledFor.current === key) return
    scrolledFor.current = key
    const target = linkedRef.current
    if (!target) return
    document.getElementById(verseElementId(target.start))?.scrollIntoView?.({ block: 'center' })
  }, [book, chapter])

  if (!edition) return <Navigate to="/ler" replace />
  if (!entry) return <Navigate to={`/ler/${edition.key}`} replace />

  const ids = chapterIds(entry)
  const position = chapter === undefined ? -1 : ids.indexOf(chapter)
  if (position === -1) return <Navigate to={`/ler/${edition.key}/${entry.slug}/${ids[0]}`} replace />
  const current = ids[position]

  const openGithub = () => window.open(GITHUB_URL, '_blank', 'noopener')
  const changeView = (v: View) => {
    storeRegister(v)
    setView(v)
  }
  const goChapter = (n: ChapterId) => navigate(`/ler/${edition.key}/${entry.slug}/${n}`)
  const goBook = (bookCode: string) => {
    const target = bookByCode(edition, bookCode)
    if (target) navigate(`/ler/${edition.key}/${target.slug}/${chapterIds(target)[0]}`)
  }

  /**
   * Where the other edition's copy of this reading is. The same book and
   * chapter when it has them, its first chapter when the book is there but the
   * chapter is not (Daniel loses two chapters outside the Catholic edition),
   * and its book list when the book itself is not (Tobias).
   *
   * Deliberately without the `?v=`: the two editions do not number Esther and
   * Daniel alike, so carrying the selection across would highlight a passage
   * the reader never chose.
   */
  const editionHref = (key: string) => {
    const target = editionByKey(key)
    if (!target) return `/ler/${key}`
    const there = bookByCode(target, entry.code)
    if (!there) return `/ler/${target.key}`
    const thereIds = chapterIds(there)
    return `/ler/${target.key}/${there.slug}/${thereIds.includes(current) ? current : thereIds[0]}`
  }

  // Selections replace the current history entry: browsing verses should not
  // bury the previous page under a trail of back-button steps. The hash goes
  // with it, so a note the reader followed earlier is not still in the URL they
  // are about to copy.
  const selectVerse = (verse: VerseId, click: VerseClick) => {
    const next = nextSelection(selection, verse, click)
    setSelection(next)
    navigate({ pathname: location.pathname, search: verseSearch(next.range) }, { replace: true })
  }

  return (
    <>
      <SiteHeader theme={theme} onToggleTheme={onToggleTheme} onOpenGithub={openGithub} />

      <Section bordered={false}>
        {/* Books to the left of the reading, chapters to the right of it, both
            sticky with their own scroll. Below lg there is no room for either,
            and the toolbar's book button opens the same navigation as a popover. */}
        <div className="grid grid-cols-1 gap-[var(--space-8)] lg:grid-cols-[13rem_minmax(0,1fr)_5.5rem]">
          <div className="hidden lg:block">
            <div className="mb-[var(--space-4)]">
              <EditionToggle current={edition.key} hrefFor={editionHref} />
            </div>
            <BookRail groups={bookGroups(edition)} edition={edition.key} current={entry.code} />
          </div>

          <div>
            <div className="mx-auto mb-[var(--space-8)] flex max-w-[var(--reading-measure)] flex-wrap items-center justify-between gap-[var(--space-3)]">
              <div className="flex items-center gap-[var(--space-3)] lg:hidden">
                <Link
                  to={`/ler/${edition.key}`}
                  className="font-sans text-[var(--text-sm)] font-semibold text-[var(--color-text-muted)] no-underline hover:text-[var(--color-text)]"
                >
                  &lsaquo; Livros
                </Link>
                <div className="relative">
                  <Button variant="secondary" size="sm" onClick={() => setNavOpen((o) => !o)} aria-expanded={navOpen}>
                    {entry.abbrev} {chapterLabel(current)}
                  </Button>
                  {navOpen && (
                    <>
                      <div className="fixed inset-0 z-40" aria-hidden onClick={() => setNavOpen(false)} />
                      <div className="absolute left-0 top-[calc(100%+var(--space-2))] z-50">
                        <BookNav
                          books={navGroups(edition)}
                          editions={NAV_EDITIONS}
                          edition={edition.key}
                          onEditionChange={(key) => {
                            setNavOpen(false)
                            navigate(editionHref(key))
                          }}
                          book={entry.code}
                          chapter={current}
                          onSelectBook={(bookCode) => {
                            setNavOpen(false)
                            goBook(bookCode)
                          }}
                          onSelectChapter={(n) => {
                            setNavOpen(false)
                            goChapter(String(n))
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-[var(--space-2)] lg:ms-auto">
                <SharePassage
                  url={`${window.location.origin}${passagePath(edition.key, entry.slug, current, selection.range)}`}
                  reference={passageReference(entry.name, chapterLabel(current), selection.range)}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={position <= 0}
                  onClick={() => goChapter(ids[position - 1])}
                >
                  Anterior
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={position >= ids.length - 1}
                  onClick={() => goChapter(ids[position + 1])}
                >
                  Próximo
                </Button>
              </div>
            </div>

            {book ? (
              <ChapterView
                book={book}
                chapter={current}
                view={view}
                onViewChange={changeView}
                selection={selection.range}
                onSelectVerse={selectVerse}
              />
            ) : (
              <div className="mx-auto max-w-[var(--reading-measure)]">
                <h1 className="m-0 font-serif text-[var(--text-2xl)] text-[var(--color-text)]">
                  {entry.name} {chapterLabel(current)}
                </h1>
                <p className="mt-[var(--space-6)] font-sans text-[var(--text-sm)] text-[var(--color-text-faint)]">
                  Carregando...
                </p>
              </div>
            )}
          </div>

          <div className="hidden lg:block">
            <ChapterRail
              edition={edition.key}
              bookSlug={entry.slug}
              abbrev={entry.abbrev}
              chapters={ids}
              current={current}
            />
          </div>
        </div>
      </Section>

      <SiteFooter year={new Date().getFullYear()} />
    </>
  )
}

export default ReaderChapter

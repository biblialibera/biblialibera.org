import { useEffect, useRef, useState } from 'react'
import { Navigate, Link, useLocation, useNavigate, useParams } from 'react-router'
import { Button } from '../design-system/components/core'
import { BookNav } from '../design-system/components/reading'
import { ChapterView } from '../components/ChapterView'
import { Section } from '../components/Section'
import { SharePassage } from '../components/SharePassage'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import type { ReaderBook, View } from '../components/readerData'
import { bookByCode, bookBySlug, loadBook, navGroups, readStoredRegister, storeRegister } from '../components/readerData'
import type { SelectionState, VerseClick, VerseRange } from '../components/verseSelection'
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

function selectionOf(range: VerseRange | null): SelectionState {
  return range ? { range, anchor: range.start } : EMPTY_SELECTION
}

export interface ReaderChapterProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

function ReaderChapter({ theme, onToggleTheme }: ReaderChapterProps) {
  const { slug, capitulo } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const entry = slug ? bookBySlug(slug) : undefined
  const chapter = Number(capitulo)
  const code = entry?.code

  const [book, setBook] = useState<ReaderBook | null>(null)
  const [view, setView] = useState<View>(readStoredRegister)
  const [navOpen, setNavOpen] = useState(false)
  const [selection, setSelection] = useState<SelectionState>(() => selectionOf(parseVerseQuery(location.search)))

  // Load the book whenever the book code changes (not on chapter change: the
  // whole book is already in memory once loaded).
  useEffect(() => {
    if (!code) return
    let alive = true
    setBook(null)
    loadBook(code).then((b) => alive && setBook(b)).catch(() => alive && setBook(null))
    return () => {
      alive = false
    }
  }, [code])

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
  }, [code, chapter])

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

  if (!entry) return <Navigate to="/ler" replace />
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > entry.chapters) {
    return <Navigate to={`/ler/${entry.slug}/1`} replace />
  }

  const openGithub = () => window.open(GITHUB_URL, '_blank', 'noopener')
  const changeView = (v: View) => {
    storeRegister(v)
    setView(v)
  }
  const goChapter = (n: number) => navigate(`/ler/${entry.slug}/${n}`)
  const goBook = (bookCode: string) => {
    const target = bookByCode(bookCode)
    if (target) navigate(`/ler/${target.slug}/1`)
  }
  // Selections replace the current history entry: browsing verses should not
  // bury the previous page under a trail of back-button steps. The hash goes
  // with it, so a note the reader followed earlier is not still in the URL they
  // are about to copy.
  const selectVerse = (verse: number, click: VerseClick) => {
    const next = nextSelection(selection, verse, click)
    setSelection(next)
    navigate({ pathname: location.pathname, search: verseSearch(next.range) }, { replace: true })
  }

  return (
    <>
      <SiteHeader theme={theme} onToggleTheme={onToggleTheme} onOpenGithub={openGithub} />

      <Section bordered={false}>
        <div className="mx-auto mb-[var(--space-8)] flex max-w-[var(--reading-measure)] flex-wrap items-center justify-between gap-[var(--space-3)]">
          <div className="flex items-center gap-[var(--space-3)]">
            <Link
              to="/ler"
              className="font-sans text-[var(--text-sm)] font-semibold text-[var(--color-text-muted)] no-underline hover:text-[var(--color-text)]"
            >
              ‹ Livros
            </Link>
            <div className="relative">
              <Button variant="secondary" size="sm" onClick={() => setNavOpen((o) => !o)} aria-expanded={navOpen}>
                {entry.abbrev} {chapter}
              </Button>
              {navOpen && (
                <>
                  <div className="fixed inset-0 z-40" aria-hidden onClick={() => setNavOpen(false)} />
                  <div className="absolute left-0 top-[calc(100%+var(--space-2))] z-50">
                    <BookNav
                      books={navGroups()}
                      book={entry.code}
                      chapter={chapter}
                      onEditionChange={() => {}}
                      onSelectBook={(bookCode) => {
                        setNavOpen(false)
                        goBook(bookCode)
                      }}
                      onSelectChapter={(n) => {
                        setNavOpen(false)
                        goChapter(n)
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-[var(--space-2)]">
            <SharePassage
              url={`${window.location.origin}${passagePath(entry.slug, chapter, selection.range)}`}
              reference={passageReference(entry.name, chapter, selection.range)}
            />
            <Button variant="secondary" size="sm" disabled={chapter <= 1} onClick={() => goChapter(chapter - 1)}>
              Anterior
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={chapter >= entry.chapters}
              onClick={() => goChapter(chapter + 1)}
            >
              Próximo
            </Button>
          </div>
        </div>

        {book ? (
          <ChapterView
            book={book}
            chapter={chapter}
            view={view}
            onViewChange={changeView}
            selection={selection.range}
            onSelectVerse={selectVerse}
          />
        ) : (
          <div className="mx-auto max-w-[var(--reading-measure)]">
            <h1 className="m-0 font-serif text-[var(--text-2xl)] text-[var(--color-text)]">
              {entry.name} {chapter}
            </h1>
            <p className="mt-[var(--space-6)] font-sans text-[var(--text-sm)] text-[var(--color-text-faint)]">Carregando...</p>
          </div>
        )}
      </Section>

      <SiteFooter year={new Date().getFullYear()} />
    </>
  )
}

export default ReaderChapter

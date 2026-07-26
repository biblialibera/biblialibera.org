import { useEffect, useState } from 'react'
import { Navigate, Link, useNavigate, useParams } from 'react-router'
import { Button } from '../design-system/components/core'
import { BookNav } from '../design-system/components/reading'
import { ChapterGuide } from '../components/ChapterGuide'
import { ChapterView } from '../components/ChapterView'
import { Section } from '../components/Section'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import type { ReaderBook, View } from '../components/readerData'
import { bookByCode, bookBySlug, loadBook, navGroups, readStoredRegister, storeRegister } from '../components/readerData'

const GITHUB_URL = 'https://github.com/biblialibera/biblialibera'

export interface ReaderChapterProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

function ReaderChapter({ theme, onToggleTheme }: ReaderChapterProps) {
  const { slug, capitulo } = useParams()
  const navigate = useNavigate()
  const entry = slug ? bookBySlug(slug) : undefined
  const chapter = Number(capitulo)
  const code = entry?.code

  const [book, setBook] = useState<ReaderBook | null>(null)
  const [view, setView] = useState<View>(readStoredRegister)
  const [navOpen, setNavOpen] = useState(false)

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

  // Chapter change starts a fresh read from the top.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [code, chapter])

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

  return (
    <>
      <SiteHeader theme={theme} onToggleTheme={onToggleTheme} onOpenGithub={openGithub} />

      <Section bordered={false}>
        {/* Three columns so the reading measure stays centered on the page and
            the chapter rail lives in the right gutter, which is otherwise
            empty. The rail shares this first row with the chapter controls, so
            its top edge lines up with Anterior/Próximo. Below xl the gutter is
            too narrow for the rail: it drops out and the BookNav dropdown
            covers the same ground. */}
        <div className="grid xl:grid-cols-[1fr_minmax(0,var(--reading-measure))_1fr]">
          <div className="xl:col-start-2">
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
              <ChapterView book={book} chapter={chapter} view={view} onViewChange={changeView} />
            ) : (
              <div className="mx-auto max-w-[var(--reading-measure)]">
                <h1 className="m-0 font-serif text-[var(--text-2xl)] text-[var(--color-text)]">
                  {entry.name} {chapter}
                </h1>
                <p className="mt-[var(--space-6)] font-sans text-[var(--text-sm)] text-[var(--color-text-faint)]">Carregando...</p>
              </div>
            )}
          </div>
          {/* Flush with the container's right edge, the same line the header's
              GitHub button and the footer links sit on. */}
          {entry.chapters > 1 && (
            <div className="hidden justify-self-end ps-[var(--space-10)] xl:col-start-3 xl:block">
              <div className="sticky top-[var(--space-20)]">
                <ChapterGuide slug={entry.slug} abbrev={entry.abbrev} chapters={entry.chapters} current={chapter} />
              </div>
            </div>
          )}
        </div>
      </Section>

      <SiteFooter year={new Date().getFullYear()} />
    </>
  )
}

export default ReaderChapter

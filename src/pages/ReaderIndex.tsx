import { Navigate, useParams } from 'react-router'
import { BookIndex } from '../components/BookIndex'
import { EditionPicker } from '../components/EditionPicker'
import { EditionToggle } from '../components/EditionToggle'
import { Section } from '../components/Section'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { readStoredEdition } from '../components/editions'
import { editionByKey } from '../components/readerData'

const GITHUB_URL = 'https://github.com/biblialibera/biblialibera'

export interface ReaderIndexProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

/**
 * The reader's front door, at `/ler` and at `/ler/:edicao`.
 *
 * Without an edition in the URL it resolves the reader's own: the remembered
 * choice if there is one, and the picker if there is not. The picker is the
 * only thing standing between a first visit and the books, and it is there
 * because the alternative is choosing for them silently.
 */
function ReaderIndex({ theme, onToggleTheme }: ReaderIndexProps) {
  const { edicao } = useParams()
  const edition = editionByKey(edicao)
  const openGithub = () => window.open(GITHUB_URL, '_blank', 'noopener')

  if (!edition) {
    // An unknown edition in the URL is a typo, not a choice: fall back to the
    // front door rather than to an edition the reader did not ask for.
    if (edicao !== undefined) return <Navigate to="/ler" replace />

    const stored = readStoredEdition()
    if (stored) return <Navigate to={`/ler/${stored}`} replace />

    return (
      <>
        <SiteHeader theme={theme} onToggleTheme={onToggleTheme} onOpenGithub={openGithub} />
        <Section bordered={false}>
          <EditionPicker />
        </Section>
        <SiteFooter year={new Date().getFullYear()} />
      </>
    )
  }

  return (
    <>
      <SiteHeader theme={theme} onToggleTheme={onToggleTheme} onOpenGithub={openGithub} />

      <Section bordered={false}>
        <div className="mb-[var(--space-10)] flex flex-wrap items-end justify-between gap-[var(--space-4)]">
          <div className="max-w-[40rem]">
            <div className="mb-[var(--space-3)] font-sans text-[length:var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-label)] text-[var(--color-text-faint)]">
              Leitor · edição {edition.name.toLowerCase()}
            </div>
            <h1 className="m-0 mb-[var(--space-3)] font-serif text-[var(--text-3xl)] tracking-[var(--tracking-tight)] text-[var(--color-text)]">
              Escolha um livro
            </h1>
            <p className="m-0 text-[var(--text-base)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
              Os {edition.books.length} livros desta edição, com o texto original ao lado. Cada um mostra o status
              honesto da revisão.
            </p>
          </div>
          <EditionToggle current={edition.key} hrefFor={(key) => `/ler/${key}`} />
        </div>
        <BookIndex edition={edition} />
      </Section>

      <SiteFooter year={new Date().getFullYear()} />
    </>
  )
}

export default ReaderIndex

import { BookIndex } from '../components/BookIndex'
import { Section } from '../components/Section'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'

const GITHUB_URL = 'https://github.com/biblialibera/biblialibera'

export interface ReaderIndexProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

function ReaderIndex({ theme, onToggleTheme }: ReaderIndexProps) {
  const openGithub = () => window.open(GITHUB_URL, '_blank', 'noopener')

  return (
    <>
      <SiteHeader theme={theme} onToggleTheme={onToggleTheme} onOpenGithub={openGithub} />

      <Section bordered={false}>
        <div className="mb-[var(--space-10)] max-w-[40rem]">
          <div className="mb-[var(--space-3)] font-sans text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-label)] text-[var(--color-text-faint)]">
            Leitor
          </div>
          <h1 className="m-0 mb-[var(--space-3)] font-serif text-[var(--text-3xl)] tracking-[var(--tracking-tight)] text-[var(--color-text)]">
            Escolha um livro
          </h1>
          <p className="m-0 text-[var(--text-base)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
            Os livros já traduzidos, em dois registros do mesmo sentido. Cada um mostra o status honesto da revisão.
          </p>
        </div>
        <BookIndex />
      </Section>

      <SiteFooter year={new Date().getFullYear()} />
    </>
  )
}

export default ReaderIndex

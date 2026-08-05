import { Section } from '../components/Section'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { ThemeGrid } from '../components/ThemeGrid'
import { themeIndex } from '../components/themeData'

const GITHUB_URL = 'https://github.com/biblialibera/biblialibera'

export interface ThemesProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

/** Themes: the thematic index, listing every theme as a way into the text. */
function Themes({ theme, onToggleTheme }: ThemesProps) {
  const openGithub = () => window.open(GITHUB_URL, '_blank', 'noopener')

  return (
    <>
      <SiteHeader theme={theme} onToggleTheme={onToggleTheme} onOpenGithub={openGithub} />

      <Section bordered={false}>
        <div className="mb-[var(--space-8)] max-w-[40rem]">
          <div className="mb-[var(--space-3)] font-sans text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-label)] text-[var(--color-text-faint)]">
            Temas
          </div>
          <h1 className="m-0 mb-[var(--space-3)] font-serif text-[var(--text-3xl)] tracking-[var(--tracking-tight)] text-[var(--color-text)]">
            Por onde começar
          </h1>
          <p className="m-0 text-[var(--text-base)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
            Um índice temático: passagens escolhidas para assuntos que levam alguém a abrir a Bíblia. É uma seleção,
            não a Bíblia inteira, e foi montada com auxílio de IA, ainda sem revisão humana.
          </p>
        </div>

        <ThemeGrid themes={themeIndex} />
      </Section>

      <SiteFooter year={new Date().getFullYear()} />
    </>
  )
}

export default Themes

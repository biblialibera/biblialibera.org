import { Link } from 'react-router'
import { Button, Logo } from '../design-system/components/core'
import { ThemeToggle } from './ThemeToggle'

export interface SiteHeaderProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onOpenGithub: () => void
}

/** SiteHeader: sticky top bar: wordmark, theme toggle, GitHub link. */
export function SiteHeader({ theme, onToggleTheme, onOpenGithub }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
      <div className="mx-auto flex max-w-[var(--container-page)] items-center justify-between gap-[var(--space-4)] px-[var(--space-6)] py-[var(--space-3)]">
        <Link to="/" className="no-underline" aria-label="Biblia Libera, início">
          <Logo size={28} tagline={false} />
        </Link>
        <div className="flex items-center gap-[var(--space-2)]">
          <Link
            to="/temas"
            className="inline-flex h-[38px] items-center rounded-[var(--radius-md)] border border-[var(--color-border)] px-[var(--space-3)] font-sans text-[var(--text-sm)] font-semibold text-[var(--color-text-secondary)] no-underline transition-colors duration-150 hover:bg-[var(--color-surface-sunken)]"
          >
            Temas
          </Link>
          <ThemeToggle theme={theme} onToggle={onToggleTheme} />
          <Button variant="secondary" size="sm" onClick={onOpenGithub}>
            GitHub
          </Button>
        </div>
      </div>
    </header>
  )
}

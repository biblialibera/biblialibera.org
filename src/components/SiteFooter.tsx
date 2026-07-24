const GITHUB_URL = 'https://github.com/biblialibera/biblialibera'

export interface SiteFooterProps {
  year: number
}

/** SiteFooter: wordmark, tagline, nav links (ler, GitHub, roadmap, licença) and the copyright line. */
export function SiteFooter({ year }: SiteFooterProps) {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="mx-auto flex max-w-[var(--container-page)] flex-wrap items-baseline justify-between gap-[var(--space-6)] px-[var(--space-6)] py-[var(--space-10)]">
        <div>
          <div className="mb-[var(--space-2)] font-serif text-[var(--text-lg)] font-semibold tracking-[var(--tracking-tight)] text-[var(--color-text)]">
            Biblia <span className="text-[var(--color-accent)]">Libera</span>
          </div>
          <p className="m-0 max-w-[26rem] font-sans text-[var(--text-sm)] text-[var(--color-text-muted)]">
            A Bíblia em português de hoje, das línguas originais, aberta e auditável.
          </p>
        </div>
        <nav className="flex flex-wrap gap-[var(--space-6)] font-sans text-[var(--text-sm)]">
          <a href="#ler">Ler</a>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer">
            Roadmap
          </a>
          <a href="https://creativecommons.org/licenses/by/4.0/deed.pt-br" target="_blank" rel="noreferrer">
            Licença
          </a>
        </nav>
      </div>
      <div className="mx-auto max-w-[var(--container-page)] px-[var(--space-6)] pb-[var(--space-10)]">
        <p className="m-0 font-mono text-[var(--text-xs)] tracking-[0.02em] text-[var(--color-text-faint)]">
          Texto sob CC BY 4.0 · código aberto · biblialibera.org · © {year} Lucas Merencia
        </p>
      </div>
    </footer>
  )
}

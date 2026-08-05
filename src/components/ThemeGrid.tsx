import { Link } from 'react-router'
import { Card, CardMeta, CardTitle } from '../design-system/components/core'
import type { ThemeIndexEntry } from './themeData'

export interface ThemeGridProps {
  themes: ThemeIndexEntry[]
  /** Shown when the list is empty (e.g. a search that matched nothing). */
  emptyMessage?: string
}

/** ThemeGrid: the curated themes as cards, each linking to its passages. */
export function ThemeGrid({ themes, emptyMessage = 'Nenhum tema encontrado.' }: ThemeGridProps) {
  if (themes.length === 0) {
    return (
      <p className="m-0 font-sans text-[var(--text-sm)] text-[var(--color-text-faint)]">{emptyMessage}</p>
    )
  }

  return (
    <ul className="m-0 grid list-none grid-cols-1 gap-[var(--space-4)] p-0 sm:grid-cols-2 lg:grid-cols-3">
      {themes.map((theme) => (
        <li key={theme.slug}>
          <Link to={`/temas/${theme.slug}`} className="block h-full no-underline">
            <Card padding="md" style={{ height: '100%' }}>
              <CardTitle>{theme.name}</CardTitle>
              <p className="m-0 mb-[var(--space-3)] font-sans text-[var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
                {theme.summary}
              </p>
              <CardMeta>
                {theme.passageCount} passagens · {theme.verseCount} versículos
              </CardMeta>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  )
}

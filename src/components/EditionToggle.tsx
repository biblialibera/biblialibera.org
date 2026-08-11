import { Link } from 'react-router'
import { editions } from './readerData'
import { storeEdition } from './editions'

export interface EditionToggleProps {
  /** The edition currently open, which is the one the URL names. */
  current: string
  /** Where each edition goes, since the same passage is not at the same place in both. */
  hrefFor: (key: string) => string
}

/**
 * The edition switch: católica or protestante, always showing which one is
 * open.
 *
 * Links rather than buttons, for the same reason the book and chapter rails
 * are: an edition is a place, it has its own URL, and a reader can open one in
 * a new tab or see where it goes before clicking. Choosing here is also the
 * deliberate act that writes the preference, which is why following a shared
 * link never does: arriving somewhere is not the same as choosing to live
 * there.
 */
export function EditionToggle({ current, hrefFor }: EditionToggleProps) {
  return (
    <nav aria-label="Edição" className="flex items-center gap-[var(--space-1)]">
      {editions.map((edition) => {
        const selected = edition.key === current
        return (
          <Link
            key={edition.key}
            to={hrefFor(edition.key)}
            aria-current={selected ? 'true' : undefined}
            onClick={() => storeEdition(edition.key)}
            className={`rounded-[var(--radius-sm)] border px-[var(--space-2)] py-[var(--space-1)] font-sans text-[length:var(--text-xs)] no-underline ${
              selected
                ? 'border-[var(--color-accent)] bg-[var(--color-accent-tint)] font-semibold text-[var(--color-accent)]'
                : 'border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]'
            }`}
          >
            {edition.name}
          </Link>
        )
      })}
    </nav>
  )
}

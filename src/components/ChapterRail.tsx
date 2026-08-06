import { useEffect, useRef } from 'react'
import { Link } from 'react-router'

export interface ChapterRailProps {
  bookSlug: string
  /** Short book name, the rail's heading: it is the only label the numbers get. */
  abbrev: string
  chapters: number
  current: number
}

/**
 * The chapter rail: every chapter of the book being read, as numbers.
 *
 * Two columns rather than one because of the Psalms: 150 chapters in a single
 * file would be a rail nobody reaches the end of.
 *
 * A chapter link carries no `?v=`, so opening one clears the selected passage,
 * which is what moving to another chapter means.
 */
export function ChapterRail({ bookSlug, abbrev, chapters, current }: ChapterRailProps) {
  const rail = useRef<HTMLElement>(null)
  const active = useRef<HTMLAnchorElement>(null)

  // Same reason as the book rail: chapter 119 has to be visible when the reader
  // arrives on it, without the page moving underneath.
  useEffect(() => {
    const container = rail.current
    const item = active.current
    if (!container || !item) return
    container.scrollTop = item.offsetTop - container.clientHeight / 2 + item.offsetHeight / 2
  }, [bookSlug, current])

  return (
    <nav
      ref={rail}
      aria-label={`Capítulos de ${abbrev}`}
      className="sticky top-[var(--header-h)] max-h-[calc(100vh-var(--header-h))] overflow-y-auto"
    >
      <h2 className="m-0 mb-[var(--space-2)] font-mono text-[length:var(--text-xs)] font-bold uppercase tracking-[var(--tracking-label)] text-[var(--color-text-faint)]">
        {abbrev}
      </h2>
      <ul className="m-0 grid list-none grid-cols-2 gap-[var(--space-1)] p-0">
        {Array.from({ length: chapters }, (_, i) => i + 1).map((n) => {
          const selected = n === current
          return (
            <li key={n}>
              <Link
                ref={selected ? active : undefined}
                to={`/ler/${bookSlug}/${n}`}
                aria-current={selected ? 'page' : undefined}
                className={`flex aspect-square items-center justify-center rounded-[var(--radius-sm)] font-mono text-[length:var(--text-xs)] no-underline ${
                  selected
                    ? 'bg-[var(--color-accent)] font-semibold text-[var(--color-accent-contrast)]'
                    : 'bg-[var(--color-surface-sunken)] text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-tint)] hover:text-[var(--color-accent)]'
                }`}
              >
                {n}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

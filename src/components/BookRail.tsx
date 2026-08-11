import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import type { BookGroup } from './readerData'
import { chapterIds } from './readerData'

export interface BookRailProps {
  groups: BookGroup[]
  /** The edition being read, which every link stays inside. */
  edition: string
  /** OSIS code of the book being read, highlighted and scrolled to. */
  current?: string
}

/**
 * The book rail: every translated book, always on screen, grouped by
 * testament.
 *
 * Links rather than buttons, because this is navigation: it opens in a new tab
 * on middle click, and a reader can see where each one goes. Each book opens at
 * its first chapter, the chapter rail takes it from there.
 *
 * Sticky under the header with its own scroll, so the list stays put while the
 * chapter scrolls past it. Hidden below `lg`, where the screen has no room for
 * a rail: there the header's book button opens the same navigation as a popover.
 */
export function BookRail({ groups, edition, current }: BookRailProps) {
  const rail = useRef<HTMLElement>(null)
  const active = useRef<HTMLAnchorElement>(null)

  // Bring the book being read into view inside the rail. Apocalipse sits 60
  // books down, and a rail that opens at Gênesis every time reads as broken.
  // Scrolling the rail itself rather than calling scrollIntoView, which would
  // drag the page along with it.
  useEffect(() => {
    const container = rail.current
    const item = active.current
    if (!container || !item) return
    container.scrollTop = item.offsetTop - container.clientHeight / 2 + item.offsetHeight / 2
  }, [current])

  return (
    <nav
      ref={rail}
      aria-label="Livros"
      className="sticky top-[var(--header-h)] max-h-[calc(100vh-var(--header-h))] overflow-y-auto pe-[var(--space-2)]"
    >
      {groups.map((group) => (
        <div key={group.section} className="mb-[var(--space-5)]">
          <h2 className="m-0 mb-[var(--space-2)] px-[var(--space-2)] font-sans text-[length:var(--text-xs)] font-bold uppercase tracking-[var(--tracking-label)] text-[var(--color-text-faint)]">
            {group.section}
          </h2>
          <ul className="m-0 flex list-none flex-col p-0">
            {group.books.map((book) => {
              const selected = book.code === current
              return (
                <li key={book.code}>
                  <Link
                    ref={selected ? active : undefined}
                    to={`/ler/${edition}/${book.slug}/${chapterIds(book)[0]}`}
                    aria-current={selected ? 'page' : undefined}
                    className={`flex items-baseline justify-between gap-[var(--space-2)] rounded-[var(--radius-sm)] px-[var(--space-2)] py-[var(--space-1)] font-sans text-[length:var(--text-sm)] no-underline ${
                      selected
                        ? 'bg-[var(--color-accent-tint)] font-semibold text-[var(--color-accent)]'
                        : 'text-[var(--color-text)] hover:bg-[var(--color-surface-sunken)]'
                    }`}
                  >
                    <span>{book.name}</span>
                    <span className="font-mono text-[length:var(--text-xs)] text-[var(--color-text-faint)]">{book.abbrev}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </nav>
  )
}

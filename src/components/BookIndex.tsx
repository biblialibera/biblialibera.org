import { Link } from 'react-router'
import { ReviewSeal } from '../design-system/components/reading'
import type { ReaderIndexEntry } from './readerData'
import { readerIndex } from './readerData'

export interface BookIndexProps {
  books?: ReaderIndexEntry[]
}

const SECTIONS: { title: string; canons: ReaderIndexEntry['canon'][] }[] = [
  { title: 'Antigo Testamento', canons: ['AT', 'DC'] },
  { title: 'Novo Testamento', canons: ['NT'] },
]

/**
 * BookIndex: the translated books, grouped by testament, each a link into the
 * reader (chapter 1) carrying its honest review status. Only books that exist
 * are shown, so the list grows as the package ships more.
 */
export function BookIndex({ books = readerIndex }: BookIndexProps) {
  const groups = SECTIONS.map((section) => ({
    ...section,
    items: books.filter((b) => section.canons.includes(b.canon)),
  })).filter((group) => group.items.length > 0)

  return (
    <div className="flex flex-col gap-[var(--space-10)]">
      {groups.map((group) => (
        <section key={group.title}>
          <h2 className="mb-[var(--space-4)] font-sans text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-label)] text-[var(--color-text-faint)]">
            {group.title}
          </h2>
          <ul className="m-0 grid list-none grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[var(--space-3)] p-0">
            {group.items.map((book) => (
              <li key={book.code}>
                <Link
                  to={`/ler/${book.slug}/1`}
                  className="flex items-center justify-between gap-[var(--space-3)] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-4)] py-[var(--space-3)] no-underline hover:border-[var(--color-border-strong)]"
                >
                  <span className="flex items-baseline gap-[var(--space-2)]">
                    <span className="font-serif text-[var(--text-lg)] text-[var(--color-text)]">{book.name}</span>
                    <span className="font-mono text-[var(--text-xs)] text-[var(--color-text-faint)]">{book.abbrev}</span>
                  </span>
                  <ReviewSeal status={book.status.formal} size="sm" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

import { Link } from 'react-router'
import { ReviewSeal } from '../design-system/components/reading'
import type { ReaderEdition, ReaderIndexEntry } from './readerData'
import { chapterIds } from './readerData'

export interface BookIndexProps {
  /** The edition to list, which is also the edition its links open. */
  edition: ReaderEdition
}

const SECTIONS: { title: string; canons: ReaderIndexEntry['canon'][] }[] = [
  { title: 'Antigo Testamento', canons: ['AT', 'DC'] },
  { title: 'Novo Testamento', canons: ['NT'] },
]

/**
 * BookIndex: an edition's books, grouped by testament, each a link into the
 * reader (first chapter) carrying its honest review status. The Catholic
 * edition interleaves the deuterocanonical books in the traditional order
 * rather than appending them, and that order comes straight from the data.
 */
export function BookIndex({ edition }: BookIndexProps) {
  const groups = SECTIONS.map((section) => ({
    ...section,
    items: edition.books.filter((b) => section.canons.includes(b.canon)),
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
              <li key={book.code} className="h-full">
                <Link
                  to={`/ler/${edition.key}/${book.slug}/${chapterIds(book)[0]}`}
                  className="flex h-full flex-col gap-[var(--space-2)] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-4)] py-[var(--space-3)] no-underline hover:border-[var(--color-border-strong)]"
                >
                  <span className="font-serif text-[var(--text-lg)] leading-[var(--leading-tight)] text-[var(--color-text)]">
                    {book.name}
                  </span>
                  <span className="mt-auto flex items-center justify-between gap-[var(--space-2)]">
                    <span className="font-mono text-[var(--text-xs)] text-[var(--color-text-faint)]">{book.abbrev}</span>
                    <ReviewSeal status={book.status.formal} size="sm" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}

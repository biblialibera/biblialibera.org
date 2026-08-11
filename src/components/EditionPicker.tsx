import { Link } from 'react-router'
import { editions } from './readerData'
import { storeEdition } from './editions'

/**
 * The one question the reader is asked before reading: which edition.
 *
 * It is asked once, on the first visit to `/ler`, and the answer is remembered.
 * Asking beats deciding quietly, because the two answers differ by seven books
 * and by the numbering of two more, and because the project is ecumenical: the
 * same translation, assembled the way the reader's own tradition assembles it.
 *
 * Choosing writes the preference; the links are still links, so the choice is
 * also just a place, and it can be changed later from the toggle on either
 * page.
 */
export function EditionPicker() {
  return (
    <div className="max-w-[46rem]">
      <div className="mb-[var(--space-3)] font-sans text-[length:var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-label)] text-[var(--color-text-faint)]">
        Leitor
      </div>
      <h1 className="m-0 mb-[var(--space-3)] font-serif text-[var(--text-3xl)] tracking-[var(--tracking-tight)] text-[var(--color-text)]">
        Qual edição você lê?
      </h1>
      <p className="m-0 mb-[var(--space-8)] text-[var(--text-base)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
        A tradução é a mesma; o que muda é quais livros entram e como Ester e Daniel são montados. Dá para trocar
        depois, a qualquer momento.
      </p>

      <ul className="m-0 grid list-none grid-cols-1 gap-[var(--space-4)] p-0 sm:grid-cols-2">
        {editions.map((edition) => (
          <li key={edition.key} className="h-full">
            <Link
              to={`/ler/${edition.key}`}
              onClick={() => storeEdition(edition.key)}
              className="flex h-full flex-col gap-[var(--space-2)] rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] px-[var(--space-5)] py-[var(--space-4)] no-underline hover:border-[var(--color-accent)]"
            >
              <span className="font-serif text-[var(--text-xl)] leading-[var(--leading-tight)] text-[var(--color-text)]">
                {edition.name}
              </span>
              <span className="font-mono text-[length:var(--text-xs)] text-[var(--color-text-faint)]">
                {edition.books.length} livros
              </span>
              <span className="mt-[var(--space-2)] font-sans text-[length:var(--text-sm)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
                {edition.summary}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

import { Link } from 'react-router'

export interface ChapterGuideProps {
  /** Book slug for the chapter URLs, e.g. "salmos". */
  slug: string
  /** Short book label for the rail heading, e.g. "Sl". */
  abbrev: string
  /** How many chapters the book has. */
  chapters: number
  /** Chapter currently being read. */
  current: number
}

/**
 * ChapterGuide: the chapter rail in the reader's right gutter. Every chapter
 * of the current book as a numeric grid, so a jump is one click instead of a
 * trip through the book dropdown.
 *
 * Cells are links, not buttons: a chapter is a real URL, so it should be
 * middle-clickable and openable in a new tab. The grid borrows BookNav's
 * vocabulary (mono numerals, sunken cells, accent fill for the current one)
 * so the two nav surfaces read as one family.
 */
export function ChapterGuide({ slug, abbrev, chapters, current }: ChapterGuideProps) {
  return (
    <nav
      aria-label="Capítulos"
      className="w-[13rem] overflow-hidden rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-md)]"
    >
      <div className="border-b border-[var(--color-border)] px-[var(--space-3)] py-[var(--space-2)] font-sans text-[10px] font-bold uppercase tracking-[var(--tracking-label)] text-[var(--color-text-faint)]">
        {abbrev} · Capítulos
      </div>
      {/* Long books (Salmos: 150) scroll inside the rail instead of running
          past the bottom of the sticky viewport. */}
      <div className="max-h-[calc(100vh-11rem)] overflow-y-auto p-[var(--space-2)]">
        <div className="grid grid-cols-5 gap-[3px]">
          {Array.from({ length: chapters }, (_, i) => i + 1).map((n) => {
            const active = n === current
            return (
              <Link
                key={n}
                to={`/ler/${slug}/${n}`}
                aria-current={active ? 'page' : undefined}
                className={[
                  'flex aspect-square items-center justify-center rounded-[var(--radius-sm)] border font-mono text-[var(--text-xs)] no-underline',
                  active
                    ? 'border-[var(--color-accent)] bg-[var(--color-accent)] font-semibold text-[var(--color-accent-contrast)]'
                    : 'border-transparent bg-[var(--color-surface-sunken)] text-[var(--color-text-secondary)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)]',
                ].join(' ')}
              >
                {n}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

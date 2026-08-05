import { Link } from 'react-router'
import { VerseBlock } from '../design-system/components/reading'
import type { ThemePassage } from './themeData'

export interface PassageListProps {
  passages: ThemePassage[]
}

/**
 * PassageList: the passages of a theme, each headed by its reference, which
 * links into the reader at the chapter the passage comes from. The text is
 * rendered plain (no divine-name or footnote apparatus): this is an index that
 * points at the reading, not a substitute for it.
 */
export function PassageList({ passages }: PassageListProps) {
  return (
    <ol className="m-0 flex list-none flex-col gap-[var(--space-8)] p-0">
      {passages.map((passage) => (
        <li key={passage.reference}>
          <Link
            to={`/ler/${passage.bookSlug}/${passage.chapter}`}
            className="font-sans text-[var(--text-xs)] font-semibold uppercase tracking-[var(--tracking-label)] text-[var(--color-accent)] no-underline hover:underline"
          >
            {passage.reference}
          </Link>
          <div className="mt-[var(--space-3)]">
            {passage.verses.map((verse) => (
              <VerseBlock key={verse.verse} number={verse.verse}>
                {verse.text}
              </VerseBlock>
            ))}
          </div>
        </li>
      ))}
    </ol>
  )
}

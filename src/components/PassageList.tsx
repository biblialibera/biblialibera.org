import { Link } from 'react-router'
import { VerseBlock } from '../design-system/components/reading'
import type { ThemePassage } from './themeData'
import { passagePath } from './verseSelection'

export interface PassageListProps {
  passages: ThemePassage[]
}

/**
 * PassageList: the passages of a theme, each headed by its reference, which
 * links into the reader with the passage's own verses already selected and
 * highlighted, so the link a reader copies from here points at the passage
 * rather than at the chapter around it. The text is rendered plain (no
 * divine-name or footnote apparatus): this is an index that points at the
 * reading, not a substitute for it.
 */
export function PassageList({ passages }: PassageListProps) {
  return (
    <ol className="m-0 flex list-none flex-col gap-[var(--space-8)] p-0">
      {passages.map((passage) => (
        <li key={passage.reference}>
          <Link
            to={passagePath(passage.bookSlug, passage.chapter, { start: passage.start, end: passage.end })}
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

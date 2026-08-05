import { useState } from 'react'
import psalm23 from '../data/psalm23.json'
import { Badge } from '../design-system/components/core'
import { RegisterToggle, ReviewSeal, VerseBlock } from '../design-system/components/reading'
import { PassageFootnotes } from './PassageFootnotes'
import { renderPassage } from './scriptureText'

type View = 'formal' | 'original'

const VERSE_COUNT = psalm23.formal.length

const OPTIONS = [
  { value: 'formal', label: 'Português' },
  { value: 'original', label: `Original (${psalm23.originalInfo.language})` },
]

/**
 * RegisterDemo: Salmo 23 side-by-side with the original text, live from the
 * bundled `biblialibera` package: the reader can switch between the pt
 * translation and the source language and see the real text, with the note
 * apparatus and the actual review status of the book.
 */
export function RegisterDemo() {
  const [view, setView] = useState<View>('formal')

  return (
    <div className="mx-auto max-w-[var(--reading-measure)]">
      <div className="mb-[var(--space-2)] flex flex-wrap items-baseline gap-[var(--space-3)]">
        <h2 className="m-0 font-serif text-[var(--text-2xl)] text-[var(--color-text)]">Salmo 23</h2>
        <Badge mono>
          Sl 23.1–{VERSE_COUNT}
        </Badge>
      </div>
      <p className="mb-[var(--space-6)] text-[var(--text-base)] leading-[var(--leading-normal)] text-[var(--color-text-muted)]">
        O mesmo texto em português e no original, direto do pacote <code>biblialibera</code>. Troque e compare.
      </p>

      <div className="mb-[var(--space-8)] flex flex-wrap items-center justify-between gap-[var(--space-4)] border-b border-[var(--color-border)] pb-[var(--space-5)]">
        <RegisterToggle value={view} onChange={(value) => setView(value as View)} options={OPTIONS} />
        {view === 'original' ? (
          <Badge>{psalm23.originalInfo.edition}</Badge>
        ) : (
          <ReviewSeal status={(psalm23.status.formal as 'draft' | 'checked' | 'reviewed') ?? 'draft'} size="sm" />
        )}
      </div>

      {view === 'original' ? <OriginalPassage /> : <FormalPassage />}
    </div>
  )
}

function FormalPassage() {
  const { rendered, notes } = renderPassage(psalm23.formal, 'formal')

  return (
    <div>
      {rendered.map(({ verse, body }) => (
        <VerseBlock key={verse} number={verse}>
          {body}
        </VerseBlock>
      ))}
      <PassageFootnotes notes={notes} idPrefix="formal" />
      <p className="mt-[var(--space-6)] font-sans text-[var(--text-sm)] leading-[var(--leading-normal)] text-[var(--color-text-faint)]">
        <span className="[font-variant:small-caps] tracking-[var(--tracking-caps)] text-[var(--color-text-muted)]">
          Senhor
        </span>{' '}
        em versalete marca o nome divino (YHWH). O número em sobrescrito é o versículo. A nota fica à vista: quando o
        original é ambíguo, isso vira nota, nunca resolvemos em silêncio.
      </p>
    </div>
  )
}

function OriginalPassage() {
  return (
    <div dir={psalm23.originalInfo.dir} className="font-[family-name:var(--font-original)]">
      {psalm23.original.map((verse) => (
        <p
          key={verse.verse}
          className="m-0 mb-[var(--space-4)] text-[var(--text-xl)] leading-[var(--leading-relaxed)] text-[var(--color-text-verse)]"
        >
          <sup className="me-[0.35em] align-super font-mono text-[var(--text-xs)] text-[var(--color-verse-number)]">
            {verse.verse}
          </sup>
          {verse.text}
        </p>
      ))}
    </div>
  )
}

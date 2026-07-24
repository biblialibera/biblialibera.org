import { useState } from 'react'
import psalm23 from '../data/psalm23.json'
import { Badge } from '../design-system/components/core'
import { Footnote, FootnoteList, RegisterToggle, ReviewSeal, VerseBlock } from '../design-system/components/reading'
import { renderVerseText } from './scriptureText'

type Register = 'formal' | 'simple'

const VERSE_COUNT = psalm23.formal.length

const PASSAGES: Record<Register, { verse: number; text: string; footnotes: string[] }[]> = {
  formal: psalm23.formal,
  simple: psalm23.simple,
}

const PSALMS_STATUS = psalm23.status

/**
 * RegisterDemo — Salmo 23 side-by-side registers, live from the bundled
 * `biblialibera` package: the reader can switch between formal and simple
 * and see the real translated text, with the note apparatus and the actual
 * review status of the book.
 */
export function RegisterDemo() {
  const [register, setRegister] = useState<Register>('formal')
  const verses = PASSAGES[register]

  let noteNumber = 1
  const rendered = verses.map((verse) => {
    const result = renderVerseText(verse.text, verse.footnotes, register, noteNumber)
    noteNumber += result.notes.length
    return { verse: verse.verse, ...result }
  })
  const notes = rendered.flatMap((v) => v.notes)

  return (
    <div className="mx-auto max-w-[var(--reading-measure)]">
      <div className="mb-[var(--space-2)] flex flex-wrap items-baseline gap-[var(--space-3)]">
        <h2 className="m-0 font-serif text-[var(--text-2xl)] text-[var(--color-text)]">Salmo 23</h2>
        <Badge mono>
          Sl 23.1–{VERSE_COUNT}
        </Badge>
      </div>
      <p className="mb-[var(--space-6)] text-[var(--text-base)] leading-[var(--leading-normal)] text-[var(--color-text-muted)]">
        O mesmo texto em dois registros, direto do pacote <code>biblialibera</code>. Troque e leia a diferença: o
        sentido é o mesmo, muda a linguagem.
      </p>

      <div className="mb-[var(--space-8)] flex flex-wrap items-center justify-between gap-[var(--space-4)] border-b border-[var(--color-border)] pb-[var(--space-5)]">
        <RegisterToggle value={register} onChange={(value) => setRegister(value as Register)} />
        <ReviewSeal status={(PSALMS_STATUS[register] as 'draft' | 'checked' | 'reviewed') ?? 'draft'} size="sm" />
      </div>

      <div key={register}>
        {rendered.map(({ verse, body }) => (
          <VerseBlock key={verse} number={verse}>
            {body}
          </VerseBlock>
        ))}
        {notes.length > 0 && (
          <FootnoteList>
            {notes.map((note) => (
              <Footnote key={note.number} n={note.number} id={`${register}-nota-${note.number}`}>
                {note.text}
              </Footnote>
            ))}
          </FootnoteList>
        )}
      </div>

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

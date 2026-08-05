import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderVerseText } from './scriptureText'

function Verse({ text, footnotes, idPrefix = 'formal', nextNumber = 1 }: { text: string; footnotes: string[]; idPrefix?: string; nextNumber?: number }) {
  const { body } = renderVerseText(text, footnotes, idPrefix, nextNumber)
  return <p>{body}</p>
}

describe('renderVerseText', () => {
  it('wraps SENHOR in a title-cased DivineName', () => {
    render(<Verse text="O SENHOR é o meu pastor." footnotes={[]} />)
    expect(screen.getByText('Senhor')).toBeInTheDocument()
    expect(screen.queryByText('SENHOR')).not.toBeInTheDocument()
  })

  it('wraps DEUS too, and leaves the rest of the text untouched', () => {
    render(<Verse text="A graça do nosso DEUS." footnotes={[]} />)
    expect(screen.getByText('Deus')).toBeInTheDocument()
    expect(screen.getByText(/A graça do nosso/)).toBeInTheDocument()
  })

  it('renders one FootnoteRef per footnote, numbered from nextNumber', () => {
    render(<Verse text="Texto com nota." footnotes={['Primeira nota.', 'Segunda nota.']} nextNumber={3} />)
    expect(screen.getByRole('link', { name: 'nota 3' })).toHaveAttribute('href', '#fn-formal-3')
    expect(screen.getByRole('link', { name: 'nota 4' })).toHaveAttribute('href', '#fn-formal-4')
  })

  // The verse selection lives in the same hash, so a footnote anchor has to be
  // impossible to read as a verse reference.
  it('prefixes footnote anchors so they cannot be mistaken for a verse', () => {
    render(<Verse text="Texto com nota." footnotes={['Nota.']} idPrefix="original" />)
    const href = screen.getByRole('link', { name: 'nota 1' }).getAttribute('href')
    expect(href).toBe('#fn-original-1')
    expect(href).not.toMatch(/^#v/)
  })

  // The note at the foot of the chapter links back here, so the marker needs an
  // anchor of its own.
  it('anchors the inline marker so a note can link back to it', () => {
    const { container } = render(<Verse text="Texto com nota." footnotes={['Nota.']} nextNumber={2} />)
    const anchor = container.querySelector('#fnref-formal-2')
    expect(anchor).not.toBeNull()
    expect(anchor?.querySelector('a[href="#fn-formal-2"]')).not.toBeNull()
  })

  it('returns the footnote numbers and texts for the caller to render a FootnoteList', () => {
    const { notes } = renderVerseText('Texto.', ['Nota A.', 'Nota B.'], 'formal', 5)
    expect(notes).toEqual([
      { number: 5, text: 'Nota A.' },
      { number: 6, text: 'Nota B.' },
    ])
  })

  it('does not touch a word that merely contains SENHOR as a substring', () => {
    render(<Verse text="SENHORIO não deveria virar nome divino." footnotes={[]} />)
    expect(screen.queryByText('Senhor')).not.toBeInTheDocument()
  })
})

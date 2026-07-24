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
    expect(screen.getByRole('link', { name: 'nota 3' })).toHaveAttribute('href', '#formal-nota-3')
    expect(screen.getByRole('link', { name: 'nota 4' })).toHaveAttribute('href', '#formal-nota-4')
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

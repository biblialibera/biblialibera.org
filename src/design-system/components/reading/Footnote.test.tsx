import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Footnote, FootnoteList } from './Footnote'

describe('Footnote', () => {
  it('renders the marker and the descriptive note text', () => {
    render(
      <ul>
        <Footnote n={1}>Hebraico: YHWH, o nome próprio de Deus.</Footnote>
      </ul>,
    )
    expect(screen.getByText('Hebraico: YHWH, o nome próprio de Deus.')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
  })
})

describe('FootnoteList', () => {
  it('groups footnotes as an accessible region', () => {
    render(
      <FootnoteList>
        <Footnote n={1}>Ou: guardados por Jesus Cristo.</Footnote>
        <Footnote n={2}>Grego: doulos, literalmente escravo.</Footnote>
      </FootnoteList>,
    )
    expect(screen.getByRole('complementary', { name: 'Notas' })).toBeInTheDocument()
    expect(screen.getByText('Ou: guardados por Jesus Cristo.')).toBeInTheDocument()
    expect(screen.getByText('Grego: doulos, literalmente escravo.')).toBeInTheDocument()
  })

  it('accepts a custom accessible label', () => {
    render(<FootnoteList label="Notas de Jonas" />)
    expect(screen.getByRole('complementary', { name: 'Notas de Jonas' })).toBeInTheDocument()
  })
})

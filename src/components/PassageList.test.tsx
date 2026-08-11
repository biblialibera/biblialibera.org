import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { PassageList } from './PassageList'
import type { ThemePassage } from './themeData'

const passages: ThemePassage[] = [
  {
    reference: 'Josué 1:9',
    book: 'Josué',
    abbrev: 'Js',
    bookSlug: 'josue',
    chapter: '1',
    start: '9',
    end: '9',
    editions: ['catolica', 'protestante'],
    verses: [{ verse: '9', text: 'Sê forte e corajoso!' }],
  },
  {
    reference: 'Salmos 23:1-2',
    book: 'Salmos',
    abbrev: 'Sl',
    bookSlug: 'salmos',
    chapter: '23',
    start: '1',
    end: '2',
    editions: ['catolica', 'protestante'],
    verses: [
      { verse: '1', text: 'O SENHOR é o meu pastor.' },
      { verse: '2', text: 'Em pastos verdejantes ele me faz repousar.' },
    ],
  },
]

const renderList = (edition = 'protestante') =>
  render(
    <MemoryRouter>
      <PassageList passages={passages} edition={edition} />
    </MemoryRouter>,
  )

describe('PassageList', () => {
  it('links each reference to its own verses in the reader', () => {
    renderList()
    expect(screen.getByRole('link', { name: 'Josué 1:9' })).toHaveAttribute('href', '/ler/protestante/josue/1?v=9')
    expect(screen.getByRole('link', { name: 'Salmos 23:1-2' })).toHaveAttribute(
      'href',
      '/ler/protestante/salmos/23?v=1-2',
    )
  })

  // The index points into whichever edition the reader chose, since a curated
  // passage reads the same in both.
  it('follows the reader into the other edition', () => {
    renderList('catolica')
    expect(screen.getByRole('link', { name: 'Josué 1:9' })).toHaveAttribute('href', '/ler/catolica/josue/1?v=9')
  })

  // A passage only one edition carries has to link where it actually is,
  // rather than into an edition that does not have the book.
  it('sends a passage to the only edition that has it', () => {
    render(
      <MemoryRouter>
        <PassageList
          passages={[{ ...passages[0], reference: 'Tobias 4:15', bookSlug: 'tobias', editions: ['catolica'] }]}
          edition="protestante"
        />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Tobias 4:15' })).toHaveAttribute('href', '/ler/catolica/tobias/1?v=9')
  })

  it('renders every verse with its number', () => {
    renderList()
    expect(screen.getByText('Sê forte e corajoso!')).toBeInTheDocument()
    expect(screen.getByText('Em pastos verdejantes ele me faz repousar.')).toBeInTheDocument()
    expect(screen.getByLabelText('versículo 2')).toBeInTheDocument()
  })
})

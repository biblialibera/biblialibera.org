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
    chapter: 1,
    start: 9,
    end: 9,
    verses: [{ verse: 9, text: 'Sê forte e corajoso!' }],
  },
  {
    reference: 'Salmos 23:1-2',
    book: 'Salmos',
    abbrev: 'Sl',
    bookSlug: 'salmos',
    chapter: 23,
    start: 1,
    end: 2,
    verses: [
      { verse: 1, text: 'O SENHOR é o meu pastor.' },
      { verse: 2, text: 'Em pastos verdejantes ele me faz repousar.' },
    ],
  },
]

const renderList = () =>
  render(
    <MemoryRouter>
      <PassageList passages={passages} />
    </MemoryRouter>,
  )

describe('PassageList', () => {
  it('links each reference to its own verses in the reader', () => {
    renderList()
    expect(screen.getByRole('link', { name: 'Josué 1:9' })).toHaveAttribute('href', '/ler/josue/1#v9')
    expect(screen.getByRole('link', { name: 'Salmos 23:1-2' })).toHaveAttribute('href', '/ler/salmos/23#v1-2')
  })

  it('renders every verse with its number', () => {
    renderList()
    expect(screen.getByText('Sê forte e corajoso!')).toBeInTheDocument()
    expect(screen.getByText('Em pastos verdejantes ele me faz repousar.')).toBeInTheDocument()
    expect(screen.getByLabelText('versículo 2')).toBeInTheDocument()
  })
})

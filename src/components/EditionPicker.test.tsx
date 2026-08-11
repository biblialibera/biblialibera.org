import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it } from 'vitest'
import { EditionPicker } from './EditionPicker'
import { editions } from './readerData'

const renderPicker = () =>
  render(
    <MemoryRouter>
      <EditionPicker />
    </MemoryRouter>,
  )

describe('EditionPicker', () => {
  beforeEach(() => window.localStorage.clear())

  it('asks the question and offers every edition', () => {
    renderPicker()
    expect(screen.getByRole('heading', { level: 1, name: 'Qual edição você lê?' })).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(editions.length)
  })

  // The number of books is the difference the reader is actually choosing
  // between, so it is on the card rather than buried in the copy.
  it('says how many books each edition has', () => {
    renderPicker()
    expect(screen.getByRole('link', { name: /Católica/ })).toHaveTextContent('73 livros')
    expect(screen.getByRole('link', { name: /Protestante/ })).toHaveTextContent('66 livros')
  })

  it('remembers the answer and opens that edition', () => {
    renderPicker()
    const protestant = screen.getByRole('link', { name: /Protestante/ })
    expect(protestant).toHaveAttribute('href', '/ler/protestante')
    fireEvent.click(protestant)
    expect(window.localStorage.getItem('bl.reader.edition')).toBe('protestante')
  })

  it('remembers nothing until the reader answers', () => {
    renderPicker()
    expect(window.localStorage.getItem('bl.reader.edition')).toBeNull()
  })
})

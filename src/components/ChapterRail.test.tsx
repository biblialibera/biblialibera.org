import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { ChapterRail } from './ChapterRail'

const renderRail = (props: Partial<Parameters<typeof ChapterRail>[0]> = {}) =>
  render(
    <MemoryRouter>
      <ChapterRail bookSlug="jonas" abbrev="Jn" chapters={4} current={2} {...props} />
    </MemoryRouter>,
  )

describe('ChapterRail', () => {
  it('lists every chapter of the book', () => {
    renderRail()
    expect(screen.getAllByRole('link').map((a) => a.textContent)).toEqual(['1', '2', '3', '4'])
  })

  it('links each number to its chapter', () => {
    renderRail()
    expect(screen.getByRole('link', { name: '3' })).toHaveAttribute('href', '/ler/jonas/3')
  })

  it('marks the chapter being read, and only that one', () => {
    renderRail()
    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: '1' })).not.toHaveAttribute('aria-current')
  })

  // Moving to another chapter means leaving the passage behind, so the link
  // carries no ?v= for the reader to arrive with an old selection still lit.
  it('carries no selected passage', () => {
    renderRail()
    for (const link of screen.getAllByRole('link')) {
      expect(link.getAttribute('href')).not.toContain('?')
    }
  })

  it('handles a one-chapter book', () => {
    renderRail({ bookSlug: 'judas', abbrev: 'Jd', chapters: 1, current: 1 })
    expect(screen.getAllByRole('link')).toHaveLength(1)
  })

  it('is a landmark a screen reader can jump to, named after the book', () => {
    renderRail()
    expect(screen.getByRole('navigation', { name: 'Capítulos de Jn' })).toBeInTheDocument()
  })
})

import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { describe, expect, it } from 'vitest'
import { ChapterGuide } from './ChapterGuide'

function renderGuide(props: Partial<Parameters<typeof ChapterGuide>[0]> = {}) {
  return render(
    <MemoryRouter>
      <ChapterGuide slug="jonas" abbrev="Jn" chapters={4} current={2} {...props} />
    </MemoryRouter>,
  )
}

const guide = () => screen.getByRole('navigation', { name: 'Capítulos' })

describe('ChapterGuide', () => {
  it('lists every chapter of the book', () => {
    renderGuide()
    expect(within(guide()).getAllByRole('link')).toHaveLength(4)
  })

  it('links each chapter to its reader URL', () => {
    renderGuide()
    expect(within(guide()).getByRole('link', { name: '3' })).toHaveAttribute('href', '/ler/jonas/3')
  })

  it('marks the chapter being read as the current page', () => {
    renderGuide()
    expect(within(guide()).getByRole('link', { name: '2' })).toHaveAttribute('aria-current', 'page')
    expect(within(guide()).getByRole('link', { name: '1' })).not.toHaveAttribute('aria-current')
  })

  it('heads the rail with the book abbreviation', () => {
    renderGuide({ abbrev: 'Sl' })
    expect(within(guide()).getByText('Sl · Capítulos')).toBeInTheDocument()
  })

  it('handles a long book without dropping chapters', () => {
    renderGuide({ slug: 'salmos', abbrev: 'Sl', chapters: 150, current: 23 })
    expect(within(guide()).getAllByRole('link')).toHaveLength(150)
    expect(within(guide()).getByRole('link', { name: '150' })).toHaveAttribute('href', '/ler/salmos/150')
  })
})

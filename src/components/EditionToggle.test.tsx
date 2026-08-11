import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EditionToggle } from './EditionToggle'

const renderToggle = (current = 'catolica', hrefFor = (key: string) => `/ler/${key}`) =>
  render(
    <MemoryRouter>
      <EditionToggle current={current} hrefFor={hrefFor} />
    </MemoryRouter>,
  )

describe('EditionToggle', () => {
  beforeEach(() => window.localStorage.clear())

  it('offers both editions and marks the one open', () => {
    renderToggle('protestante')
    expect(screen.getByRole('link', { name: 'Protestante' })).toHaveAttribute('aria-current', 'true')
    expect(screen.getByRole('link', { name: 'Católica' })).not.toHaveAttribute('aria-current')
  })

  // Links, not buttons: an edition is a place with its own URL, so it opens in
  // a new tab on middle click and shows where it goes.
  it('sends each edition where the caller says its copy of this reading is', () => {
    renderToggle('catolica', (key) => `/ler/${key}/daniel/3`)
    expect(screen.getByRole('link', { name: 'Protestante' })).toHaveAttribute('href', '/ler/protestante/daniel/3')
  })

  // Choosing here is the deliberate act; arriving on someone else's link is
  // not, which is why nothing else writes this.
  it('remembers the choice when one is made', () => {
    renderToggle()
    fireEvent.click(screen.getByRole('link', { name: 'Protestante' }))
    expect(window.localStorage.getItem('bl.reader.edition')).toBe('protestante')
  })

  it('writes nothing merely by being rendered', () => {
    renderToggle('protestante')
    expect(window.localStorage.getItem('bl.reader.edition')).toBeNull()
  })

  it('is a landmark a screen reader can jump to', () => {
    renderToggle()
    expect(screen.getByRole('navigation', { name: 'Edição' })).toBeInTheDocument()
  })

  it('survives storage being blocked, which is what private mode does', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    renderToggle()
    expect(() => fireEvent.click(screen.getByRole('link', { name: 'Protestante' }))).not.toThrow()
    setItem.mockRestore()
  })
})

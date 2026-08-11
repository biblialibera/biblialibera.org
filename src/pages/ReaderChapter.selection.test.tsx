import { createEvent, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation, useNavigate } from 'react-router'
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import ReaderChapter from './ReaderChapter'

const scrollTo = vi.fn()
const scrollIntoView = vi.fn()

beforeAll(() => {
  vi.stubGlobal('scrollTo', scrollTo)
  Element.prototype.scrollIntoView = scrollIntoView
})
afterAll(() => vi.unstubAllGlobals())
beforeEach(() => {
  scrollTo.mockClear()
  scrollIntoView.mockClear()
})

/**
 * Reports the current hash and drives the history moves the reader itself has
 * no button for: jumping to a footnote anchor (which is how "a note must not
 * clear the selection" is exercised without depending on which verses of Jonas
 * carry notes) and stepping back.
 */
function LocationProbe() {
  const location = useLocation()
  const navigate = useNavigate()
  return (
    <>
      <span data-testid="hash">{location.hash}</span>
      <span data-testid="search">{location.search}</span>
      {/* A footnote is a plain <a href="#fn-...">, and a fragment link keeps
          the rest of the URL, so the query rides along untouched. */}
      <button
        type="button"
        onClick={() => navigate({ pathname: location.pathname, search: location.search, hash: '#fn-formal-1' })}
      >
        ir para a nota
      </button>
      <button type="button" onClick={() => navigate(-1)}>
        voltar
      </button>
    </>
  )
}

function renderAt(...entries: string[]) {
  return render(
    <MemoryRouter initialEntries={entries} initialIndex={entries.length - 1}>
      <LocationProbe />
      <Routes>
        <Route path="/ler" element={<div>Índice do leitor</div>} />
        <Route path="/ler/:edicao" element={<div>Índice da edição</div>} />
        <Route
          path="/ler/:edicao/:slug/:capitulo"
          element={<ReaderChapter theme="light" onToggleTheme={() => {}} />}
        />
      </Routes>
    </MemoryRouter>,
  )
}

const untilLoaded = () => screen.findByRole('radio', { name: 'Português' })
const hash = () => screen.getByTestId('hash').textContent
const search = () => screen.getByTestId('search').textContent
const verse = (container: HTMLElement, n: number) => container.querySelector(`#v${n}`) as HTMLElement

/**
 * Asserts the highlight covers exactly `expected` among the opening verses of
 * the chapter, so a range that leaks one verse too far fails as loudly as one
 * that never appears.
 */
function expectSelected(container: HTMLElement, expected: number[]) {
  for (let n = 1; n <= 6; n += 1) {
    const el = verse(container, n)
    if (expected.includes(n)) expect(el).toHaveAttribute('aria-current', 'true')
    else expect(el).not.toHaveAttribute('aria-current')
  }
}

describe('ReaderChapter verse links', () => {
  it('selects nothing when the URL carries no verse', async () => {
    const { container } = renderAt('/ler/catolica/jonas/1')
    await untilLoaded()
    expectSelected(container, [])
  })

  it('highlights the verse a shared link points at', async () => {
    const { container } = renderAt('/ler/catolica/jonas/1?v=2')
    await untilLoaded()
    expectSelected(container, [2])
  })

  it('highlights every verse of a shared range', async () => {
    const { container } = renderAt('/ler/catolica/jonas/1?v=2-4')
    await untilLoaded()
    expectSelected(container, [2, 3, 4])
  })

  it('puts a clicked verse in the URL', async () => {
    const { container } = renderAt('/ler/catolica/jonas/1')
    await untilLoaded()
    fireEvent.click(verse(container, 3))
    await waitFor(() => expect(search()).toBe('?v=3'))
    expectSelected(container, [3])
  })

  it('puts a shift-clicked range in the URL', async () => {
    const { container } = renderAt('/ler/catolica/jonas/1')
    await untilLoaded()
    fireEvent.click(verse(container, 3))
    await waitFor(() => expect(search()).toBe('?v=3'))

    fireEvent.click(verse(container, 5), { shiftKey: true })
    await waitFor(() => expect(search()).toBe('?v=3-5'))
    expectSelected(container, [3, 4, 5])
  })

  it('extends backwards from the verse that was clicked first', async () => {
    const { container } = renderAt('/ler/catolica/jonas/1?v=5')
    await untilLoaded()
    fireEvent.click(verse(container, 3), { shiftKey: true })
    await waitFor(() => expect(search()).toBe('?v=3-5'))
  })

  // The verse the reader picked first stays the pivot, so widening the range
  // the other way re-measures from it rather than from whichever end the hash
  // happens to name first.
  it('keeps extending from the first verse after a round trip through the URL', async () => {
    const { container } = renderAt('/ler/catolica/jonas/1?v=5')
    await untilLoaded()

    fireEvent.click(verse(container, 3), { shiftKey: true })
    await waitFor(() => expect(search()).toBe('?v=3-5'))

    fireEvent.click(verse(container, 6), { shiftKey: true })
    await waitFor(() => expect(search()).toBe('?v=5-6'))
    expectSelected(container, [5, 6])
  })

  it('drops the hash when the selected verse is clicked again', async () => {
    const { container } = renderAt('/ler/catolica/jonas/1?v=3')
    await untilLoaded()
    expectSelected(container, [3])

    fireEvent.click(verse(container, 3))
    await waitFor(() => expect(search()).toBe(''))
    expectSelected(container, [])
  })

  // A real shift+click is also the browser's own "extend the text selection"
  // gesture, so by the time the click lands the document has text selected and
  // the guard against drag-to-copy would throw the click away. jsdom never
  // selects anything on its own, so the browser has to be staged here: without
  // it these tests pass no matter what the handler does, which is exactly how
  // range selection shipped broken in every browser while green in the suite.
  describe('with text selected by the gesture itself', () => {
    // Assigned rather than stubbed: the shared scrollTo stub is torn down with
    // unstubAllGlobals only after the whole file, so this one has to restore
    // itself without touching it.
    const realGetSelection = window.getSelection
    beforeEach(() => {
      window.getSelection = () => ({ isCollapsed: false }) as unknown as Selection
    })
    afterEach(() => {
      window.getSelection = realGetSelection
    })

    it('still extends the range', async () => {
      const { container } = renderAt('/ler/catolica/jonas/1?v=3')
      await untilLoaded()

      fireEvent.click(verse(container, 5), { shiftKey: true })
      await waitFor(() => expect(search()).toBe('?v=3-5'))
      expectSelected(container, [3, 4, 5])
    })

    it('still ignores the click that ends a drag to copy', async () => {
      const { container } = renderAt('/ler/catolica/jonas/1?v=3')
      await untilLoaded()

      fireEvent.click(verse(container, 5))
      await waitFor(() => expect(search()).toBe('?v=3'))
      expectSelected(container, [3])
    })
  })

  // Taking the gesture is only half of it: the browser must also be stopped
  // from painting its own selection across the verses it spans, which it does
  // on mousedown, well before the click.
  it('keeps the browser from selecting the text a shift-click spans', async () => {
    const { container } = renderAt('/ler/catolica/jonas/1?v=3')
    await untilLoaded()

    const extend = createEvent.mouseDown(verse(container, 5), { shiftKey: true })
    fireEvent(verse(container, 5), extend)
    expect(extend.defaultPrevented).toBe(true)

    const plain = createEvent.mouseDown(verse(container, 5))
    fireEvent(verse(container, 5), plain)
    expect(plain.defaultPrevented).toBe(false)
  })

  // The selection is in the query and a note is in the hash, so they cannot
  // reach each other any more. This is the guarantee that used to depend on the
  // fn- prefix alone: reading a note must not drop the passage the reader is
  // about to share.
  it('keeps the selection when the hash jumps to a footnote', async () => {
    const { container } = renderAt('/ler/catolica/jonas/1?v=2-4')
    await untilLoaded()

    fireEvent.click(screen.getByRole('button', { name: 'ir para a nota' }))
    await waitFor(() => expect(hash()).toBe('#fn-formal-1'))
    expectSelected(container, [2, 3, 4])
  })

  it('follows the query when history moves to another selection', async () => {
    const { container } = renderAt('/ler/catolica/jonas/1?v=2', '/ler/catolica/jonas/1?v=4-5')
    await untilLoaded()
    expectSelected(container, [4, 5])

    fireEvent.click(screen.getByRole('button', { name: 'voltar' }))
    await waitFor(() => expect(search()).toBe('?v=2'))
    expectSelected(container, [2])
  })

  // Selecting replaces the history entry, so the back button leaves the reader
  // instead of walking back through every verse that was tried on the way.
  it('does not bury the previous page under the verses that were clicked', async () => {
    const { container } = renderAt('/ler', '/ler/catolica/jonas/1')
    await untilLoaded()

    fireEvent.click(verse(container, 3))
    await waitFor(() => expect(search()).toBe('?v=3'))
    fireEvent.click(verse(container, 5))
    await waitFor(() => expect(search()).toBe('?v=5'))

    fireEvent.click(screen.getByRole('button', { name: 'voltar' }))
    await screen.findByText('Índice do leitor')
  })

  it('clears the selection when the reader moves to another chapter', async () => {
    const { container } = renderAt('/ler/catolica/jonas/1?v=2')
    await untilLoaded()
    expectSelected(container, [2])

    fireEvent.click(screen.getByRole('button', { name: 'Próximo' }))
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Jonas 2' })).toBeInTheDocument())
    expect(search()).toBe('')
    expectSelected(container, [])
  })

  it('ignores a verse the chapter does not have instead of failing to render', async () => {
    const { container } = renderAt('/ler/catolica/jonas/1?v=900')
    await untilLoaded()
    expect(screen.getByRole('heading', { name: 'Jonas 1' })).toBeInTheDocument()
    expectSelected(container, [])
  })
})

describe('ReaderChapter scrolling', () => {
  it('starts a chapter with no linked verse at the top', async () => {
    renderAt('/ler/catolica/jonas/1')
    await untilLoaded()
    expect(scrollTo).toHaveBeenCalledWith(0, 0)
    expect(scrollIntoView).not.toHaveBeenCalled()
  })

  it('opens a shared link on the passage instead of the top of the chapter', async () => {
    const { container } = renderAt('/ler/catolica/jonas/1?v=4-5')
    await untilLoaded()
    expect(scrollTo).not.toHaveBeenCalled()
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled())
    expect(scrollIntoView.mock.instances[0]).toBe(verse(container, 4))
  })

  // Comparing a passage with the original is a reading action, not a jump: the
  // reader may be far below the verse the link opened on.
  it('stays where the reader is when the register is toggled', async () => {
    renderAt('/ler/catolica/jonas/1?v=4-5')
    await untilLoaded()
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(1))

    fireEvent.click(screen.getByRole('radio', { name: /^Original/ }))
    await waitFor(() => expect(screen.getByRole('radio', { name: /^Original/ })).toBeChecked())
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('stays where the reader is when a verse is selected', async () => {
    const { container } = renderAt('/ler/catolica/jonas/1?v=4')
    await untilLoaded()
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalledTimes(1))

    fireEvent.click(verse(container, 2))
    await waitFor(() => expect(search()).toBe('?v=2'))
    expect(scrollIntoView).toHaveBeenCalledTimes(1)
    expect(scrollTo).not.toHaveBeenCalled()
  })
})

// The URL a reader copies out of the address bar is the URL that unfurls: the
// passage travels in the query, which is the only part of it a preview crawler
// ever receives.
describe('ReaderChapter shared links', () => {
  it('highlights the passage a shared link points at', async () => {
    const { container } = renderAt('/ler/catolica/jonas/1?v=2-4')
    await untilLoaded()
    expectSelected(container, [2, 3, 4])
  })

  it('leaves the link exactly as it arrived, so copying it again works', async () => {
    renderAt('/ler/catolica/jonas/1?v=2-4')
    await untilLoaded()
    expect(search()).toBe('?v=2-4')
    expect(hash()).toBe('')
  })

  it('goes on selecting from there', async () => {
    const { container } = renderAt('/ler/catolica/jonas/1?v=2')
    await untilLoaded()

    fireEvent.click(verse(container, 4), { shiftKey: true })
    await waitFor(() => expect(search()).toBe('?v=2-4'))
    expectSelected(container, [2, 3, 4])
  })

  // Without the hash there is no anchor for the browser to jump to, so this
  // effect is the whole of "open a link and land on the verse".
  it('scrolls to the passage it opened on', async () => {
    const { container } = renderAt('/ler/catolica/jonas/1?v=3')
    await untilLoaded()
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled())
    expect(scrollIntoView.mock.instances[0]).toBe(verse(container, 3))
    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('keeps a query that says nothing about verses out of the way', async () => {
    const { container } = renderAt('/ler/catolica/jonas/1?utm_source=whatsapp')
    await untilLoaded()
    expectSelected(container, [])
    expect(search()).toBe('?utm_source=whatsapp')
  })
})

// Before this, the selection lived in the hash. Those links are already out
// there, in messages nobody can go back and edit.
describe('ReaderChapter links from when the selection lived in the hash', () => {
  it('still highlights the passage an old link points at', async () => {
    const { container } = renderAt('/ler/catolica/jonas/1#v2-4')
    await untilLoaded()
    expectSelected(container, [2, 3, 4])
  })

  it('rewrites the URL into the form that unfurls', async () => {
    renderAt('/ler/catolica/jonas/1#v2-4')
    await untilLoaded()
    await waitFor(() => expect(search()).toBe('?v=2-4'))
    expect(hash()).toBe('')
  })

  it('still scrolls to the passage', async () => {
    const { container } = renderAt('/ler/catolica/jonas/1#v3')
    await untilLoaded()
    await waitFor(() => expect(scrollIntoView).toHaveBeenCalled())
    expect(scrollIntoView.mock.instances[0]).toBe(verse(container, 3))
  })

  // Replaced, not pushed: otherwise the back button lands on the old URL, which
  // rewrites itself again, and the reader is stuck.
  it('does not trap the back button on the URL it rewrote', async () => {
    renderAt('/ler', '/ler/catolica/jonas/1#v2')
    await untilLoaded()
    await waitFor(() => expect(search()).toBe('?v=2'))

    fireEvent.click(screen.getByRole('button', { name: 'voltar' }))
    await screen.findByText('Índice do leitor')
  })
})

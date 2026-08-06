import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SharePassage } from './SharePassage'

const URL = 'https://biblialibera.org/ler/joao/3?v=16-18'
const REFERENCE = 'João 3:16-18'

/**
 * navigator.share and navigator.clipboard are not writable in jsdom (and share
 * does not exist at all), so each test installs the browser it needs and hands
 * it back afterwards.
 */
function stubNavigator(props: Record<string, unknown>) {
  const original = Object.fromEntries(
    Object.keys(props).map((key) => [key, Object.getOwnPropertyDescriptor(navigator, key)]),
  )

  for (const [key, value] of Object.entries(props)) {
    Object.defineProperty(navigator, key, { value, configurable: true, writable: true })
  }

  return () => {
    for (const [key, descriptor] of Object.entries(original)) {
      if (descriptor) Object.defineProperty(navigator, key, descriptor)
      else Reflect.deleteProperty(navigator, key)
    }
  }
}

let restore = () => {}
afterEach(() => restore())

const click = () => userEvent.click(screen.getByRole('button', { name: `Compartilhar ${REFERENCE}` }))

describe('SharePassage', () => {
  it('hands the link to the system share sheet when there is one', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    const writeText = vi.fn()
    restore = stubNavigator({ share, clipboard: { writeText } })

    render(<SharePassage url={URL} reference={REFERENCE} />)
    await click()

    expect(share).toHaveBeenCalledWith({ title: REFERENCE, text: REFERENCE, url: URL })
    expect(writeText).not.toHaveBeenCalled()
  })

  it('copies the link when there is no share sheet', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    restore = stubNavigator({ share: undefined, clipboard: { writeText } })

    render(<SharePassage url={URL} reference={REFERENCE} />)
    await click()

    expect(writeText).toHaveBeenCalledWith(URL)
    expect(await screen.findByRole('button', { name: `Compartilhar ${REFERENCE}` })).toHaveTextContent('Link copiado')
  })

  // Dismissing the sheet is a decision. Copying the link anyway would undo it,
  // and the reader would find it pasted into whatever they typed next.
  it('does nothing when the share sheet is dismissed', async () => {
    const share = vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError'))
    const writeText = vi.fn()
    restore = stubNavigator({ share, clipboard: { writeText } })

    render(<SharePassage url={URL} reference={REFERENCE} />)
    await click()

    expect(writeText).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: `Compartilhar ${REFERENCE}` })).toHaveTextContent('Compartilhar')
  })

  it('falls back to copying when the share sheet itself fails', async () => {
    const share = vi.fn().mockRejectedValue(new Error('no target'))
    const writeText = vi.fn().mockResolvedValue(undefined)
    restore = stubNavigator({ share, clipboard: { writeText } })

    render(<SharePassage url={URL} reference={REFERENCE} />)
    await click()

    expect(writeText).toHaveBeenCalledWith(URL)
  })

  it('says so when it cannot copy either', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    restore = stubNavigator({ share: undefined, clipboard: { writeText } })

    render(<SharePassage url={URL} reference={REFERENCE} />)
    await click()

    expect(await screen.findByRole('button', { name: `Compartilhar ${REFERENCE}` })).toHaveTextContent(
      'Não deu para copiar',
    )
  })
})

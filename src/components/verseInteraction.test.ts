import { afterEach, describe, expect, it, vi } from 'vitest'
import { isTouchClick } from './verseInteraction'

/** Stands in for the device: `(hover: none)` is what phones and tablets report. */
function stubHover(canHover: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn((query: string) => ({ matches: query === '(hover: none)' ? !canHover : false })),
  )
}

afterEach(() => vi.unstubAllGlobals())

describe('isTouchClick', () => {
  it('trusts the pointer type when the event carries one', () => {
    stubHover(true)
    expect(isTouchClick({ pointerType: 'touch' } as PointerEvent)).toBe(true)
    expect(isTouchClick({ pointerType: 'pen' } as PointerEvent)).toBe(true)
    expect(isTouchClick({ pointerType: 'mouse' } as PointerEvent)).toBe(false)
  })

  // Safari and Firefox deliver `click` as a plain MouseEvent, so there is no
  // pointer type to read. Reading it as "not a finger" left tap-to-extend dead
  // on every iPhone, which is the whole range gesture on a device with no
  // shift key. See WebKit bug 239810.
  it('falls back to the device when the event cannot say', () => {
    stubHover(false)
    expect(isTouchClick(new MouseEvent('click'))).toBe(true)

    stubHover(true)
    expect(isTouchClick(new MouseEvent('click'))).toBe(false)
  })

  it('treats a device that cannot be asked as a mouse', () => {
    vi.stubGlobal('matchMedia', undefined)
    expect(isTouchClick(new MouseEvent('click'))).toBe(false)
  })
})

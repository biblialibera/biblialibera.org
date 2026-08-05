import type { HTMLAttributes, MouseEvent } from 'react'
import type { VerseClick } from './verseSelection'
import { verseElementId } from './verseSelection'

/**
 * The props that turn a rendered verse into a selectable one: an anchor id so
 * `#v16` resolves, the click wiring, and the highlight.
 *
 * Shared by both registers, which render verses with different elements (the
 * pt text goes through the design system's VerseBlock, the original text is a
 * plain paragraph in its own font and direction), so this hands back props to
 * spread rather than wrapping either of them.
 *
 * The highlight is painted with a box-shadow rather than padding so that
 * selecting a verse never reflows the column around it. It is not animated:
 * VerseBlock sets `transition` inline for its own colour, and an inline style
 * beats a class, so a transition here would apply to one register and not the
 * other.
 */

const BASE_CLASS = 'cursor-pointer rounded-[var(--radius-sm)]'
const SELECTED_CLASS = 'bg-[var(--color-selection)] shadow-[0_0_0_0.25em_var(--color-selection)]'

interface VerseInteractionOptions {
  verse: number
  selected: boolean
  onSelect: (verse: number, click: VerseClick) => void
}

/**
 * A click came from a finger or a pen, neither of which has a shift key to
 * extend a range with.
 *
 * `click` is only a PointerEvent in Chromium; Safari (including on iOS) and
 * Firefox still deliver a plain MouseEvent, where `pointerType` is undefined.
 * Trusting it alone left tap-to-extend dead on every iPhone, so when the event
 * cannot say, fall back to asking whether the device has a pointer that can
 * hover: phones and tablets cannot, and a mouse can.
 */
export function isTouchClick(nativeEvent: Event): boolean {
  const pointerType = (nativeEvent as PointerEvent).pointerType
  if (pointerType) return pointerType === 'touch' || pointerType === 'pen'
  return window.matchMedia?.('(hover: none)').matches ?? false
}

/**
 * Whether the reader is in the middle of highlighting text with the mouse. A
 * drag across a verse ends in a click, and swallowing that click is what keeps
 * copying a phrase from also changing the selected range.
 */
function isSelectingText(): boolean {
  return window.getSelection?.()?.isCollapsed === false
}

export function verseInteractionProps({
  verse,
  selected,
  onSelect,
}: VerseInteractionOptions): HTMLAttributes<HTMLElement> & { id: string } {
  return {
    id: verseElementId(verse),
    // Deliberately not role="button"/tabIndex: a verse is prose, and making
    // every one of them a widget costs far more than selection is worth. It
    // would read the whole verse out as a button label, take away the
    // sentence-by-sentence navigation a screen reader user reads scripture
    // with, and put 176 tab stops in Psalm 119. Selecting is a pointer
    // convenience; the result it produces, the URL, is what anyone can share,
    // open and land on with the passage already highlighted.
    'aria-current': selected ? 'true' : undefined,
    className: selected ? `${BASE_CLASS} ${SELECTED_CLASS}` : BASE_CLASS,
    onClick: (event: MouseEvent<HTMLElement>) => {
      // Footnote markers are links inside the verse: let them navigate.
      if ((event.target as HTMLElement).closest('a, button')) return
      if (isSelectingText()) return
      onSelect(verse, { shiftKey: event.shiftKey, touch: isTouchClick(event.nativeEvent) })
    },
  }
}

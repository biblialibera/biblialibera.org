/**
 * Which edition a reader is reading, and which one they chose.
 *
 * Those are two different things, deliberately. The edition lives in the URL
 * (`/ler/catolica/daniel/3`) because the two editions disagree about what a
 * reference names: Dn 3,24 is the Prayer of Azariah in the Catholic edition
 * and the Hebrew verse in the Protestant one, and Tobias exists in one and not
 * the other. A link has to open what the person who shared it was looking at.
 *
 * The choice is remembered separately, in localStorage, and is what `/ler`
 * resolves to. Opening someone else's link therefore shows their edition
 * without ever overwriting yours: the URL wins for as long as you are on it,
 * and the only things that write the preference are the picker and the
 * edition toggle.
 *
 * The list of editions comes from the generated reader index, so the site never
 * offers an edition the content build did not produce.
 */

import type { ReaderEdition } from './readerData'
import { editions } from './readerData'

export type { ReaderEdition }

/**
 * The edition a visitor who never chose one reads, and what a link with no
 * edition in it resolves to: the first the build emits, which is the Catholic
 * one, the superset. Nothing is hidden from someone who has not answered yet.
 */
export const DEFAULT_EDITION = editions[0].key

export function isEditionKey(key: string | undefined | null): boolean {
  return editions.some((e) => e.key === key)
}

const EDITION_KEY = 'bl.reader.edition'

/**
 * The edition this reader chose, or null if they never did.
 *
 * Null is a real answer, not a missing one: it is what makes `/ler` show the
 * picker the first time instead of quietly deciding for them.
 */
export function readStoredEdition(): string | null {
  try {
    const stored = window.localStorage.getItem(EDITION_KEY)
    return isEditionKey(stored) ? stored : null
  } catch {
    // localStorage can throw (private mode, blocked storage): treat it as
    // never having chosen, which costs one extra tap and nothing else.
    return null
  }
}

export function storeEdition(key: string): void {
  try {
    window.localStorage.setItem(EDITION_KEY, key)
  } catch {
    // Ignore: remembering the choice is a nicety, not required for reading.
  }
}

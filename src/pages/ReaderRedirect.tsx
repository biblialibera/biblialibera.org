import { Navigate, useLocation, useParams } from 'react-router'
import { DEFAULT_EDITION, readStoredEdition } from '../components/editions'
import { bookBySlug, chapterIds, editionByKey } from '../components/readerData'

/**
 * Two segments after `/ler`, which is one short of a reading.
 *
 * Almost always a link handed out before the edition moved into the URL
 * (`/ler/joao/3`), which has to keep working: it opens in the reader's own
 * edition, or in the default when they have never chosen one. Every book the
 * reader could have linked to back then exists in both editions under the same
 * slug, so nothing is lost in the move.
 *
 * The other shape it can take is an edition and a book with no chapter
 * (`/ler/catolica/joao`), typed or truncated, which opens the book at its
 * first chapter.
 *
 * The query and the hash ride along either way: `?v=16` is the passage the
 * link was about.
 */
function ReaderRedirect() {
  const { primeiro, segundo } = useParams()
  const { search, hash } = useLocation()

  const asEdition = editionByKey(primeiro)
  if (asEdition && segundo) {
    const entry = bookBySlug(asEdition, segundo)
    const to = entry ? `/ler/${asEdition.key}/${entry.slug}/${chapterIds(entry)[0]}` : `/ler/${asEdition.key}`
    return <Navigate to={{ pathname: to, search, hash }} replace />
  }

  const edition = readStoredEdition() ?? DEFAULT_EDITION
  return <Navigate to={{ pathname: `/ler/${edition}/${primeiro}/${segundo}`, search, hash }} replace />
}

export default ReaderRedirect

import type { DataColumn } from '../design-system/components/core'
import { Badge, DataTable } from '../design-system/components/core'
import { ReviewSeal } from '../design-system/components/reading'

export type BookStatus = 'not-translated' | 'draft' | 'checked' | 'reviewed'

export interface BookStatusRow {
  book: string
  ref: string
  /** AT: protocanonical Old Testament. DC: deuterocanonical. NT: New Testament. */
  canon: 'AT' | 'DC' | 'NT'
  status: BookStatus
}

export interface BookStatusTableProps {
  rows: BookStatusRow[]
  caption?: string
}

const COLUMNS: DataColumn<BookStatusRow>[] = [
  { header: 'Livro', key: 'book' },
  { header: 'Ref', key: 'ref', mono: true },
  { header: 'Cânon', key: 'canon', mono: true },
  {
    header: 'Status',
    cell: (row) =>
      row.status === 'not-translated' ? (
        <Badge tone="neutral">Ainda não traduzido</Badge>
      ) : (
        <ReviewSeal status={row.status} size="sm" />
      ),
  },
]

/**
 * BookStatusTable: the review-status table across the whole canon: livro,
 * referência, cânon, and the honest status per row (the ReviewSeal for
 * translated books, a plain "ainda não traduzido" badge otherwise).
 */
export function BookStatusTable({ rows, caption }: BookStatusTableProps) {
  return <DataTable columns={COLUMNS} rows={rows} caption={caption} />
}

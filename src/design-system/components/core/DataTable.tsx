import type { HTMLAttributes, ReactNode } from 'react'

export interface DataColumn<Row> {
  header: string
  key?: keyof Row & string
  align?: 'left' | 'center' | 'right'
  mono?: boolean
  /** Custom cell renderer; receives the row object. */
  cell?: (row: Row) => ReactNode
}

export interface DataTableProps<Row> extends HTMLAttributes<HTMLDivElement> {
  columns: DataColumn<Row>[]
  rows: Row[]
  caption?: string
}

/**
 * DataTable — a clean, quiet table for structured data
 * (review status, canon classification, source texts).
 * Header in the sans voice; rows ruled with hairlines.
 */
export function DataTable<Row>({
  columns = [],
  rows = [],
  caption,
  style,
  ...rest
}: DataTableProps<Row>) {
  return (
    <div
      style={{
        overflowX: 'auto',
        border: 'var(--border-hair) solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        ...style,
      }}
      {...rest}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)' }}>
        {caption && (
          <caption
            style={{
              captionSide: 'top',
              textAlign: 'left',
              padding: 'var(--space-3) var(--space-4)',
              color: 'var(--color-text-muted)',
              fontSize: 'var(--text-xs)',
            }}
          >
            {caption}
          </caption>
        )}
        <thead>
          <tr>
            {columns.map((c, i) => (
              <th
                key={i}
                style={{
                  textAlign: c.align ?? 'left',
                  padding: '10px 16px',
                  background: 'var(--color-surface-sunken)',
                  borderBottom: 'var(--border-hair) solid var(--color-border-strong)',
                  color: 'var(--color-text-faint)',
                  fontWeight: 'var(--weight-bold)',
                  fontSize: 'var(--text-xs)',
                  letterSpacing: 'var(--tracking-label)',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                }}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, ri) => (
            <tr key={ri}>
              {columns.map((c, ci) => (
                <td
                  key={ci}
                  style={{
                    textAlign: c.align ?? 'left',
                    padding: '10px 16px',
                    borderBottom: ri === rows.length - 1 ? 'none' : 'var(--border-hair) solid var(--color-border)',
                    color: ci === 0 ? 'var(--color-text)' : 'var(--color-text-secondary)',
                    fontWeight: ci === 0 ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                    fontFamily: c.mono ? 'var(--font-mono)' : 'var(--font-sans)',
                    verticalAlign: 'top',
                  }}
                >
                  {c.cell ? c.cell(r) : c.key ? ((r as Record<string, unknown>)[c.key] as ReactNode) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

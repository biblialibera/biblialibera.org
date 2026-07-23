import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { DataTable } from './DataTable'

interface BookRow {
  book: string
  status: string
}

const columns = [
  { header: 'Livro', key: 'book' as const },
  { header: 'Status', key: 'status' as const },
]

const rows: BookRow[] = [
  { book: 'Jonas', status: 'reviewed' },
  { book: 'Judas', status: 'checked' },
]

describe('DataTable', () => {
  it('renders a header per column and a row per item', () => {
    render(<DataTable columns={columns} rows={rows} />)
    expect(screen.getByRole('columnheader', { name: 'Livro' })).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'Jonas' })).toBeInTheDocument()
    expect(screen.getByRole('cell', { name: 'checked' })).toBeInTheDocument()
  })

  it('renders a caption when given', () => {
    render(<DataTable columns={columns} rows={rows} caption="Status de revisão" />)
    expect(screen.getByText('Status de revisão')).toBeInTheDocument()
  })

  it('supports a custom cell renderer', () => {
    render(
      <DataTable
        columns={[{ header: 'Livro', cell: (r: BookRow) => `${r.book}!` }]}
        rows={rows}
      />,
    )
    expect(screen.getByRole('cell', { name: 'Jonas!' })).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ReviewSeal } from './ReviewSeal'

describe('ReviewSeal', () => {
  it('defaults to the checked status', () => {
    render(<ReviewSeal />)
    expect(screen.getByText('Verificado')).toBeInTheDocument()
  })

  it('renders each status label', () => {
    const { rerender } = render(<ReviewSeal status="draft" />)
    expect(screen.getByText('Rascunho')).toBeInTheDocument()

    rerender(<ReviewSeal status="reviewed" />)
    expect(screen.getByText('Revisado')).toBeInTheDocument()
  })

  it('shows the one-line meaning when detail is set', () => {
    render(<ReviewSeal status="draft" detail />)
    expect(screen.getByText('· Traduzido pelo pipeline, sem verificação')).toBeInTheDocument()
  })

  it('shows reviewer/date meta when given', () => {
    render(<ReviewSeal status="reviewed" meta="Lucas Merencia · 2026-07-22" />)
    expect(screen.getByText('Lucas Merencia · 2026-07-22')).toBeInTheDocument()
  })

  it('exposes the status meaning via the title attribute', () => {
    render(<ReviewSeal status="reviewed" />)
    expect(screen.getByText('Revisado')).toHaveAttribute('title', 'Revisão humana concluída')
  })
})

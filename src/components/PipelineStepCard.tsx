import type { ReactNode } from 'react'
import { Card, CardTitle } from '../design-system/components/core'

export interface PipelineStepCardProps {
  /** Step number, e.g. "01". */
  number: string
  title: string
  children?: ReactNode
  /** Marks the final step with the oxblood top rule (Card's `accent`). */
  accent?: boolean
}

/** PipelineStepCard — one numbered step of the translation pipeline: mono step number, title, description. */
export function PipelineStepCard({ number, title, children, accent = false }: PipelineStepCardProps) {
  return (
    <Card accent={accent} className="flex h-full flex-col">
      <div className="mb-[var(--space-2)] font-mono text-[var(--text-sm)] text-[var(--color-accent)]">{number}</div>
      <CardTitle>{title}</CardTitle>
      <p className="m-0 text-[var(--text-sm)] leading-[var(--leading-normal)] text-[var(--color-text-secondary)]">{children}</p>
    </Card>
  )
}

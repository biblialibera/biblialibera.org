import type { HTMLAttributes } from 'react'

export interface ReviewSealProps extends HTMLAttributes<HTMLSpanElement> {
  status?: 'draft' | 'checked' | 'reviewed'
  /** Append the one-line meaning of the status. */
  detail?: boolean
  /** Reviewer / date, e.g. "Lucas Merencia · 2026-07-22". */
  meta?: string
  size?: 'sm' | 'md'
}

const SEALS = {
  draft: {
    label: 'Rascunho',
    desc: 'Traduzido pelo pipeline, sem verificação',
    fg: 'var(--color-status-draft)',
    bg: 'var(--color-status-draft-bg)',
    bd: 'var(--color-status-draft-border)',
  },
  checked: {
    label: 'Verificado',
    desc: 'Passou na auditoria automática',
    fg: 'var(--color-status-checked)',
    bg: 'var(--color-status-checked-bg)',
    bd: 'var(--color-status-checked-border)',
  },
  reviewed: {
    label: 'Revisado',
    desc: 'Revisão humana concluída',
    fg: 'var(--color-status-reviewed)',
    bg: 'var(--color-status-reviewed-bg)',
    bd: 'var(--color-status-reviewed-border)',
  },
} as const

/**
 * ReviewSeal — honest publication status of a passage or book.
 * Three stages: rascunho → verificado → revisado. Reads as a quiet fact,
 * never an alarm. `detail` shows the one-line meaning; `meta` shows
 * reviewer/date when reviewed.
 */
export function ReviewSeal({ status = 'checked', detail = false, meta, size = 'md', style, ...rest }: ReviewSealProps) {
  const s = SEALS[status] ?? SEALS.draft
  const pad = size === 'sm' ? '3px 9px' : '5px 11px'

  return (
    <span
      title={s.desc}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-2)',
        padding: pad,
        borderRadius: 'var(--radius-pill)',
        background: s.bg,
        border: `var(--border-hair) solid ${s.bd}`,
        fontFamily: 'var(--font-sans)',
        fontSize: size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)',
        fontWeight: 'var(--weight-semibold)',
        color: s.fg,
        lineHeight: 1.2,
        ...style,
      }}
      {...rest}
    >
      <span
        aria-hidden="true"
        style={{
          width: '7px',
          height: '7px',
          borderRadius: 'var(--radius-pill)',
          background: s.fg,
          flex: 'none',
        }}
      />
      {s.label}
      {detail && (
        <span style={{ fontWeight: 'var(--weight-regular)', color: 'var(--color-text-muted)' }}>· {s.desc}</span>
      )}
      {meta && (
        <span
          style={{
            fontWeight: 'var(--weight-regular)',
            color: 'var(--color-text-muted)',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.85em',
          }}
        >
          {meta}
        </span>
      )}
    </span>
  )
}

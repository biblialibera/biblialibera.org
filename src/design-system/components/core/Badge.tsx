import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info'
  mono?: boolean
  children?: ReactNode
}

const TONES = {
  neutral: { fg: 'var(--color-text-secondary)', bg: 'var(--color-surface-sunken)', bd: 'var(--color-border)' },
  accent: { fg: 'var(--color-accent)', bg: 'var(--color-accent-tint)', bd: 'color-mix(in srgb, var(--color-accent) 30%, transparent)' },
  success: { fg: 'var(--success-0)', bg: 'var(--success-tint)', bd: 'color-mix(in srgb, var(--success-0) 30%, transparent)' },
  warning: { fg: 'var(--warning-0)', bg: 'var(--warning-tint)', bd: 'color-mix(in srgb, var(--warning-0) 30%, transparent)' },
  danger: { fg: 'var(--danger-0)', bg: 'var(--danger-tint)', bd: 'color-mix(in srgb, var(--danger-0) 30%, transparent)' },
  info: { fg: 'var(--info-0)', bg: 'var(--info-tint)', bd: 'color-mix(in srgb, var(--info-0) 30%, transparent)' },
} as const

/**
 * Badge — a small label for metadata (canon tags, source refs, counts).
 * `mono` renders the label in the monospace voice (verse refs, codes).
 */
export function Badge({ tone = 'neutral', mono = false, children, style, ...rest }: BadgeProps) {
  const t = TONES[tone] ?? TONES.neutral
  const badgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 9px',
    borderRadius: 'var(--radius-pill)',
    background: t.bg,
    color: t.fg,
    border: `var(--border-hair) solid ${t.bd}`,
    fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)',
    fontSize: 'var(--text-xs)',
    fontWeight: 'var(--weight-semibold)',
    letterSpacing: mono ? 0 : '0.01em',
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
    ...style,
  }

  return (
    <span style={badgeStyle} {...rest}>
      {children}
    </span>
  )
}

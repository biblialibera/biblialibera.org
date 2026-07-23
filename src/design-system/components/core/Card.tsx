import type { HTMLAttributes, ReactNode } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  raised?: boolean
  accent?: boolean
  padding?: 'sm' | 'md' | 'lg'
  children?: ReactNode
}

/**
 * Card — a bordered surface. Flat by default (edition-page calm),
 * `raised` adds a soft warm shadow. `accent` adds a top rule in oxblood.
 */
export function Card({ raised = false, accent = false, padding = 'lg', children, style, ...rest }: CardProps) {
  const pad = { sm: 'var(--space-3)', md: 'var(--space-4)', lg: 'var(--space-6)' }[padding] ?? 'var(--space-6)'
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: 'var(--border-hair) solid var(--color-border)',
        borderTop: accent ? 'var(--border-thick) solid var(--color-accent)' : undefined,
        borderRadius: 'var(--radius-lg)',
        boxShadow: raised ? 'var(--shadow-md)' : 'none',
        padding: pad,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children?: ReactNode
}

/** CardTitle — serif heading inside a Card. */
export function CardTitle({ children, style, ...rest }: CardTitleProps) {
  return (
    <h3
      style={{
        fontFamily: 'var(--font-serif)',
        fontSize: 'var(--text-lg)',
        fontWeight: 'var(--weight-semibold)',
        margin: '0 0 var(--space-2)',
        color: 'var(--color-text)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </h3>
  )
}

export interface CardMetaProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
}

/** CardMeta — muted sans label/eyebrow inside a Card. */
export function CardMeta({ children, style, ...rest }: CardMetaProps) {
  return (
    <div
      style={{
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--weight-semibold)',
        letterSpacing: 'var(--tracking-label)',
        textTransform: 'uppercase',
        color: 'var(--color-text-faint)',
        margin: '0 0 var(--space-2)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  )
}

import { useState } from 'react'
import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from 'react'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  iconLeft?: ReactNode
  iconRight?: ReactNode
}

const VARIANTS = {
  primary: { bg: 'var(--color-accent)', fg: 'var(--color-accent-contrast)', bd: 'var(--color-accent)', hoverBg: 'var(--color-accent-hover)' },
  secondary: { bg: 'var(--color-surface)', fg: 'var(--color-text)', bd: 'var(--color-border-strong)', hoverBg: 'var(--color-surface-sunken)' },
  ghost: { bg: 'transparent', fg: 'var(--color-text-secondary)', bd: 'transparent', hoverBg: 'var(--color-surface-sunken)' },
} as const

const SIZES = {
  sm: { pad: '6px 12px', fs: 'var(--text-sm)' },
  md: { pad: '9px 18px', fs: 'var(--text-base)' },
  lg: { pad: '12px 24px', fs: 'var(--text-md)' },
} as const

/**
 * Button — primary / secondary / ghost. Sans-serif UI voice.
 * Hover darkens (never scales); focus shows a ring.
 */
export function Button({
  variant = 'primary',
  size = 'md',
  disabled = false,
  iconLeft,
  iconRight,
  children,
  style,
  ...rest
}: ButtonProps) {
  const v = VARIANTS[variant] ?? VARIANTS.primary
  const s = SIZES[size] ?? SIZES.md
  const [hover, setHover] = useState(false)

  const buttonStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-2)',
    appearance: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    padding: s.pad,
    fontFamily: 'var(--font-sans)',
    fontSize: s.fs,
    fontWeight: 'var(--weight-semibold)',
    lineHeight: 1.2,
    letterSpacing: '0.01em',
    color: v.fg,
    background: hover && !disabled ? v.hoverBg : v.bg,
    border: `var(--border-hair) solid ${v.bd}`,
    borderRadius: 'var(--radius-md)',
    boxShadow: variant === 'primary' && !disabled ? 'var(--shadow-sm)' : 'none',
    opacity: disabled ? 0.5 : 1,
    transition: 'background .13s ease, color .13s ease',
    ...style,
  }

  return (
    <button
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={buttonStyle}
      {...rest}
    >
      {iconLeft}
      {children}
      {iconRight}
    </button>
  )
}

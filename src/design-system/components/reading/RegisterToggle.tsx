import type { HTMLAttributes } from 'react'

export interface RegisterOption {
  value: string
  label: string
}

export interface RegisterToggleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Selected register value. */
  value?: string
  onChange?: (value: string) => void
  /** Override the two default options. */
  options?: RegisterOption[]
  size?: 'sm' | 'md'
}

const DEFAULT_OPTIONS: RegisterOption[] = [
  { value: 'formal', label: 'Português' },
  { value: 'original', label: 'Original' },
]

/**
 * RegisterToggle — switch between the pt translation and the original text.
 * The switch is obvious and reversible; the reading position is preserved
 * by the host (the toggle only reports the choice).
 */
export function RegisterToggle({ value = 'formal', onChange, options, size = 'md', style, ...rest }: RegisterToggleProps) {
  const items = options ?? DEFAULT_OPTIONS
  const pad = size === 'sm' ? '5px 12px' : '7px 16px'
  const fs = size === 'sm' ? 'var(--text-xs)' : 'var(--text-sm)'

  return (
    <div
      role="radiogroup"
      aria-label="Registro de tradução"
      style={{
        display: 'inline-flex',
        padding: '3px',
        gap: '2px',
        background: 'var(--color-surface-sunken)',
        border: 'var(--border-hair) solid var(--color-border)',
        borderRadius: 'var(--radius-pill)',
        ...style,
      }}
      {...rest}
    >
      {items.map((it) => {
        const active = it.value === value
        return (
          <button
            key={it.value}
            role="radio"
            aria-checked={active}
            onClick={() => onChange?.(it.value)}
            style={{
              appearance: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: pad,
              borderRadius: 'var(--radius-pill)',
              fontFamily: 'var(--font-sans)',
              fontSize: fs,
              fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-medium)',
              letterSpacing: '0.01em',
              color: active ? 'var(--color-accent-contrast)' : 'var(--color-text-muted)',
              background: active ? 'var(--color-accent)' : 'transparent',
              boxShadow: active ? 'var(--shadow-sm)' : 'none',
              transition: 'background .14s ease, color .14s ease',
            }}
          >
            {it.label}
          </button>
        )
      })}
    </div>
  )
}

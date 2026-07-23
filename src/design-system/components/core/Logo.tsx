import type { CSSProperties, HTMLAttributes, ReactNode, SVGAttributes } from 'react'

export interface BookMarkProps extends SVGAttributes<SVGSVGElement> {
  size?: number | string
  /** Stroke color of the book itself. Default var(--color-text). */
  color?: string
  /** Color of the rising light beam. Default var(--color-accent). */
  accent?: string
}

/**
 * BookMark — the linear open-book-and-light icon ("The Open Codex", logo
 * concept 3a). An open book with a single shaft of light rising from the
 * gutter: the word set free. The full lockup icon (see Logo).
 */
export function BookMark({ size = 64, color = 'var(--color-text)', accent = 'var(--color-accent)', style, ...rest }: BookMarkProps) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} style={{ color, ...style } as CSSProperties} {...rest}>
      <g stroke={accent} strokeWidth={2} strokeLinecap="round" fill="none">
        <path d="M32 25 L32 3" />
        <path d="M32 25 L25 5.5" />
        <path d="M32 25 L39 5.5" />
        <path d="M32 25 L19.5 10" />
        <path d="M32 25 L44.5 10" />
      </g>
      <path d="M32 44 C24 38 16 37 8 38 L8 20 C16 19 24 20 32 26 Z" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round" />
      <path d="M32 44 C40 38 48 37 56 38 L56 20 C48 19 40 20 32 26 Z" fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinejoin="round" strokeLinecap="round" />
      <path d="M32 26 L32 44" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" />
    </svg>
  )
}

export interface SealMarkProps extends SVGAttributes<SVGSVGElement> {
  size?: number | string
  /** Fill of the solid medallion. Default var(--color-accent). */
  accent?: string
  /** Knockout color of the book and light. Default var(--color-bg). */
  paper?: string
}

/**
 * SealMark — the compact solid seal: the book knocked out in paper on a
 * solid oxblood medallion. The favicon / avatar form of BookMark; reads at
 * 16px, borrows the language of the project's own ReviewSeal.
 */
export function SealMark({ size = 64, accent = 'var(--color-accent)', paper = 'var(--color-bg)', style, ...rest }: SealMarkProps) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} style={style} {...rest}>
      <circle cx={32} cy={32} r={30} fill={accent} />
      <path d="M32 45 C25 40 17 39 11 40 L11 23 C17 22 25 23 32 28 Z" fill={paper} />
      <path d="M32 45 C39 40 47 39 53 40 L53 23 C47 22 39 23 32 28 Z" fill={paper} />
      <g stroke={paper} strokeWidth={1.8} strokeLinecap="round" fill="none">
        <path d="M32 27 L32 8" />
        <path d="M32 27 L26 10" />
        <path d="M32 27 L38 10" />
        <path d="M32 27 L21.5 14" />
        <path d="M32 27 L42.5 14" />
      </g>
      <path d="M32 28 L32 45" stroke={accent} strokeWidth={1.5} />
    </svg>
  )
}

export interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  /** Icon size in px; the wordmark and tagline scale with it. Default 40. */
  size?: number
  /** Tagline under the wordmark. Pass false to omit it. */
  tagline?: ReactNode | false
}

/**
 * Logo — the full lockup (logo concept 3a): BookMark + wordmark, "Libera"
 * in the oxblood accent, with the project tagline underneath. Use SealMark
 * alone for favicon/avatar sizes.
 */
export function Logo({ size = 40, tagline = 'Tradução aberta · CC BY 4.0', style, ...rest }: LogoProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', ...style }} {...rest}>
      <BookMark size={size} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 'var(--weight-semibold)',
            fontSize: `${size * 0.55}px`,
            letterSpacing: '-0.012em',
            color: 'var(--color-text)',
          }}
        >
          Biblia <span style={{ color: 'var(--color-accent)' }}>Libera</span>
        </span>
        {tagline && (
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '10px',
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              marginTop: '0.5em',
            }}
          >
            {tagline}
          </span>
        )}
      </div>
    </div>
  )
}

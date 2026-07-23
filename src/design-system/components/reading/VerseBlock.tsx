import type { CSSProperties, HTMLAttributes, MouseEvent, ReactNode } from 'react'

export interface VerseBlockProps extends HTMLAttributes<HTMLParagraphElement> {
  /** Verse number (rendered as a superscript). */
  number: number | string
  /** Verse text; may contain <Added>, <DivineName>, <FootnoteRef>. */
  children?: ReactNode
  /** Anchor id, e.g. "Jonah.2.3". */
  id?: string
  /** Dim the verse (e.g. a non-focused parallel register). */
  dim?: boolean
}

/**
 * VerseBlock — one verse: superscript number + text.
 * Compose the verse text with <Added>, <DivineName> and <FootnoteRef>.
 */
export function VerseBlock({ number, children, id, dim = false, style, ...rest }: VerseBlockProps) {
  return (
    <p
      id={id}
      data-verse={number}
      style={{
        margin: '0 0 0.7em',
        fontFamily: 'var(--font-serif)',
        fontSize: 'var(--reading-size)',
        lineHeight: 'var(--reading-leading)',
        color: dim ? 'var(--color-text-muted)' : 'var(--color-text-verse)',
        transition: 'color .15s ease',
        textWrap: 'pretty',
        ...style,
      }}
      {...rest}
    >
      <sup
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--verse-number-scale)',
          fontWeight: 'var(--weight-bold)',
          color: 'var(--color-verse-number)',
          verticalAlign: '0.42em',
          marginRight: '0.35em',
          lineHeight: 0,
          userSelect: 'none',
        }}
        aria-label={`versículo ${number}`}
      >
        {number}
      </sup>
      {children}
    </p>
  )
}

export interface AddedProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode
}

/** Added — a word supplied by the translator, absent in the original (rendered italic). */
export function Added({ children, style, ...rest }: AddedProps) {
  return (
    <i style={{ fontStyle: 'italic', color: 'var(--color-added-word)', ...style }} {...rest}>
      {children}
    </i>
  )
}

export interface DivineNameProps extends HTMLAttributes<HTMLSpanElement> {
  children?: ReactNode
}

/** DivineName — the tetragrammaton, rendered in small caps. Defaults to "Senhor". */
export function DivineName({ children = 'Senhor', style, ...rest }: DivineNameProps) {
  return (
    <span
      style={{
        fontVariant: 'small-caps',
        letterSpacing: 'var(--tracking-caps)',
        color: 'var(--color-divine-name)',
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  )
}

export interface FootnoteRefProps {
  /** The marker (usually a number). */
  n: number | string
  onClick?: (e: MouseEvent) => void
  href?: string
  style?: CSSProperties
}

/** FootnoteRef — inline marker that links a word to its philological note. */
export function FootnoteRef({ n, onClick, href, style, ...rest }: FootnoteRefProps) {
  const Tag = href ? 'a' : 'button'
  return (
    <Tag
      href={href}
      onClick={onClick}
      aria-label={`nota ${n}`}
      style={{
        appearance: 'none',
        background: 'none',
        border: 'none',
        padding: 0,
        margin: 0,
        cursor: 'pointer',
        font: 'inherit',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--footnote-scale)',
        fontWeight: 'var(--weight-semibold)',
        color: 'var(--color-footnote-marker)',
        verticalAlign: '0.42em',
        lineHeight: 0,
        textDecoration: 'none',
        ...style,
      }}
      {...rest}
    >
      {n}
    </Tag>
  )
}

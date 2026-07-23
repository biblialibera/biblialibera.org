import type { HTMLAttributes, ReactNode } from 'react'

export interface FootnoteProps extends HTMLAttributes<HTMLLIElement> {
  /** The marker matching the inline <FootnoteRef>. */
  n: number | string
  id?: string
  children?: ReactNode
}

/**
 * Footnote — a single philological note item (marker + text).
 * Notes read like the project's real notes: "Ou: …", "Grego: …",
 * "Alguns manuscritos trazem…". Never doctrinal, always descriptive.
 */
export function Footnote({ n, id, children, style, ...rest }: FootnoteProps) {
  return (
    <li
      id={id}
      style={{
        display: 'flex',
        gap: 'var(--space-2)',
        listStyle: 'none',
        margin: '0 0 var(--space-2)',
        fontFamily: 'var(--font-sans)',
        fontSize: 'var(--text-sm)',
        lineHeight: 'var(--leading-normal)',
        color: 'var(--color-footnote-text)',
        ...style,
      }}
      {...rest}
    >
      <span
        aria-hidden="true"
        style={{
          flex: 'none',
          fontWeight: 'var(--weight-bold)',
          color: 'var(--color-footnote-marker)',
          minWidth: '1.1em',
        }}
      >
        {n}
      </span>
      <span style={{ textWrap: 'pretty' }}>{children}</span>
    </li>
  )
}

export interface FootnoteListProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode
  /** Accessible label for the region. Default "Notas". */
  label?: string
}

/**
 * FootnoteList — the note apparatus at the foot of a passage.
 * Ruled off from the text so notes read as apparatus, not clutter.
 */
export function FootnoteList({ children, label = 'Notas', style, ...rest }: FootnoteListProps) {
  return (
    <aside
      aria-label={label}
      style={{
        marginTop: 'var(--space-5)',
        paddingTop: 'var(--space-3)',
        borderTop: 'var(--border-hair) solid var(--color-footnote-rule)',
        ...style,
      }}
      {...rest}
    >
      <ol style={{ margin: 0, padding: 0 }}>{children}</ol>
    </aside>
  )
}

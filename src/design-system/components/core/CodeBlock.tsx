import type { HTMLAttributes, ReactNode } from 'react'

export interface CodeBlockProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode
  /** Quiet header bar filename, e.g. "translations/pt/formal/Jonah.md". */
  filename?: string
  lang?: string
}

/**
 * CodeBlock — monospace block for the pipeline's real artifacts:
 * the strict Markdown verse format, canon.json, pandoc commands.
 * `filename` prints a quiet header bar. Transparency is the point.
 */
export function CodeBlock({ children, filename, lang, style, ...rest }: CodeBlockProps) {
  return (
    <div
      style={{
        border: 'var(--border-hair) solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        background: 'var(--color-surface)',
        ...style,
      }}
      {...rest}
    >
      {filename && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 14px',
            borderBottom: 'var(--border-hair) solid var(--color-border)',
            background: 'var(--color-surface-sunken)',
            fontFamily: 'var(--font-mono)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          <span>{filename}</span>
          {lang && (
            <span style={{ color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {lang}
            </span>
          )}
        </div>
      )}
      <pre
        style={{
          margin: 0,
          padding: 'var(--space-4)',
          overflowX: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: 'var(--text-sm)',
          lineHeight: 'var(--leading-normal)',
          color: 'var(--color-text)',
          tabSize: 2,
        }}
      >
        <code style={{ fontFamily: 'inherit', fontSize: 'inherit' }}>{children}</code>
      </pre>
    </div>
  )
}

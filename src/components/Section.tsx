import type { HTMLAttributes, ReactNode } from 'react'

export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, 'className'> {
  children?: ReactNode
  /** Adds a hairline top rule, the seam with the section above. Default true. */
  bordered?: boolean
  /** Container width: 'page' (72rem, most sections) or 'hero' (52rem, narrower). */
  width?: 'page' | 'hero'
  /** Centers text within the section (the hero uses this). */
  center?: boolean
  /** Extra top padding for the first section, under the sticky header (the hero). */
  spacious?: boolean
}

const WIDTH = {
  page: 'max-w-[var(--container-page)]',
  hero: 'max-w-[52rem]',
} as const

/**
 * Section: a page section: centered container with consistent vertical
 * padding and, by default, a hairline rule marking the seam with the
 * section above.
 */
export function Section({ children, bordered = true, width = 'page', center = false, spacious = false, id, ...rest }: SectionProps) {
  const classes = [
    'mx-auto px-[var(--space-6)]',
    spacious ? 'pt-[var(--space-24)] pb-[var(--space-16)]' : 'py-[var(--space-16)]',
    WIDTH[width],
    bordered ? 'border-t border-[var(--color-border)]' : '',
    center ? 'text-center' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <section id={id} className={classes} {...rest}>
      {children}
    </section>
  )
}

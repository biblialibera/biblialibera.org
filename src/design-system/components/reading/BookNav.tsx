import type { HTMLAttributes } from 'react'

export interface NavBook {
  code: string
  name: string
  abbrev: string
  chapters: number
}

export interface NavGroup {
  section: string
  items: NavBook[]
}

export interface BookNavProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Books grouped by testament. Defaults to the translated books. */
  books?: NavGroup[]
  edition?: 'catholic' | 'protestant' | 'nt'
  onEditionChange?: (edition: string) => void
  /** Selected book code (OSIS), e.g. "Jonah". */
  book?: string
  chapter?: number
  onSelectBook?: (code: string) => void
  onSelectChapter?: (chapter: number) => void
}

const DEFAULT_BOOKS: NavGroup[] = [
  {
    section: 'Antigo Testamento',
    items: [
      { code: 'Gen', name: 'Gênesis', abbrev: 'Gn', chapters: 50 },
      { code: 'Ps', name: 'Salmos', abbrev: 'Sl', chapters: 150 },
      { code: 'Isa', name: 'Isaías', abbrev: 'Is', chapters: 66 },
      { code: 'Jonah', name: 'Jonas', abbrev: 'Jn', chapters: 4 },
      { code: 'Zeph', name: 'Sofonias', abbrev: 'Sf', chapters: 3 },
    ],
  },
  {
    section: 'Novo Testamento',
    items: [
      { code: 'Mark', name: 'Marcos', abbrev: 'Mc', chapters: 16 },
      { code: 'Titus', name: 'Tito', abbrev: 'Tt', chapters: 3 },
      { code: 'Phlm', name: 'Filemom', abbrev: 'Fm', chapters: 1 },
      { code: 'Jude', name: 'Judas', abbrev: 'Jd', chapters: 1 },
    ],
  },
]

const EDITIONS = [
  { value: 'catholic', label: 'Católica', note: '73' },
  { value: 'protestant', label: 'Protestante', note: '66' },
  { value: 'nt', label: 'Novo Test.', note: '27' },
]

/**
 * BookNav — book + chapter navigation for 66-73 books without a wall of links.
 * Edition selector on top; books grouped by testament in a scannable list;
 * chapters as a numeric grid for the selected book.
 */
export function BookNav({
  books = DEFAULT_BOOKS,
  edition = 'catholic',
  onEditionChange,
  book = 'Jonah',
  chapter = 2,
  onSelectBook,
  onSelectChapter,
  style,
  ...rest
}: BookNavProps) {
  const flat = books.flatMap((g) => g.items)
  const current = flat.find((b) => b.code === book) ?? flat[0]
  const nChap = current ? current.chapters : 0

  return (
    <div
      style={{
        width: '320px',
        background: 'var(--color-surface)',
        border: 'var(--border-hair) solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-md)',
        overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
        ...style,
      }}
      {...rest}
    >
      {/* Edition */}
      <div style={{ display: 'flex', gap: '4px', padding: 'var(--space-3)', borderBottom: 'var(--border-hair) solid var(--color-border)' }}>
        {EDITIONS.map((e) => {
          const active = e.value === edition
          return (
            <button
              key={e.value}
              onClick={() => onEditionChange?.(e.value)}
              aria-pressed={active}
              style={{
                flex: 1,
                appearance: 'none',
                cursor: 'pointer',
                padding: '6px 4px',
                borderRadius: 'var(--radius-md)',
                border: `var(--border-hair) solid ${active ? 'var(--color-accent)' : 'var(--color-border)'}`,
                background: active ? 'var(--color-accent-tint)' : 'transparent',
                color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-xs)',
                fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-medium)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1px',
                transition: 'all .12s ease',
              }}
            >
              <span>{e.label}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', opacity: 0.7 }}>{e.note} livros</span>
            </button>
          )
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 118px' }}>
        {/* Book list */}
        <div style={{ maxHeight: '280px', overflowY: 'auto', borderRight: 'var(--border-hair) solid var(--color-border)', padding: 'var(--space-2)' }}>
          {books.map((group) => (
            <div key={group.section} style={{ marginBottom: 'var(--space-2)' }}>
              <div
                style={{
                  padding: '6px 8px 4px',
                  fontSize: '10px',
                  fontWeight: 'var(--weight-bold)',
                  letterSpacing: 'var(--tracking-label)',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-faint)',
                }}
              >
                {group.section}
              </div>
              {group.items.map((b) => {
                const active = b.code === book
                return (
                  <button
                    key={b.code}
                    onClick={() => onSelectBook?.(b.code)}
                    aria-current={active ? 'true' : undefined}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      appearance: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'none',
                      background: active ? 'var(--color-accent-tint)' : 'transparent',
                      color: active ? 'var(--color-accent)' : 'var(--color-text)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: 'var(--text-sm)',
                      fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                    }}
                  >
                    <span>{b.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--color-text-faint)' }}>{b.abbrev}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </div>

        {/* Chapter grid */}
        <div style={{ padding: 'var(--space-2)', maxHeight: '280px', overflowY: 'auto' }}>
          <div
            style={{
              padding: '6px 4px 4px',
              fontSize: '10px',
              fontWeight: 'var(--weight-bold)',
              letterSpacing: 'var(--tracking-label)',
              textTransform: 'uppercase',
              color: 'var(--color-text-faint)',
            }}
          >
            {current ? current.abbrev : ''} · Cap.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '3px' }}>
            {Array.from({ length: nChap }, (_, i) => i + 1).map((c) => {
              const active = c === chapter && current?.code === book
              return (
                <button
                  key={c}
                  onClick={() => onSelectChapter?.(c)}
                  aria-current={active ? 'true' : undefined}
                  style={{
                    appearance: 'none',
                    cursor: 'pointer',
                    aspectRatio: '1',
                    borderRadius: 'var(--radius-sm)',
                    border: `var(--border-hair) solid ${active ? 'var(--color-accent)' : 'transparent'}`,
                    background: active ? 'var(--color-accent)' : 'var(--color-surface-sunken)',
                    color: active ? 'var(--color-accent-contrast)' : 'var(--color-text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: active ? 'var(--weight-semibold)' : 'var(--weight-regular)',
                  }}
                >
                  {c}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

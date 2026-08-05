import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { PassageList } from '../components/PassageList'
import { Section } from '../components/Section'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { loadTheme, themeBySlug, type Theme as ThemeData } from '../components/themeData'

const GITHUB_URL = 'https://github.com/biblialibera/biblialibera'

export interface ThemeDetailProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

/** ThemeDetail: one theme's passages, lazy-loaded by slug. */
function ThemeDetail({ theme, onToggleTheme }: ThemeDetailProps) {
  const { slug } = useParams()
  const entry = slug ? themeBySlug(slug) : undefined
  const [data, setData] = useState<ThemeData | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!entry) return
    let alive = true
    setData(null)
    setFailed(false)
    loadTheme(entry.slug).then(
      (loaded) => void (alive && setData(loaded)),
      () => void (alive && setFailed(true)),
    )
    return () => {
      alive = false
    }
  }, [entry])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  if (!entry) return <Navigate to="/temas" replace />

  const openGithub = () => window.open(GITHUB_URL, '_blank', 'noopener')

  return (
    <>
      <SiteHeader theme={theme} onToggleTheme={onToggleTheme} onOpenGithub={openGithub} />

      <Section bordered={false}>
        <div className="mx-auto max-w-[var(--reading-measure)]">
          <Link
            to="/temas"
            className="font-sans text-[var(--text-sm)] font-semibold text-[var(--color-text-muted)] no-underline hover:text-[var(--color-text)]"
          >
            ‹ Temas
          </Link>

          <h1 className="m-0 mb-[var(--space-3)] mt-[var(--space-6)] font-serif text-[var(--text-3xl)] tracking-[var(--tracking-tight)] text-[var(--color-text)]">
            {entry.name}
          </h1>
          <p className="m-0 mb-[var(--space-8)] border-b border-[var(--color-border)] pb-[var(--space-6)] text-[var(--text-base)] leading-[var(--leading-relaxed)] text-[var(--color-text-secondary)]">
            {entry.summary}
          </p>

          {data?.slug === entry.slug ? (
            <PassageList passages={data.passages} />
          ) : (
            <p className="m-0 font-sans text-[var(--text-sm)] text-[var(--color-text-faint)]">
              {failed ? 'Não foi possível carregar as passagens deste tema.' : 'Carregando...'}
            </p>
          )}
        </div>
      </Section>

      <SiteFooter year={new Date().getFullYear()} />
    </>
  )
}

export default ThemeDetail

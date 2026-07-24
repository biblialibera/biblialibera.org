import { useEffect, useState } from 'react'
import { Route, Routes } from 'react-router'
import Landing from './pages/Landing'
import ReaderChapter from './pages/ReaderChapter'
import ReaderIndex from './pages/ReaderIndex'

type Theme = 'light' | 'dark'

function App() {
  // Light is the default regardless of system preference; the visitor
  // switches to dark explicitly via ThemeToggle.
  const [theme, setTheme] = useState<Theme>('light')
  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))

  // The design system's color aliases (--color-bg, --color-text, ...) are
  // declared on :root, so data-theme must live on the root element too: set
  // on an inner div, the raw ramp (--paper-0, ...) would flip but the
  // aliases would keep resolving against :root's own (always light) ramp.
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
      <Routes>
        <Route path="/" element={<Landing theme={theme} onToggleTheme={toggleTheme} />} />
        <Route path="/ler" element={<ReaderIndex theme={theme} onToggleTheme={toggleTheme} />} />
        <Route path="/ler/:slug/:capitulo" element={<ReaderChapter theme={theme} onToggleTheme={toggleTheme} />} />
      </Routes>
    </div>
  )
}

export default App

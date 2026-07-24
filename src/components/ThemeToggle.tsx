export interface ThemeToggleProps {
  theme: 'light' | 'dark'
  onToggle: () => void
}

/**
 * ThemeToggle — switches the site between light and dark. Shows the icon
 * for the mode a click would switch to (moon in light mode, sun in dark).
 */
export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label="Alternar tema"
      title="Alternar tema claro / escuro"
      className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-border)] bg-transparent text-[var(--color-text-secondary)] transition-colors duration-150 hover:bg-[var(--color-surface-sunken)]"
    >
      {theme === 'dark' ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  )
}

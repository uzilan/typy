import { useState } from 'react'

export type Theme = 'light' | 'dark'

function systemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

/**
 * Starts from the OS preference. Toggling sets an explicit override
 * on <html data-theme>, kept in memory only (resets on reload).
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(systemTheme)

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    setTheme(next)
  }

  return { theme, toggle }
}

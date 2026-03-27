import { useState, useEffect } from 'react'

function getTheme(): 'dark' | 'light' {
  try {
    const raw = localStorage.getItem('fd_theme')
    return raw ? JSON.parse(raw) : 'dark'
  } catch {
    return 'dark'
  }
}

// Global listeners so all components update together
const listeners = new Set<() => void>()

export function notifyThemeChange() {
  listeners.forEach(fn => fn())
}

export function useTheme() {
  const [theme, setThemeState] = useState<'dark' | 'light'>(getTheme)

  useEffect(() => {
    const update = () => setThemeState(getTheme())
    listeners.add(update)
    return () => { listeners.delete(update) }
  }, [])

  const setTheme = (t: 'dark' | 'light') => {
    localStorage.setItem('fd_theme', JSON.stringify(t))
    if (t === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    notifyThemeChange()
  }

  return { theme, setTheme, isDark: theme === 'dark' }
}

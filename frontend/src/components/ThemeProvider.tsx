'use client'

/**
 * ThemeProvider
 * Defaults to dark theme. Reads saved preference from localStorage.
 * Provides a toggle context for light/dark switching.
 */
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface ThemeContextType {
  dark: boolean
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextType>({ dark: true, toggle: () => {} })

export const useTheme = () => useContext(ThemeContext)

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState(true) // default dark

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    // Default to dark if no preference saved
    const isDark = saved === 'light' ? false : true
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
    if (isDark) {
      document.documentElement.style.colorScheme = 'dark'
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
      document.documentElement.style.colorScheme = 'light'
    }
  }, [])

  const toggle = () => {
    setDark(prev => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('theme', next ? 'dark' : 'light')
      if (next) {
        document.documentElement.removeAttribute('data-theme')
        document.documentElement.style.colorScheme = 'dark'
      } else {
        document.documentElement.setAttribute('data-theme', 'light')
        document.documentElement.style.colorScheme = 'light'
      }
      return next
    })
  }

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}

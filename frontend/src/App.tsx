import { useEffect } from 'react'
import AppRouter from './routes'
import { useThemeStore } from './store/themeStore'
import './App.css'

export default function App() {
  const { theme } = useThemeStore()

  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove both to start fresh
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      // We don't actually need to add a class for system if our CSS handles prefers-color-scheme,
      // but adding it ensures absolute clarity.
      // However, our CSS uses :root:not(.light) for dark, so let's stick to that logic.
    } else {
      root.classList.add(theme)
    }
  }, [theme])

  return <AppRouter />
}

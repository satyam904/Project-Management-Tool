import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, AuthTokens } from '../types/auth'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  setAuth: (user: User, tokens: AuthTokens) => void
  setUser: (user: User) => void
  clearAuth: () => void
}


export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setAuth: (user, tokens) => {
        localStorage.setItem('access_token', tokens.access)
        localStorage.setItem('refresh_token', tokens.refresh)
        set({ user, isAuthenticated: true })
      },
      setUser: (user) => set({ user }),
      clearAuth: () => {

        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, isAuthenticated: false })
      },
    }),
    { name: 'auth-store' }
  )
)

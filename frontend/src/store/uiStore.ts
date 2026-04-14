import { create } from 'zustand'

interface UiState {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  toggleSidebarCollapse: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: typeof window !== 'undefined' ? window.innerWidth >= 1024 : true,
  sidebarCollapsed: typeof window !== 'undefined' ? localStorage.getItem('sidebarCollapsed') === 'true' : false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleSidebarCollapse: () => set((s) => {
    const nextValue = !s.sidebarCollapsed
    localStorage.setItem('sidebarCollapsed', String(nextValue))
    return { sidebarCollapsed: nextValue }
  }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))


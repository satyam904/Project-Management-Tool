import React from 'react'
import { Menu, Bell, Search } from 'lucide-react'
import { useUiStore } from '../../store/uiStore'
import { clsx } from 'clsx'

interface NavbarProps {
  title: string
  actions?: React.ReactNode
}

export function Navbar({ title, actions }: NavbarProps) {
  const toggleSidebar = useUiStore(s => s.toggleSidebar)

  return (
    <header className="h-20 border-b border-border-default bg-background/80 backdrop-blur-md px-6 md:px-10 lg:px-12 flex items-center justify-between shrink-0 sticky top-0 z-10 transition-all duration-300">
      <div className="flex items-center gap-4 md:gap-6 overflow-hidden">
        <button 
          onClick={toggleSidebar}
          className="p-1.5 text-text-muted hover:text-text-h hover:bg-surface lg:hidden rounded-premium transition-all active:scale-95"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-display text-base md:text-lg font-bold text-text-h truncate tracking-tight">{title}</h1>
      </div>
      
      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        {/* Compact Search Bar */}
        <div className="hidden lg:flex items-center relative group">
          <Search className="absolute left-3 w-3.5 h-3.5 text-text-muted group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Search everything..." 
            className="bg-surface border border-border-default rounded-full pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary w-48 focus:w-64 transition-all duration-300"
          />
        </div>
        
        <div className="flex items-center gap-1 md:gap-2">
          <button className="p-2 text-text-muted hover:text-text-h hover:bg-surface rounded-full transition-all relative active:scale-95">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-background"></span>
          </button>
          
          {actions && (
            <div className="flex items-center gap-2 pl-2 border-l border-border-default/50">
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  Layers, 
  LayoutDashboard, 
  LogOut, 
  FolderKanban, 
  CheckSquare, 
  Settings,
  Sun,
  Moon,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useUiStore } from '../../store/uiStore'
import { useThemeStore, type Theme } from '../../store/themeStore'
import { Avatar } from '../ui/Avatar'
import { logout } from '../../api/auth'
import { clsx } from 'clsx'

export function Sidebar() {
  const { user, clearAuth } = useAuthStore()
  const { sidebarOpen, setSidebarOpen, sidebarCollapsed, toggleSidebarCollapse } = useUiStore()
  const { theme, setTheme } = useThemeStore()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token')
      if (refresh) await logout(refresh)
    } finally {
      clearAuth()
    }
  }

  useEffect(() => {
    const handleResize = () => {
      // Mobile handling (drawer)
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      } else if (window.innerWidth >= 1024 && !sidebarOpen) {
        setSidebarOpen(true)
      }
    }
    window.addEventListener('resize', handleResize)
    // Initial check (only for local state, not forcing override if already set)
    if (window.innerWidth < 1024 && sidebarOpen) setSidebarOpen(false)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [setSidebarOpen, sidebarOpen])

  const isSelected = (path: string) => location.pathname.startsWith(path)

  const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Projects', icon: FolderKanban, path: '/projects' },
    { label: 'My Tasks', icon: CheckSquare, path: '/tasks' },
    { label: 'Settings', icon: Settings, path: '/settings' },
  ]

  const themes: { id: Theme; icon: any; label: string }[] = [
    { id: 'light', icon: Sun, label: 'Light' },
    { id: 'dark', icon: Moon, label: 'Dark' },
  ]

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className={clsx(
          'fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity lg:hidden',
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setSidebarOpen(false)}
      />
      
      {/* Sidebar Container */}
      <div className={clsx(
        'fixed inset-y-0 left-0 bg-surface border-r border-border-default z-50 transform transition-all duration-300 ease-in-out',
        'lg:static lg:translate-x-0 flex flex-col shadow-2xl lg:shadow-none',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        sidebarCollapsed ? 'w-20' : 'w-72'
      )}>
        {/* Header */}
        <div className={clsx(
          'h-20 flex items-center justify-between border-b border-border-default transition-all duration-300',
          sidebarCollapsed ? 'px-4 justify-center' : 'px-6'
        )}>
          <div className="flex items-center overflow-hidden">
            <div className="bg-primary p-2 rounded-premium-sm shrink-0">
              <Layers className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <span className="font-display font-bold text-lg text-text-h ml-2.5 whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                PMT
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {/* Mobile Close Button */}
            <button 
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 text-text-muted hover:text-text-h hover:bg-surface-hover rounded-full lg:hidden transition-all"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Floating Desktop Collapse Toggle */}
        <button
          onClick={toggleSidebarCollapse}
          className={clsx(
            "hidden lg:flex absolute -right-3 top-24 z-[60] w-6 h-6 items-center justify-center bg-surface border border-border-default rounded-full shadow-sm text-text-muted hover:text-primary hover:border-primary transition-all group",
            sidebarCollapsed && "rotate-0"
          )}
          title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {sidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
        </button>

        
        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto py-8 flex flex-col gap-2 px-3 mt-2 scrollbar-hide">
          {!sidebarCollapsed && (
            <div className="px-4 mb-4">
              <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-text-muted opacity-50 whitespace-nowrap">Main Menu</span>
            </div>
          )}
          
          {navItems.map((item) => {
            const active = isSelected(item.path)
            return (
              <Link 
                key={item.path}
                to={item.path} 
                className={clsx(
                  'flex items-center rounded-premium transition-all duration-300 group mb-1.5 relative',
                  sidebarCollapsed ? 'px-0 justify-center h-12 w-12 mx-auto' : 'px-4 py-3.5',
                  active 
                    ? 'bg-primary-bg text-primary font-bold shadow-sm shadow-primary/5' 
                    : 'text-text-muted hover:bg-surface-hover hover:text-text-h',
                  !sidebarCollapsed && active && 'translate-x-1'
                )}
                onClick={() => { if (window.innerWidth < 1024) setSidebarOpen(false) }}
              >
                <item.icon className={clsx(
                  'w-5 h-5 transition-colors shrink-0',
                  active ? 'text-primary' : 'text-text-muted group-hover:text-text-h',
                  !sidebarCollapsed && 'mr-3'
                )} />
                
                {!sidebarCollapsed && (
                  <span className="whitespace-nowrap animate-in fade-in slide-in-from-left-2 duration-300">
                    {item.label}
                  </span>
                )}

                {/* Tooltip for collapsed mode */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-3 px-2 py-1 bg-text-h text-surface text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap shadow-xl">
                    {item.label}
                  </div>
                )}
              </Link>
            )
          })}
        </div>
        
        {/* Footer Section */}
        <div className={clsx(
          'px-4 py-6 space-y-6 transition-all duration-300',
          sidebarCollapsed && 'px-2 items-center flex flex-col'
        )}>
          {/* Theme Switcher */}
          <div className={clsx(
            'bg-background/50 border border-border-default rounded-premium-lg p-1 flex shadow-sm',
            sidebarCollapsed ? 'flex-col gap-1 w-10' : 'items-center gap-1 w-full'
          )}>
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={clsx(
                  'flex items-center justify-center rounded-premium transition-all duration-300 relative group',
                  sidebarCollapsed ? 'w-8 h-8' : 'flex-1 py-2',
                  theme === t.id 
                    ? 'bg-surface text-primary shadow-sm border border-border-default/50' 
                    : 'text-text-muted hover:text-text-h hover:bg-surface/50'
                )}
                title={t.label}
                aria-label={`Switch to ${t.label} mode`}
              >
                <t.icon className={clsx(
                  'w-4 h-4 transition-transform group-hover:scale-110',
                  theme === t.id ? 'stroke-[2.5px]' : 'stroke-2'
                )} />
                {!sidebarCollapsed && theme === t.id && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* User Profile */}
          <div className={clsx(
            'border-t border-border-default pt-6 w-full',
            sidebarCollapsed ? 'flex justify-center' : ''
          )}>
            <div className={clsx(
              'flex items-center rounded-premium-lg transition-colors group relative',
              sidebarCollapsed ? 'justify-center' : 'justify-between p-2 hover:bg-surface-hover'
            )}>
              <div className="flex items-center overflow-hidden">
                <Avatar 
                  name={user?.full_name || user?.first_name || ''} 
                  size={sidebarCollapsed ? "sm" : "sm"} 
                  className="border-2 border-background shrink-0" 
                />
                {!sidebarCollapsed && (
                  <div className="ml-3 overflow-hidden animate-in fade-in slide-in-from-left-2 duration-300">
                    <p className="text-sm font-semibold text-text-h truncate leading-tight">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-[11px] text-text-muted truncate mt-0.5">{user?.email}</p>
                  </div>
                )}
              </div>
              
              {!sidebarCollapsed && (
                <button 
                  onClick={handleLogout}
                  className="p-1.5 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-premium-sm transition-all focus:outline-none"
                  title="Log out"
                  aria-label="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}

              {/* Tooltip/Logout for collapsed mode */}
              {sidebarCollapsed && (
                <button
                  onClick={handleLogout}
                  className="absolute left-full ml-3 px-2 py-1 bg-red-500 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap"
                >
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


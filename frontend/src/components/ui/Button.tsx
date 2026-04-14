import { type ButtonHTMLAttributes } from 'react'
import { clsx } from 'clsx'
import { Spinner } from './Spinner'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'destructive' | 'secondary'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  loading?: boolean
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  loading, 
  disabled, 
  className = '', 
  children, 
  ...props 
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.97] select-none whitespace-nowrap'
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-hover shadow-sm hover:shadow-md',
    secondary: 'bg-surface text-text-main border border-border-default hover:bg-surface-hover hover:border-border-strong',
    outline: 'border border-border-default text-text-h hover:bg-surface hover:border-border-strong',
    ghost: 'text-text-muted hover:bg-surface hover:text-text-h',
    destructive: 'bg-error text-white hover:opacity-90 shadow-sm',
  }

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-9 px-4 text-[13px]',
    lg: 'h-10 px-6 text-sm',
    icon: 'h-9 w-9 p-0',
  }

  return (
    <button 
      disabled={disabled || loading} 
      className={clsx(base, variants[variant], sizes[size], className)} 
      {...props}
    >
      {loading ? (
        <Spinner size="sm" className="mr-2" />
      ) : null}
      <span className={clsx('flex items-center gap-1.5', loading && 'opacity-70')}>
        {children}
      </span>
    </button>
  )
}

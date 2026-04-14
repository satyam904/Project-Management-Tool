import React from 'react'
import { clsx } from 'clsx'

export function Card({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick} 
      className={clsx(
        'bg-background border border-border-default rounded-premium-lg p-5 shadow-sm transition-all duration-200',
        onClick && 'cursor-pointer hover:shadow-premium hover:border-border-strong active:scale-[0.99]',
        className
      )}
    >
      {children}
    </div>
  )
}

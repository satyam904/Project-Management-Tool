import React from 'react'
import { clsx } from 'clsx'

export type BadgeVariant = 'active' | 'completed' | 'todo' | 'in-progress' | 'done' | 'low' | 'medium' | 'high' | 'owner' | 'editor' | 'viewer'

export function Badge({ variant, children, className }: { variant: string; children?: React.ReactNode; className?: string }) {
  const map: Record<string, string> = {
    active: 'bg-success-bg text-success border-success/20',
    completed: 'bg-surface text-text-muted border-border-default',
    todo: 'bg-surface text-text-muted border-border-default',
    'in-progress': 'bg-primary-bg text-primary border-primary/20',
    done: 'bg-success-bg text-success border-success/20',
    low: 'bg-surface text-text-muted border-border-default',
    medium: 'bg-warning-bg text-warning border-warning/20',
    high: 'bg-error-bg text-error border-error/20',
    owner: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    editor: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    viewer: 'bg-surface text-text-muted border-border-default',
  }
  
  return (
    <span className={clsx(
      'inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wider transition-all duration-300',
      map[variant] || 'bg-surface text-text-muted border-border-default',
      className
    )}>
      {children || variant}
    </span>
  )
}

import type { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string
}

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div 
      className={clsx(
        'animate-pulse bg-surface-hover rounded-lg border border-border-default/50',
        className
      )} 
      {...props} 
    />
  )
}

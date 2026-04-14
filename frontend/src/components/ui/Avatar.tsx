import { clsx } from 'clsx'

interface AvatarProps {
  name: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Avatar({ name, size = 'md', className }: AvatarProps) {
  const char = name ? name.charAt(0).toUpperCase() : '?'
  
  // Use a deterministic background color based on the name from our designer palette
  const colors = [
    'bg-primary/20 text-primary',
    'bg-success/20 text-success',
    'bg-error/20 text-error',
    'bg-warning/20 text-warning',
    'bg-purple-500/20 text-purple-500',
    'bg-pink-500/20 text-pink-500',
    'bg-cyan-500/20 text-cyan-500',
    'bg-orange-500/20 text-orange-500',
  ]
  const colorIndex = name ? name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % colors.length : 0
  const bgClass = colors[colorIndex]
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-[10px]',
    md: 'w-10 h-10 text-xs',
    lg: 'w-12 h-12 text-sm',
  }

  return (
    <div className={clsx(
      'inline-flex items-center justify-center rounded-full font-bold select-none border border-background/50 flex-shrink-0',
      sizeClasses[size],
      bgClass,
      className
    )}>
      {char}
    </div>
  )
}

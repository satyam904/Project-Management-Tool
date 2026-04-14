import React from 'react'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ open, onClose, title, children, maxWidth = 'md' }: ModalProps) {
  if (!open) return null
  
  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" 
        onClick={onClose}
      />
      <div className={clsx(
        'relative z-10 w-full bg-background border border-border-default rounded-xl shadow-xl max-h-[90vh] overflow-y-auto animate-slide-up',
        widthClasses[maxWidth]
      )}>
        <div className="flex justify-between items-center px-6 py-4 border-b border-border-default sticky top-0 bg-background/95 backdrop-blur-sm z-10">
          <h2 className="font-display text-lg font-bold text-text-h">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-text-muted hover:text-text-h hover:bg-surface rounded-lg p-1.5 transition-all"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  )
}

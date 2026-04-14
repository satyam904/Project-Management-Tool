import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  rows?: number
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(({ label, error, rows = 3, className = '', ...props }, ref) => {
  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label htmlFor={props.id || props.name} className="block text-[13px] font-semibold text-text-muted mb-1.5 ml-0.5">
          {label}
        </label>
      )}
      <div className="relative group">
        <textarea
          ref={ref}
          rows={rows}
          className={clsx(
            'w-full bg-background border rounded-lg px-3.5 py-3 text-sm transition-all duration-200 min-h-[100px]',
            'placeholder:text-text-muted/40 focus:outline-none focus:ring-2 resize-y',
            error 
              ? 'border-error ring-error/10 text-error' 
              : 'border-border-default focus:border-primary focus:ring-primary/10 text-text-main group-hover:border-border-strong'
          )}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-[11px] font-medium text-error ml-1">
          {error}
        </p>
      )}
    </div>
  )
})
Textarea.displayName = 'Textarea'

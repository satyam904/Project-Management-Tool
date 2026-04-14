import { forwardRef, type InputHTMLAttributes, useId } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', id, ...props }, ref) => {
  const backupId = useId()
  const inputId = id || props.name || backupId

  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label htmlFor={inputId} className="block text-[13px] font-semibold text-text-muted mb-1.5 ml-0.5">
          {label}
        </label>
      )}
      <div className="relative group">
        <input
          id={inputId}
          ref={ref}
          className={clsx(
            'w-full bg-background border rounded-lg px-3.5 py-2.5 text-sm transition-all duration-200',
            'placeholder:text-text-muted/40 focus:outline-none focus:ring-2',
            error 
              ? 'border-error ring-error/10 text-error' 
              : 'border-border-default focus:border-primary focus:ring-primary/10 text-text-main group-hover:border-border-strong'
          )}
          {...props}
        />
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-error">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-[11px] font-medium text-error ml-1">
          {error}
        </p>
      )}
    </div>
  )
})
Input.displayName = 'Input'

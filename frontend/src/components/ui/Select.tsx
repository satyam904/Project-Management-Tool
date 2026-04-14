import { forwardRef, type SelectHTMLAttributes } from 'react'
import { clsx } from 'clsx'
import { ChevronDown } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Option[]
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, options, className = '', ...props }, ref) => {
  return (
    <div className={clsx('w-full', className)}>
      {label && (
        <label htmlFor={props.id || props.name} className="block text-[13px] font-semibold text-text-muted mb-1.5 ml-0.5">
          {label}
        </label>
      )}
      <div className="relative group">
        <select
          ref={ref}
          className={clsx(
            'w-full bg-background border rounded-lg px-3.5 py-2.5 text-sm transition-all duration-200 appearance-none cursor-pointer',
            'focus:outline-none focus:ring-2',
            error 
              ? 'border-error ring-error/10 text-error' 
              : 'border-border-default focus:border-primary focus:ring-primary/10 text-text-main group-hover:border-border-strong'
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted/50 group-hover:text-text-muted transition-colors">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-[11px] font-medium text-error ml-1">
          {error}
        </p>
      )}
    </div>
  )
})
Select.displayName = 'Select'

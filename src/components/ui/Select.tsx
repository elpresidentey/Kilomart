import { cn } from '../../lib/utils'
import type { SelectHTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: ReactNode
  error?: string
  helperText?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            'select block w-full py-2.5 pl-3.5 pr-9 border border-stone-300 rounded-xl bg-white shadow-soft text-sm',
            'hover:border-stone-400',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/70 focus-visible:border-transparent',
            'motion-safe:transition-all motion-safe:duration-200',
            'disabled:bg-stone-50 disabled:text-stone-500 disabled:cursor-not-allowed',
            error && 'border-red-500 hover:border-red-500 focus:ring-red-500/70',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </p>
        )}
        {helperText && !error && (
          <p className="mt-1 text-sm text-stone-500">{helperText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }
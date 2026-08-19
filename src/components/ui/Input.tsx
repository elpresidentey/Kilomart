import { cn } from '../../lib/utils'
import type { InputHTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: ReactNode
  error?: string
  helperText?: string
  /** Optional icon rendered inside the left edge of the field */
  icon?: ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, icon, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-stone-400">
              {icon}
            </span>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              'block w-full px-3.5 py-2.5 rounded-xl text-sm bg-white',
              'border border-stone-300 shadow-soft',
              'placeholder:text-stone-400',
              'hover:border-stone-400',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/70 focus-visible:border-transparent',
              'motion-safe:transition-all motion-safe:duration-200',
              'disabled:bg-stone-50 disabled:text-stone-500 disabled:cursor-not-allowed',
              icon && 'pl-10',
              error && 'border-red-500 hover:border-red-500 focus:ring-red-500/70',
              className
            )}
            {...props}
          />
        </div>
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

Input.displayName = 'Input'

export { Input }

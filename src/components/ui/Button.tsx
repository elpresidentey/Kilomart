import { cn } from '../../lib/utils'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'
import { useI18n } from '../../i18n/useI18n'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  children: ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const { t } = useI18n()
    const variants: Record<string, string> = {
      primary:
        'bg-primary-700 text-white hover:bg-primary-800 focus-visible:ring-primary-500 shadow-sm hover:shadow-md motion-safe:hover:-translate-y-px',
      secondary: 'bg-earth-100 text-earth-900 hover:bg-earth-200 focus-visible:ring-earth-500',
      outline:
        'border-2 border-stone-300 bg-transparent hover:bg-stone-50 text-stone-700 focus-visible:ring-stone-500 motion-safe:hover:border-stone-400',
      ghost: 'bg-transparent hover:bg-stone-100 text-stone-700 focus-visible:ring-stone-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm hover:shadow',
    }

    const sizes: Record<string, string> = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    }

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-lg font-medium tap-highlight-none',
          'motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'motion-safe:active:scale-[0.98]',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
          variants[variant],
          sizes[size],
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {t('button.loading')}
          </>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }

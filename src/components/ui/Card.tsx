import { cn } from '../../lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Lift + shadow on hover (listings, clickable cards) */
  interactive?: boolean
  children: ReactNode
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, padding = 'md', interactive, children, ...props }, ref) => {
    const paddings: Record<string, string> = {
      none: '',
      sm: 'p-3',
      md: 'p-4 sm:p-6',
      lg: 'p-6 sm:p-8',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'bg-white rounded-xl shadow-sm border border-stone-100',
          'motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out',
          interactive &&
            'hover:shadow-lg hover:border-stone-200/90 motion-safe:hover:-translate-y-1 cursor-default',
          paddings[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export { Card }

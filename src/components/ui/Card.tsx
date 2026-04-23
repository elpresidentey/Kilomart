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
          'group bg-white rounded-xl shadow-sm border border-stone-100',
          'transform-gpu will-change-transform',
          'motion-safe:transition-[transform,box-shadow,border-color] motion-safe:duration-200 motion-safe:ease-out',
          interactive &&
            'hover:-translate-y-0.5 hover:shadow-md hover:border-stone-200/90 focus-within:-translate-y-0.5 focus-within:shadow-md focus-within:border-stone-200/90 cursor-default',
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

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
          'group relative overflow-hidden bg-white rounded-2xl shadow-card border border-stone-100',
          'transform-gpu will-change-transform',
          'motion-safe:transition-[transform,box-shadow,border-color,background-color] motion-safe:duration-300 motion-safe:ease-out',
          'motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-[0_22px_60px_-12px_rgba(12,89,65,0.16)] motion-safe:hover:border-primary-200/80',
          'motion-safe:active:scale-[0.995] motion-safe:focus-within:-translate-y-1 motion-safe:focus-within:shadow-[0_22px_60px_-12px_rgba(12,89,65,0.16)]',
          interactive &&
            'cursor-default',
          paddings[padding],
          className
        )}
        {...props}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-300/70 to-transparent opacity-0 transition-opacity duration-300 motion-safe:group-hover:opacity-100" />
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export { Card }

import { cn } from '../../lib/utils'
import type { HTMLAttributes, ReactNode } from 'react'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  size?: 'sm' | 'md'
  /** Renders a small status dot before the label */
  dot?: boolean
  children: ReactNode
}

export function Badge({ className, variant = 'default', size = 'sm', dot, children, ...props }: BadgeProps) {
  const variants: Record<string, string> = {
    default: 'bg-stone-100 text-stone-700 ring-stone-500/10',
    success: 'bg-primary-100 text-primary-800 ring-primary-600/10',
    warning: 'bg-amber-100 text-amber-800 ring-amber-600/10',
    error: 'bg-red-100 text-red-700 ring-red-600/10',
    info: 'bg-blue-100 text-blue-700 ring-blue-600/10',
  }

  const dotColors: Record<string, string> = {
    default: 'bg-stone-400',
    success: 'bg-primary-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }

  const sizes: Record<string, string> = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full ring-1 ring-inset',
        'motion-safe:transition-[transform,box-shadow] motion-safe:duration-200',
        'shadow-sm',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-60 motion-safe:animate-ping motion-reduce:animate-none', dotColors[variant])} />
          <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', dotColors[variant])} />
        </span>
      )}
      {children}
    </span>
  )
}

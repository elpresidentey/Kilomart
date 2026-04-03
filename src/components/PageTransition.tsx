import type { ReactNode } from 'react'

/** Wraps routed page content; parent should set `key={location.pathname}` on this component for route transitions. */
export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <div className="motion-safe:animate-page-enter motion-reduce:animate-none min-h-[2rem]">
      {children}
    </div>
  )
}

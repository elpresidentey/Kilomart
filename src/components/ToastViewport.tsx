import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react'
import { useEffect } from 'react'
import { useToastStore, type Toast } from '../stores/toastStore'
import { cn } from '../lib/utils'

const iconByType = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
} as const

const toneByType = {
  success: {
    wrapper: 'border-emerald-200 bg-emerald-50 text-emerald-900 shadow-emerald-950/5',
    icon: 'text-emerald-600',
  },
  error: {
    wrapper: 'border-rose-200 bg-rose-50 text-rose-900 shadow-rose-950/5',
    icon: 'text-rose-600',
  },
  info: {
    wrapper: 'border-sky-200 bg-sky-50 text-sky-900 shadow-sky-950/5',
    icon: 'text-sky-600',
  },
} satisfies Record<
  Toast['type'],
  {
    wrapper: string
    icon: string
  }
>

export function ToastViewport() {
  const toasts = useToastStore((state) => state.toasts)
  const dismissToast = useToastStore((state) => state.dismissToast)

  useEffect(() => {
    return () => {
      useToastStore.getState().clearToasts()
    }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div
      aria-live="polite"
      aria-relevant="additions removals"
      className="pointer-events-none fixed right-0 top-0 z-[100] flex w-full flex-col gap-3 p-4 sm:right-4 sm:top-4 sm:w-auto sm:max-w-sm sm:p-0"
    >
      {toasts.map((toast) => {
        const Icon = iconByType[toast.type]
        const tone = toneByType[toast.type]

        return (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur',
              'motion-safe:animate-fade-in-up motion-reduce:animate-none',
              tone.wrapper,
            )}
          >
            <div className={cn('mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/70', tone.icon)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              {toast.title && <p className="text-sm font-semibold leading-5">{toast.title}</p>}
              <p className={cn('text-sm leading-5', toast.title ? 'mt-0.5' : 'font-medium')}>{toast.message}</p>
            </div>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="rounded-full p-1 text-current/60 transition-colors hover:bg-black/5 hover:text-current"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )
      })}
    </div>
  )
}

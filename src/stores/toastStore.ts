import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'info'

export type Toast = {
  id: string
  type: ToastType
  title?: string
  message: string
}

type ToastInput = Omit<Toast, 'id'>

type ToastStore = {
  toasts: Toast[]
  pushToast: (toast: ToastInput) => string
  dismissToast: (id: string) => void
  clearToasts: () => void
  success: (message: string, title?: string) => string
  error: (message: string, title?: string) => string
  info: (message: string, title?: string) => string
}

const activeTimers = new Map<string, number>()
const DEFAULT_DURATION = 4500

function scheduleDismiss(id: string, dismissToast: (id: string) => void, durationMs: number) {
  if (typeof window === 'undefined') return

  const existingTimer = activeTimers.get(id)
  if (existingTimer) {
    window.clearTimeout(existingTimer)
  }

  const timer = window.setTimeout(() => {
    activeTimers.delete(id)
    dismissToast(id)
  }, durationMs)

  activeTimers.set(id, timer)
}

function createToastId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  pushToast: (toast) => {
    const id = createToastId()
    set((state) => ({ toasts: [...state.toasts, { id, ...toast }] }))
    scheduleDismiss(id, get().dismissToast, DEFAULT_DURATION)
    return id
  },
  dismissToast: (id) => {
    const existingTimer = activeTimers.get(id)
    if (existingTimer && typeof window !== 'undefined') {
      window.clearTimeout(existingTimer)
    }
    activeTimers.delete(id)
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }))
  },
  clearToasts: () => {
    if (typeof window !== 'undefined') {
      activeTimers.forEach((timer) => window.clearTimeout(timer))
    }
    activeTimers.clear()
    set({ toasts: [] })
  },
  success: (message, title = 'Success') =>
    get().pushToast({ type: 'success', title, message }),
  error: (message, title = 'Something went wrong') =>
    get().pushToast({ type: 'error', title, message }),
  info: (message, title = 'Note') =>
    get().pushToast({ type: 'info', title, message }),
}))

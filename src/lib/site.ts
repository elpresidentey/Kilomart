const FALLBACK_PROD_SITE_URL = 'https://kilomart.vercel.app'

export function getSiteUrl(): string {
  const override = import.meta.env.VITE_SITE_URL?.trim() || ''

  if (override) return override.replace(/\/$/, '')

  if (import.meta.env.PROD) return FALLBACK_PROD_SITE_URL

  if (typeof window !== 'undefined') return window.location.origin.replace(/\/$/, '')

  return 'http://localhost:5173'
}

export function toAbsoluteUrl(path: string): string {
  return new URL(path, getSiteUrl()).toString()
}

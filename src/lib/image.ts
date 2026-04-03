import type { SyntheticEvent } from 'react'

const FALLBACK_SVG = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480"><rect width="640" height="480" fill="#f5f5f4"/><rect x="220" y="150" width="200" height="140" rx="14" fill="#e7e5e4"/><circle cx="290" cy="205" r="20" fill="#d6d3d1"/><path d="M240 270l60-55 40 35 30-25 30 45H240z" fill="#d6d3d1"/></svg>'
)

export const FALLBACK_IMAGE_SRC = `data:image/svg+xml;charset=utf-8,${FALLBACK_SVG}`

export function sanitizeImageUrl(value?: string | null): string | null {
  if (!value) return null
  const src = value.trim()
  if (!src) return null
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:') || src.startsWith('blob:')) {
    return src
  }
  if (src.startsWith('//')) return `https:${src}`
  if (src.startsWith('/')) return src
  return null
}

export function fallbackOnImageError(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget
  if (img.src === FALLBACK_IMAGE_SRC) return
  img.src = FALLBACK_IMAGE_SRC
}

import type { SyntheticEvent } from 'react'
import { LISTING_IMAGES_BUCKET } from './listingImages'

const FALLBACK_SVG = encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480"><rect width="640" height="480" fill="#f5f5f4"/><rect x="220" y="150" width="200" height="140" rx="14" fill="#e7e5e4"/><circle cx="290" cy="205" r="20" fill="#d6d3d1"/><path d="M240 270l60-55 40 35 30-25 30 45H240z" fill="#d6d3d1"/></svg>'
)

export const FALLBACK_IMAGE_SRC = `data:image/svg+xml;charset=utf-8,${FALLBACK_SVG}`
const SNAIL_FALLBACK_PAGE_URL =
  'https://unsplash.com/photos/a-snail-on-a-log-ElmnzS9nS34'
const BEEF_FALLBACK_PAGE_URL =
  'https://unsplash.com/photos/two-steaks-on-a-plate-with-parsley-U5lLwx17rWs'
const BUSH_MEAT_FALLBACK_PAGE_URL =
  'https://unsplash.com/photos/meat-and-sausages-grilling-on-a-barbecue-nzd6gTdAxUY'
const BEANS_FALLBACK_IMAGE_SRC = '/images/listings/beans.jpg'
const PLANTAIN_FALLBACK_IMAGE_SRC = '/images/listings/ripe-sweet-plantains.jpg'
const POINT_OF_LAY_HENS_FALLBACK_IMAGE_SRC = '/images/listings/point-of-lay-hens.jpg'
const YAM_TUBERS_FALLBACK_IMAGE_SRC = '/images/listings/yam-tubers.jpg'
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''

function buildSupabasePublicImageUrl(path: string): string | null {
  if (!SUPABASE_URL) return null

  const normalized = path
    .trim()
    .replace(/^\/+/, '')
    .replace(/^storage\/v1\/object\/public\//, '')
    .replace(new RegExp(`^${LISTING_IMAGES_BUCKET}/`), '')

  if (!normalized) return null

  const encodedPath = normalized
    .split('/')
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join('/')

  return `${SUPABASE_URL}/storage/v1/object/public/${LISTING_IMAGES_BUCKET}/${encodedPath}`
}

function normalizeUnsplashUrl(src: string): string {
  try {
    const url = new URL(src)
    const host = url.hostname.replace(/^www\./, '')
    if (host !== 'unsplash.com') return src

    const match = url.pathname.match(/^\/photos\/[^/]+-([A-Za-z0-9_-]+)\/?$/)
    if (!match) return src

    const photoId = match[1]
    return `https://unsplash.com/photos/${photoId}/download?force=true&w=1200`
  } catch {
    return src
  }
}

export function sanitizeImageUrl(value?: string | null): string | null {
  if (!value) return null
  const raw = value.trim()
  if (!raw) return null

  if (
    !raw.startsWith('http://') &&
    !raw.startsWith('https://') &&
    !raw.startsWith('data:') &&
    !raw.startsWith('blob:') &&
    !raw.startsWith('//') &&
    !raw.startsWith('/')
  ) {
    return buildSupabasePublicImageUrl(raw)
  }

  const src = normalizeUnsplashUrl(raw)
  if (!src) return null
  if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:') || src.startsWith('blob:')) {
    if (SUPABASE_URL && src.startsWith(`${SUPABASE_URL}/storage/v1/object/public/`)) {
      try {
        const url = new URL(src)
        const marker = `/storage/v1/object/public/${LISTING_IMAGES_BUCKET}/`
        const bucketPathIndex = url.pathname.indexOf(marker)
        if (bucketPathIndex >= 0) {
          const objectPath = decodeURIComponent(url.pathname.slice(bucketPathIndex + marker.length))
          return buildSupabasePublicImageUrl(objectPath) ?? src
        }
      } catch {
        return src
      }
    }
    return src
  }
  if (src.startsWith('//')) return `https:${src}`
  if (src.startsWith('/')) return src
  return null
}

export function getProductImageSrc(image?: string | null, productName?: string | null): string {
  const explicit = sanitizeImageUrl(image)
  if (explicit) return explicit

  const name = (productName || '').trim().toLowerCase()
  if (name.includes('snail') || name.includes('escargot')) {
    return sanitizeImageUrl(SNAIL_FALLBACK_PAGE_URL) ?? FALLBACK_IMAGE_SRC
  }
  if (
    name.includes('beef') ||
    name.includes('cow meat') ||
    name.includes('steak') ||
    name.includes('red meat')
  ) {
    return sanitizeImageUrl(BEEF_FALLBACK_PAGE_URL) ?? FALLBACK_IMAGE_SRC
  }
  if (
    name.includes('bean') ||
    name.includes('cowpea') ||
    name.includes('oloyin') ||
    name.includes('olofi') ||
    name.includes('black-eyed') ||
    name.includes('black eyed')
  ) {
    return sanitizeImageUrl(BEANS_FALLBACK_IMAGE_SRC) ?? FALLBACK_IMAGE_SRC
  }
  if (
    name.includes('bush meat') ||
    name.includes('bushmeat') ||
    name.includes('grasscutter') ||
    name.includes('grass cutter') ||
    name.includes('wild meat') ||
    name.includes('game meat')
  ) {
    return sanitizeImageUrl(BUSH_MEAT_FALLBACK_PAGE_URL) ?? FALLBACK_IMAGE_SRC
  }
  if (name.includes('plantain') || name.includes('plantains')) {
    return sanitizeImageUrl(PLANTAIN_FALLBACK_IMAGE_SRC) ?? FALLBACK_IMAGE_SRC
  }
  if (
    name.includes('point of lay') ||
    name.includes('point-of-lay') ||
    name.includes('laying hens') ||
    name.includes('point of lay hens')
  ) {
    return sanitizeImageUrl(POINT_OF_LAY_HENS_FALLBACK_IMAGE_SRC) ?? FALLBACK_IMAGE_SRC
  }
  if (name.includes('yam') && !name.includes('flour')) {
    return sanitizeImageUrl(YAM_TUBERS_FALLBACK_IMAGE_SRC) ?? FALLBACK_IMAGE_SRC
  }

  return FALLBACK_IMAGE_SRC
}

export function fallbackOnImageError(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget
  if (img.src === FALLBACK_IMAGE_SRC) return
  img.src = FALLBACK_IMAGE_SRC
}

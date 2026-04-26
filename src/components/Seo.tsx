import { useEffect } from 'react'
import { getSiteUrl, toAbsoluteUrl } from '../lib/site'

type JsonLdValue = Record<string, unknown> | Array<Record<string, unknown>>

interface SeoProps {
  title: string
  description: string
  canonicalPath?: string
  noindex?: boolean
  image?: string
  type?: 'website' | 'article' | 'product'
  jsonLd?: JsonLdValue
}

const SITE_NAME = 'Farmers Market'
const MANAGED_ATTR = 'data-seo-managed'

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  const selector = `meta[${attribute}="${key}"]`
  let tag = document.head.querySelector(selector) as HTMLMetaElement | null

  if (!tag) {
    tag = document.createElement('meta')
    tag.setAttribute(attribute, key)
    document.head.appendChild(tag)
  }

  tag.setAttribute(MANAGED_ATTR, 'true')
  tag.content = content
}

function upsertCanonical(url: string) {
  const selector = `link[rel="canonical"]`
  let tag = document.head.querySelector(selector) as HTMLLinkElement | null

  if (!tag) {
    tag = document.createElement('link')
    tag.rel = 'canonical'
    document.head.appendChild(tag)
  }

  tag.setAttribute(MANAGED_ATTR, 'true')
  tag.href = url
}

function upsertJsonLd(jsonLd: JsonLdValue | undefined) {
  const existing = document.getElementById('seo-json-ld')

  if (!jsonLd) {
    existing?.remove()
    return
  }

  const script =
    existing instanceof HTMLScriptElement
      ? existing
      : (() => {
          const next = document.createElement('script')
          next.id = 'seo-json-ld'
          next.type = 'application/ld+json'
          next.setAttribute(MANAGED_ATTR, 'true')
          document.head.appendChild(next)
          return next
        })()

  script.textContent = JSON.stringify(jsonLd)
}

export function Seo({
  title,
  description,
  canonicalPath,
  noindex = false,
  image = '/logo-farmers-market.png',
  type = 'website',
  jsonLd,
}: SeoProps) {
  useEffect(() => {
    const siteUrl = getSiteUrl()
    const resolvedTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME
    const canonicalUrl = toAbsoluteUrl(canonicalPath || '/')
    const imageUrl = image.startsWith('http') ? image : new URL(image, siteUrl).toString()

    document.title = resolvedTitle

    upsertMeta('name', 'description', description)
    upsertMeta('name', 'robots', noindex ? 'noindex,nofollow' : 'index,follow')
    upsertMeta('name', 'theme-color', '#2D5A27')
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:url', canonicalUrl)
    upsertMeta('property', 'og:title', resolvedTitle)
    upsertMeta('property', 'og:description', description)
    upsertMeta('property', 'og:image', imageUrl)
    upsertMeta('name', 'twitter:card', 'summary_large_image')
    upsertMeta('name', 'twitter:title', resolvedTitle)
    upsertMeta('name', 'twitter:description', description)
    upsertMeta('name', 'twitter:image', imageUrl)
    upsertCanonical(canonicalUrl)
    upsertJsonLd(jsonLd)
  }, [canonicalPath, description, image, jsonLd, noindex, title, type])

  return null
}

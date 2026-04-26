type ListingRow = {
  id: string
  updated_at?: string
}

function getEnv(name: string): string | undefined {
  return (globalThis as any)?.process?.env?.[name]
}

function getSiteUrl(): string {
  const override = getEnv('SITE_URL') || getEnv('VITE_SITE_URL')
  if (override) return override.replace(/\/$/, '')
  return 'https://kilomart.vercel.app'
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function formatLastMod(value?: string) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.status(405).send('Method not allowed')
    return
  }

  const siteUrl = getSiteUrl()
  const supabaseUrl = getEnv('SUPABASE_URL') || getEnv('VITE_SUPABASE_URL')
  const supabaseKey =
    getEnv('SUPABASE_ANON_KEY') ||
    getEnv('SUPABASE_SERVICE_ROLE_KEY') ||
    getEnv('VITE_SUPABASE_ANON_KEY')

  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/marketplace', priority: '0.9', changefreq: 'daily' },
    { loc: '/about', priority: '0.6', changefreq: 'monthly' },
    { loc: '/help', priority: '0.6', changefreq: 'monthly' },
    { loc: '/contact', priority: '0.6', changefreq: 'monthly' },
    { loc: '/careers', priority: '0.5', changefreq: 'monthly' },
    { loc: '/press', priority: '0.5', changefreq: 'monthly' },
    { loc: '/partners', priority: '0.5', changefreq: 'monthly' },
    { loc: '/legal/terms', priority: '0.3', changefreq: 'yearly' },
    { loc: '/legal/privacy', priority: '0.3', changefreq: 'yearly' },
    { loc: '/legal/cookies', priority: '0.3', changefreq: 'yearly' },
    { loc: '/legal/safety', priority: '0.3', changefreq: 'yearly' },
  ]

  let listings: ListingRow[] = []
  if (supabaseUrl && supabaseKey) {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/produce_listings?status=eq.active&select=id,updated_at&order=updated_at.desc`,
        {
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            Apikey: supabaseKey,
          },
        }
      )

      if (response.ok) {
        const data = (await response.json()) as ListingRow[]
        if (Array.isArray(data)) listings = data
      }
    } catch (error) {
      console.warn('Sitemap listing fetch failed:', error)
    }
  }

  const urls = [
    ...staticPages,
    ...listings.map((listing) => ({
      loc: `/listing/${listing.id}`,
      priority: '0.8',
      changefreq: 'weekly',
      lastmod: formatLastMod(listing.updated_at),
    })),
  ]

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((entry) => {
    const parts = [
      `  <url>`,
      `    <loc>${escapeXml(`${siteUrl}${entry.loc}`)}</loc>`,
      entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>` : null,
      `    <changefreq>${entry.changefreq}</changefreq>`,
      `    <priority>${entry.priority}</priority>`,
      `  </url>`,
    ].filter(Boolean)
    return parts.join('\n')
  })
  .join('\n')}
</urlset>`

  res.setHeader('Content-Type', 'application/xml; charset=utf-8')
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
  res.status(200).send(body)
}

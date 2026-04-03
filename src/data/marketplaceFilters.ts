/**
 * Marketplace filter chips — align with `categories.name` in Supabase where applicable.
 * (Schema: Rice, Beans, Maize, Cassava, Yam, Plantain, Vegetables, Fruits, Poultry,
 * Livestock, Grains, Oil Seeds — no Seafood.)
 */
export const MARKETPLACE_PRODUCT_FILTERS = [
  'All Products',
  'Rice',
  'Beans',
  'Maize',
  'Cassava',
  'Yam',
  'Plantain',
  'Vegetables',
  'Fruits',
  'Poultry',
  'Livestock',
  'Grains',
  'Oil Seeds',
] as const

export type MarketplaceProductFilter = (typeof MARKETPLACE_PRODUCT_FILTERS)[number]

/** Quick links on buyer dashboard & footer (subset of filters). */
export const POPULAR_CATEGORY_LINKS: MarketplaceProductFilter[] = [
  'Rice',
  'Beans',
  'Vegetables',
  'Yam',
  'Plantain',
  'Fruits',
  'Oil Seeds',
]

/** Map `?category=` from URL to a filter label (case-insensitive, hyphen-friendly). */
export function parseCategorySearchParam(raw: string | null): string | null {
  if (!raw) return null
  const decoded = decodeURIComponent(raw).trim()
  const compact = (s: string) => s.toLowerCase().replace(/[\s-]+/g, '')
  const target = compact(decoded)
  const found = MARKETPLACE_PRODUCT_FILTERS.find((f) => compact(f) === target)
  if (found) return found
  const aliases: Record<string, MarketplaceProductFilter> = {
    oilseed: 'Oil Seeds',
    oilseeds: 'Oil Seeds',
    legume: 'Beans',
    legumes: 'Beans',
    veg: 'Vegetables',
    vegetable: 'Vegetables',
  }
  return aliases[target] ?? null
}

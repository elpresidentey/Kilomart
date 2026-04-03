import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { ProduceCard } from '../components/ProduceCard'
import { Input, Button, Badge } from '../components/ui'
import { supabase } from '../lib/supabase'
import type { ProduceListing, CartItem } from '../types'
import { Search, Filter, MapPin, SlidersHorizontal, ShoppingCart } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  MARKETPLACE_PRODUCT_FILTERS,
  parseCategorySearchParam,
} from '../data/marketplaceFilters'

const LOCATIONS = [
  'All Locations',
  'Lagos',
  'Ibadan',
  'Abeokuta',
  'Ilorin',
  'Akure',
  'Osogbo',
]

const QUALITY_GRADES = [
  { value: 'all', label: 'All Grades' },
  { value: 'A', label: 'Grade A - Premium' },
  { value: 'B', label: 'Grade B - Standard' },
  { value: 'C', label: 'Grade C - Fair' },
]

interface MarketplaceProps {
  cart: CartItem[]
  onAddToCart: (item: CartItem) => void
  cartItemCount: number
}

export function Marketplace({ cart: _cart, onAddToCart, cartItemCount }: MarketplaceProps) {
  void _cart // reference to avoid unused warning
  const [searchParams] = useSearchParams()
  const qFromUrl = searchParams.get('q') || ''
  const [loading, setLoading] = useState(true)
  const [listings, setListings] = useState<ProduceListing[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  void isLoadingCategories; void setIsLoadingCategories // reference to avoid unused warning
  const [searchQuery, setSearchQuery] = useState(qFromUrl)
  const [featuredProducts, setFeaturedProducts] = useState([])
  void featuredProducts; void setFeaturedProducts // reference to avoid unused warning
  const trustBadges: string[] = []
  void trustBadges // reference to avoid unused warning
  const [selectedProduct, setSelectedProduct] = useState('All Products')
  const [selectedLocation, setSelectedLocation] = useState('All Locations')
  const [selectedGrade, setSelectedGrade] = useState('all')
  const [showFilters, setShowFilters] = useState(false)

  const handleAddToCart = (listing: ProduceListing, quantity: number) => {
    onAddToCart({
      id: listing.id,
      name: listing.product_name,
      price: listing.price_per_kg,
      quantity: quantity,
      seller_id: listing.seller_id,
      image: listing.images?.[0]
    })
  }

  useEffect(() => {
    fetchListings()
  }, [])

  useEffect(() => {
    setSearchQuery(qFromUrl)
  }, [qFromUrl])

  const categoryFromUrl = parseCategorySearchParam(searchParams.get('category'))
  useEffect(() => {
    if (categoryFromUrl) setSelectedProduct(categoryFromUrl)
  }, [categoryFromUrl])

  async function fetchListings() {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('produce_listings')
        .select(`
          *,
          category:categories(name, slug)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        setListings([])
      } else {
        setListings(data || [])
      }
    } catch (err) {
      console.error('Error fetching listings:', err)
      setListings([])
    } finally {
      setLoading(false)
    }
  }

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.product_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
    const cat = listing.category?.name
    const matchesProduct =
      selectedProduct === 'All Products' ||
      (cat != null && cat === selectedProduct) ||
      listing.product_name.toLowerCase().includes(selectedProduct.toLowerCase())
    const matchesLocation =
      selectedLocation === 'All Locations' || listing.location === selectedLocation
    const matchesGrade =
      selectedGrade === 'all' || listing.quality_grade === selectedGrade

    return matchesSearch && matchesProduct && matchesLocation && matchesGrade
  })

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Marketplace</h1>
            <p className="text-stone-500">Browse fresh produce at fair prices</p>
          </div>
          <div className="flex items-center gap-2">
            {cartItemCount > 0 && (
              <Link to="/cart">
                <Button variant="secondary" className="relative">
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Cart
                  <Badge variant="default" size="sm" className="absolute -top-2 -right-2">
                    {cartItemCount}
                  </Badge>
                </Button>
              </Link>
            )}
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for rice, beans, vegetables..."
              className="pl-10"
            />
          </div>

          {/* Filters - Desktop always visible, Mobile toggleable */}
          <div className={`space-y-4 ${showFilters ? 'block' : 'hidden sm:block'}`}>
            {/* Product Categories */}
            <div className="flex flex-wrap gap-2">
              {MARKETPLACE_PRODUCT_FILTERS.map((product) => (
                <button
                  key={product}
                  onClick={() => setSelectedProduct(product)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    selectedProduct === product
                      ? 'bg-primary-100 text-primary-800'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {product}
                </button>
              ))}
            </div>

            {/* Location & Grade Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-stone-400" />
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-stone-400" />
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="px-3 py-2 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {QUALITY_GRADES.map((grade) => (
                    <option key={grade.value} value={grade.value}>
                      {grade.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 text-sm text-stone-500">
                <span>{filteredListings.length} listings found</span>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-stone-100 p-4 overflow-hidden relative"
              >
                <div className="bg-stone-200 h-40 rounded-lg mb-4 relative overflow-hidden">
                  <div className="absolute inset-0 w-full motion-safe:animate-shimmer motion-reduce:animate-none bg-gradient-to-r from-transparent via-white/60 to-transparent" />
                </div>
                <div className="bg-stone-200 h-6 rounded w-3/4 mb-2 motion-safe:animate-pulse" />
                <div className="bg-stone-200 h-8 rounded w-1/2 mb-3 motion-safe:animate-pulse" />
                <div className="bg-stone-200 h-4 rounded w-full motion-safe:animate-pulse" />
              </div>
            ))}
          </div>
        ) : filteredListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredListings.map((listing, i) => (
              <ProduceCard
                key={listing.id}
                listing={listing}
                listIndex={i}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-stone-100 mb-6">
              <Search className="w-10 h-10 text-stone-400" />
            </div>
            <h3 className="text-xl font-semibold text-stone-900 mb-2">
              No listings found
            </h3>
            <p className="text-stone-500 max-w-md mx-auto">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </Layout>
  )
}

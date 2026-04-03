import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Card, Button, Badge } from '../components/ui'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { ProduceListing } from '../types'
import { Plus, Package, MapPin, ExternalLink } from 'lucide-react'
import { fallbackOnImageError, sanitizeImageUrl, FALLBACK_IMAGE_SRC } from '../lib/image'

export function FarmerListings() {
  const { user } = useAuth()
  const [listings, setListings] = useState<ProduceListing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) return

    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('produce_listings')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        if (!cancelled) setListings(data || [])
      } catch (e) {
        console.error(e)
        if (!cancelled) setListings([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user?.id])

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n)

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">My listings</h1>
            <p className="text-stone-500">Manage produce you sell on the marketplace</p>
          </div>
          <Link to="/listings/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New listing
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-stone-100 animate-pulse h-40 bg-stone-100" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <Card className="text-center py-14" padding="lg">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-stone-900 mb-2">No listings yet</h2>
            <p className="text-stone-500 mb-6 max-w-md mx-auto">
              Create a listing so buyers can find your produce on the marketplace.
            </p>
            <Link to="/listings/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create listing
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <Card key={listing.id} padding="lg" className="flex flex-col">
                <div className="flex gap-3 mb-3">
                  <div className="w-16 h-16 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {listing.images?.[0] ? (
                      <img
                        src={sanitizeImageUrl(listing.images[0]) ?? FALLBACK_IMAGE_SRC}
                        alt=""
                        onError={fallbackOnImageError}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-8 h-8 text-stone-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/listing/${listing.id}`}
                      className="font-semibold text-stone-900 hover:text-emerald-700 line-clamp-2"
                    >
                      {listing.product_name}
                    </Link>
                    <div className="flex items-center gap-1 text-sm text-stone-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{listing.location}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-stone-100">
                  <div>
                    <p className="text-sm text-stone-500">Price / kg</p>
                    <p className="font-bold text-primary-700">{formatPrice(listing.price_per_kg)}</p>
                  </div>
                  <Badge
                    variant={
                      listing.status === 'active'
                        ? 'success'
                        : listing.status === 'sold'
                          ? 'default'
                          : 'warning'
                    }
                  >
                    {listing.status}
                  </Badge>
                </div>
                <Link
                  to={`/listing/${listing.id}`}
                  className="mt-3 inline-flex items-center justify-center gap-1 text-sm text-emerald-700 font-medium hover:underline"
                >
                  View public page
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

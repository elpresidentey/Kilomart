import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Button, Card, Badge } from '../components/ui'
import { supabase } from '../lib/supabase'
import type { CartItem, ProduceListing } from '../types'
import { ArrowLeft, MapPin, Package, Minus, Plus, ShoppingCart, Check } from 'lucide-react'
import { fallbackOnImageError, sanitizeImageUrl, FALLBACK_IMAGE_SRC } from '../lib/image'

interface ListingDetailProps {
  onAddToCart: (item: CartItem) => void
  cartItemCount: number
}

export function ListingDetail({ onAddToCart, cartItemCount }: ListingDetailProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [listing, setListing] = useState<ProduceListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    if (!id) {
      setNotFound(true)
      setLoading(false)
      return
    }

    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('produce_listings')
          .select(`*, category:categories(name, slug)`)
          .eq('id', id)
          .eq('status', 'active')
          .maybeSingle()

        if (error) throw error
        if (!data) {
          if (!cancelled) {
            setNotFound(true)
            setListing(null)
          }
        } else {
          if (!cancelled) {
            setListing(data as ProduceListing)
            setQuantity(data.min_order_kg || 1)
            setNotFound(false)
          }
        }
      } catch (e) {
        console.error(e)
        if (!cancelled) {
          setNotFound(true)
          setListing(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [id])

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)

  const qualityColors = {
    A: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Grade A' },
    B: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Grade B' },
    C: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Grade C' },
    D: { bg: 'bg-stone-100', text: 'text-stone-700', label: 'Grade D' },
  } as const

  const handleAdd = () => {
    if (!listing) return
    onAddToCart({
      id: listing.id,
      name: listing.product_name,
      price: listing.price_per_kg,
      quantity,
      seller_id: listing.seller_id,
      image: listing.images?.[0],
    })
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (loading) {
    return (
      <Layout cartItemCount={cartItemCount}>
        <div className="max-w-4xl mx-auto py-12 animate-pulse space-y-4">
          <div className="h-8 bg-stone-200 rounded w-1/3" />
          <div className="h-64 bg-stone-200 rounded-xl" />
          <div className="h-24 bg-stone-200 rounded" />
        </div>
      </Layout>
    )
  }

  if (notFound || !listing) {
    return (
      <Layout cartItemCount={cartItemCount}>
        <div className="max-w-lg mx-auto py-16 text-center">
          <Package className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-stone-900 mb-2">Listing not found</h1>
          <p className="text-stone-500 mb-6">This product may have been removed or is no longer available.</p>
          <Button onClick={() => navigate('/marketplace')}>Back to marketplace</Button>
        </div>
      </Layout>
    )
  }

  const q = qualityColors[listing.quality_grade]
  const minQ = listing.min_order_kg || 1
  const totalPrice = listing.price_per_kg * quantity

  return (
    <Layout cartItemCount={cartItemCount}>
      <div className="max-w-4xl mx-auto py-8 motion-safe:animate-fade-in motion-reduce:animate-none">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-6 rounded-lg tap-highlight-none motion-safe:transition-colors motion-safe:active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="rounded-2xl bg-stone-100 aspect-square overflow-hidden flex items-center justify-center">
            {listing.images?.[0] ? (
              <img
                src={sanitizeImageUrl(listing.images[0]) ?? FALLBACK_IMAGE_SRC}
                alt={listing.product_name}
                onError={fallbackOnImageError}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-24 h-24 text-stone-300" />
            )}
          </div>

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <span className={`${q.bg} ${q.text} px-2 py-1 rounded-md text-xs font-semibold`}>
                {q.label}
              </span>
              {listing.category?.name && (
                <Badge variant="default" size="sm">
                  {listing.category.name}
                </Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold text-stone-900">{listing.product_name}</h1>
            <div className="flex items-center gap-2 text-stone-600">
              <MapPin className="w-4 h-4" />
              <span>{listing.location}</span>
            </div>
            <p className="text-3xl font-bold text-primary-700">
              {formatPrice(listing.price_per_kg)}
              <span className="text-base font-normal text-stone-500">/kg</span>
            </p>
            <p className="text-sm text-stone-500">
              {listing.available_quantity.toLocaleString()} kg available · Min. order {minQ} kg
            </p>
            {listing.description && (
              <Card padding="md" className="bg-stone-50 border-stone-100">
                <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">{listing.description}</p>
              </Card>
            )}

            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg max-w-sm">
              <span className="text-sm font-medium text-stone-700">Quantity (kg)</span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(minQ, q - 1))}
                  className="w-9 h-9 flex items-center justify-center bg-white rounded-md shadow-sm"
                  disabled={quantity <= minQ}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-semibold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(listing.available_quantity, q + 1))}
                  className="w-9 h-9 flex items-center justify-center bg-white rounded-md shadow-sm"
                  disabled={quantity >= listing.available_quantity}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-lg font-semibold text-stone-900">Total: {formatPrice(totalPrice)}</p>

            <div className="flex flex-wrap gap-3">
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleAdd} disabled={added}>
                {added ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Added to cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to cart
                  </>
                )}
              </Button>
              <Link to="/cart">
                <Button variant="outline">View cart</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

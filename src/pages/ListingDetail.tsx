import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Button, Card, Badge } from '../components/ui'
import { supabase } from '../lib/supabase'
import type { CartItem, ProduceListing } from '../types'
import { ArrowLeft, MapPin, Package, Minus, Plus, ShoppingCart, Check } from 'lucide-react'
import { fallbackOnImageError, getProductImageSrc } from '../lib/image'
import { useI18n } from '../i18n/useI18n'

interface ListingDetailProps {
  onAddToCart: (item: CartItem) => void
  cartItemCount: number
}

export function ListingDetail({ onAddToCart, cartItemCount }: ListingDetailProps) {
  const { language } = useI18n()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [listing, setListing] = useState<ProduceListing | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const copy =
    language === 'ha'
      ? {
          notFoundTitle: 'Ba a sami kaya ba',
          notFoundBody: 'Wata kila an cire wannan kaya ko ba ya samuwa yanzu.',
          backToMarketplace: 'Koma kasuwa',
          back: 'Baya',
          perKg: '/kg',
          minLabel: 'min',
          quantity: 'Yawa (kg)',
          total: 'Jimla',
          added: 'An saka a kati',
          add: 'Saka a kati',
          viewCart: 'Duba kati',
        }
      : language === 'yo'
        ? {
            notFoundTitle: 'A ko ri akojopo yi',
            notFoundBody: 'A le ti y? ?jà yi kuro tabi ko si m?.',
            backToMarketplace: 'Pada si oja',
            back: 'Pada',
            perKg: '/kg',
            minLabel: 'min',
            quantity: 'Iye (kg)',
            total: 'Lapapo',
            added: 'Ti wa ninu kati',
            add: 'Fi si kati',
            viewCart: 'Wo kati',
          }
        : language === 'ig'
          ? {
              notFoundTitle: 'Ach?tagh? ndep?ta a',
              notFoundBody: 'O nwere ike ?b? na ewep?r? ngwaah?a a ma ? b? na ? nagh? ad?.',
              backToMarketplace: 'Laghachi n’ah?a',
              back: 'Laa az?',
              perKg: '/kg',
              minLabel: 'min',
              quantity: 'Onu ogugu (kg)',
              total: 'Nchikota',
              added: 'Etinyela na kati',
              add: 'Tinye na kati',
              viewCart: 'Lee kati',
            }
          : {
              notFoundTitle: 'Listing not found',
              notFoundBody: 'This product may have been removed or is no longer available.',
              backToMarketplace: 'Back to marketplace',
              back: 'Back',
              perKg: '/kg',
              minLabel: 'min',
              quantity: 'Quantity (kg)',
              total: 'Total',
              added: 'Added to cart',
              add: 'Add to cart',
              viewCart: 'View cart',
            }

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
    A: { bg: 'bg-primary-100', text: 'text-primary-700', label: 'Grade A' },
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
          <h1 className="text-xl font-bold text-stone-900 mb-2">{copy.notFoundTitle}</h1>
          <p className="text-stone-500 mb-6">{copy.notFoundBody}</p>
          <Button onClick={() => navigate('/marketplace')}>{copy.backToMarketplace}</Button>
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
          {copy.back}
        </button>

        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="rounded-2xl bg-stone-100 aspect-square overflow-hidden flex items-center justify-center">
            <img
              src={getProductImageSrc(listing.images?.[0], listing.product_name)}
              alt={listing.product_name}
              onError={fallbackOnImageError}
              className="w-full h-full object-cover"
            />
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
              <span className="text-base font-normal text-stone-500">{copy.perKg}</span>
            </p>
            <p className="text-sm text-stone-500">
              {listing.available_quantity.toLocaleString()} kg · {copy.minLabel} {minQ} kg
            </p>
            {listing.description && (
              <Card padding="md" className="bg-stone-50 border-stone-100">
                <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-wrap">{listing.description}</p>
              </Card>
            )}

            <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg max-w-sm">
              <span className="text-sm font-medium text-stone-700">{copy.quantity}</span>
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

            <p className="text-lg font-semibold text-stone-900">{copy.total}: {formatPrice(totalPrice)}</p>

            <div className="flex flex-wrap gap-3">
              <Button className="bg-primary-600 hover:bg-primary-700" onClick={handleAdd} disabled={added}>
                {added ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    {copy.added}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {copy.add}
                  </>
                )}
              </Button>
              <Link to="/cart">
                <Button variant="outline">{copy.viewCart}</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}



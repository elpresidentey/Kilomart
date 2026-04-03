import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button } from './ui'
import type { ProduceListing } from '../types'
import { MapPin, Package, ShoppingCart, Check, Plus, Minus } from 'lucide-react'
import { fallbackOnImageError, sanitizeImageUrl, FALLBACK_IMAGE_SRC } from '../lib/image'

interface ProduceCardProps {
  listing: ProduceListing
  onAddToCart?: (listing: ProduceListing, quantity: number) => void
  /** Staggered entrance on marketplace grid */
  listIndex?: number
}

export function ProduceCard({ listing, onAddToCart, listIndex }: ProduceCardProps) {
  const [quantity, setQuantity] = useState(listing.min_order_kg || 1)
  const [isAdded, setIsAdded] = useState(false)

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const qualityColors = {
    A: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Grade A' },
    B: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Grade B' },
    C: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Grade C' },
    D: { bg: 'bg-stone-100', text: 'text-stone-700', label: 'Grade D' },
  } as const

  const quality = qualityColors[listing.quality_grade]

  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    if (isAdding) return // prevent duplicate clicks
    setIsAdding(true)
    onAddToCart?.(listing, quantity)
    setIsAdded(true)
    setTimeout(() => {
      setIsAdded(false)
      setIsAdding(false)
    }, 2000)
  }

  const incrementQuantity = () => {
    const newQty = quantity + 1
    if (newQty <= listing.available_quantity) {
      setQuantity(newQty)
    }
  }

  const decrementQuantity = () => {
    const minQty = listing.min_order_kg || 1
    if (quantity > minQty) {
      setQuantity(quantity - 1)
    }
  }

  const totalPrice = listing.price_per_kg * quantity

  const staggerStyle: CSSProperties | undefined =
    listIndex !== undefined
      ? { animationDelay: `${Math.min(listIndex, 14) * 45}ms` }
      : undefined

  return (
    <Card
      interactive
      style={staggerStyle}
      className="group overflow-hidden motion-safe:animate-fade-in-up motion-reduce:animate-none"
    >
      {/* Image Area */}
      <div className="relative bg-gradient-to-br from-stone-100 to-stone-200 h-44 flex items-center justify-center overflow-hidden">
        <Link
          to={`/listing/${listing.id}`}
          className="absolute inset-0 flex items-center justify-center z-0"
          aria-label={`View ${listing.product_name}`}
        >
          {listing.images?.[0] ? (
            <img
              src={sanitizeImageUrl(listing.images[0]) ?? FALLBACK_IMAGE_SRC}
              alt=""
              onError={fallbackOnImageError}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <Package className="w-16 h-16 text-stone-300 group-hover:scale-110 transition-transform duration-300" />
          )}
        </Link>
        
        {/* Quality Badge */}
        <div
          className={`absolute top-3 left-3 z-10 ${quality.bg} ${quality.text} px-2 py-1 rounded-md text-xs font-semibold pointer-events-none`}
        >
          {quality.label}
        </div>

        {/* Stock Badge */}
        {listing.available_quantity < 100 && (
          <div className="absolute top-3 right-3 z-10 bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-semibold pointer-events-none">
            Low Stock
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="font-semibold text-stone-900 text-base leading-snug mb-1 line-clamp-2 min-h-[2.5rem]">
          <Link to={`/listing/${listing.id}`} className="hover:text-emerald-700 transition-colors">
            {listing.product_name}
          </Link>
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-stone-500 text-sm mb-3">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{listing.location}</span>
        </div>

        {/* Price Row */}
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <span className="text-xl font-bold text-primary-700">
              {formatPrice(listing.price_per_kg)}
            </span>
            <span className="text-sm text-stone-500">/kg</span>
          </div>
          <span className="text-xs text-stone-400">
            {listing.available_quantity.toLocaleString()} kg avail.
          </span>
        </div>

        {/* Quantity Selector */}
        <div className="flex items-center justify-between mb-4 p-2 bg-stone-50 rounded-lg">
          <span className="text-sm text-stone-600 font-medium">Quantity (kg):</span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={decrementQuantity}
              className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-stone-100 tap-highlight-none motion-safe:transition-transform motion-safe:active:scale-90 disabled:opacity-50"
              disabled={quantity <= (listing.min_order_kg || 1)}
            >
              <Minus className="w-4 h-4 text-stone-600" />
            </button>
            <span className="w-12 text-center font-semibold text-stone-900">{quantity}</span>
            <button
              type="button"
              onClick={incrementQuantity}
              className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-stone-100 tap-highlight-none motion-safe:transition-transform motion-safe:active:scale-90 disabled:opacity-50"
              disabled={quantity >= listing.available_quantity}
            >
              <Plus className="w-4 h-4 text-stone-600" />
            </button>
          </div>
        </div>

        {/* Total Price */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-stone-500">Total:</span>
          <span className="text-lg font-bold text-stone-900">{formatPrice(totalPrice)}</span>
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full"
          variant={isAdded ? 'secondary' : 'primary'}
        >
          {isAdded ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Added!
            </>
          ) : (
            <>
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart
            </>
          )}
        </Button>
      </div>
    </Card>
  )
}

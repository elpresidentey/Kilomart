import { useState, type CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Card, Button } from './ui'
import type { ProduceListing } from '../types'
import { MapPin, ShoppingCart, Check, Plus, Minus, PencilLine, Trash2, BadgeInfo } from 'lucide-react'
import { fallbackOnImageError, getProductImageSrc } from '../lib/image'
import { useI18n } from '../i18n/useI18n'
import { useToastStore } from '../stores/toastStore'

interface ProduceCardProps {
  listing: ProduceListing
  onAddToCart?: (listing: ProduceListing, quantity: number) => void
  currentUserId?: string
  onDeleteListing?: (listing: ProduceListing) => void | Promise<void>
  deletingListingId?: string | null
  /** Staggered entrance on marketplace grid */
  listIndex?: number
}

export function ProduceCard({
  listing,
  onAddToCart,
  currentUserId,
  onDeleteListing,
  deletingListingId,
  listIndex,
}: ProduceCardProps) {
  const { language } = useI18n()
  const pushToast = useToastStore((state) => state.success)
  const [quantity, setQuantity] = useState(listing.min_order_kg || 1)
  const [isAdded, setIsAdded] = useState(false)
  const isOwner = Boolean(currentUserId && currentUserId === listing.seller_id)
  const copy =
    language === 'ha'
      ? {
          lowStock: 'Kadan a sito',
          perKg: '/kg',
          kgAvailable: 'kg akwai',
          quantityKg: 'Yawa (kg):',
          total: 'Jimla:',
          added: 'An kara!',
          addToCart: 'Saka a kati',
          viewLabel: `Duba ${listing.product_name}`,
        }
      : language === 'yo'
        ? {
            lowStock: 'Ko po ni stock',
            perKg: '/kg',
            kgAvailable: 'kg wa',
            quantityKg: 'Iye (kg):',
            total: 'Lapapo:',
            added: 'Ti wa ninu kati!',
            addToCart: 'Fi si kati',
            viewLabel: `Wo ${listing.product_name}`,
          }
        : language === 'ig'
          ? {
              lowStock: 'Stock di ala',
              perKg: '/kg',
              kgAvailable: 'kg di',
              quantityKg: 'Ogu (kg):',
              total: 'Ngụkọta:',
              added: 'Etinyela!',
              addToCart: 'Tinye na kati',
              viewLabel: `Lee ${listing.product_name}`,
            }
          : {
              lowStock: 'Low Stock',
              perKg: '/kg',
              kgAvailable: 'kg avail.',
              quantityKg: 'Quantity (kg):',
              total: 'Total:',
              added: 'Added!',
              addToCart: 'Add to Cart',
              viewLabel: `View ${listing.product_name}`,
            }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  }

  const qualityColors = {
    A: { bg: 'bg-primary-100', text: 'text-primary-700', label: 'Grade A' },
    B: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Grade B' },
    C: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Grade C' },
    D: { bg: 'bg-stone-100', text: 'text-stone-700', label: 'Grade D' },
  } as const

  const quality = qualityColors[listing.quality_grade] ?? qualityColors.C

  const [isAdding, setIsAdding] = useState(false)

  const handleAddToCart = () => {
    if (isAdding) return // prevent duplicate clicks
    setIsAdding(true)
    onAddToCart?.(listing, quantity)
    pushToast(`${listing.product_name} was added to your cart.`)
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
  const isDeleting = deletingListingId === listing.id

  const staggerStyle: CSSProperties | undefined =
    listIndex !== undefined
      ? { animationDelay: `${Math.min(listIndex, 14) * 45}ms` }
      : undefined

  return (
    <Card
      interactive
      style={staggerStyle}
      className="group motion-safe:animate-fade-in-up motion-reduce:animate-none"
    >
      {/* Image Area */}
      <div className="relative bg-gradient-to-br from-stone-100 to-stone-200 h-44 flex items-center justify-center overflow-hidden">
        <Link
          to={`/listing/${listing.id}`}
          className="absolute inset-0 flex items-center justify-center z-0"
          aria-label={copy.viewLabel}
        >
          <img
            src={getProductImageSrc(listing.images?.[0], listing.product_name)}
            alt=""
            onError={fallbackOnImageError}
            className="w-full h-full object-cover transition-transform duration-500 ease-out motion-safe:group-hover:scale-110 motion-safe:group-active:scale-105"
          />
        </Link>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-stone-950/35 via-transparent to-transparent opacity-0 transition-opacity duration-300 motion-safe:group-hover:opacity-100" />
        
        {/* Quality Badge */}
        <div
          className={`absolute top-3 left-3 z-10 ${quality.bg} ${quality.text} px-2 py-1 rounded-md text-xs font-semibold pointer-events-none shadow-sm transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5`}
        >
          {quality.label}
        </div>

        {/* Stock Badge */}
        {listing.available_quantity < 100 && (
          <div className="absolute top-3 right-3 z-10 bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-semibold pointer-events-none shadow-sm transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5">
            {copy.lowStock}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Product Name */}
        <h3 className="font-semibold text-stone-900 text-base leading-snug line-clamp-2 min-h-[2.5rem] transition-transform duration-300 motion-safe:group-hover:-translate-y-0.5">
          <Link
            to={`/listing/${listing.id}`}
            className="hover:text-primary-700 transition-colors motion-safe:group-hover:translate-x-0.5"
          >
            {listing.product_name}
          </Link>
        </h3>

        {/* Location */}
        <div className="flex items-center gap-1 text-stone-500 text-sm transition-colors duration-300 motion-safe:group-hover:text-stone-700">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{listing.location}</span>
        </div>

        <div>
          <span className="inline-flex items-center rounded-full bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-700 transition-all duration-300 motion-safe:group-hover:bg-primary-50 motion-safe:group-hover:text-primary-700">
            Minimum order: {listing.min_order_kg || 1} kg
          </span>
        </div>

        {/* Price Row */}
        <div className="flex items-baseline justify-between transition-transform duration-300 motion-safe:group-hover:translate-y-[-1px]">
          <div>
            <span className="text-xl font-bold text-primary-700 transition-colors duration-300 motion-safe:group-hover:text-primary-800">
              {formatPrice(listing.price_per_kg)}
            </span>
            <span className="text-sm text-stone-500">{copy.perKg}</span>
          </div>
          <span className="text-xs text-stone-400">
            {listing.available_quantity.toLocaleString()} {copy.kgAvailable}
          </span>
        </div>

        {/* Quantity Selector */}
        {isOwner ? (
          <div className="flex items-center gap-2 rounded-lg bg-primary-50 px-3 py-2 text-sm text-primary-800">
            <BadgeInfo className="w-4 h-4 shrink-0" />
            <span className="font-medium">Your listing</span>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 bg-stone-50 rounded-lg transition-colors duration-300 motion-safe:group-hover:bg-stone-100/80">
            <span className="text-sm text-stone-600 font-medium">{copy.quantityKg}</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={decrementQuantity}
                className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-stone-100 tap-highlight-none motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-90 disabled:opacity-50"
                disabled={quantity <= (listing.min_order_kg || 1)}
              >
                <Minus className="w-4 h-4 text-stone-600" />
              </button>
              <span className="w-12 text-center font-semibold text-stone-900">{quantity}</span>
              <button
                type="button"
                onClick={incrementQuantity}
                className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-stone-100 tap-highlight-none motion-safe:transition-all motion-safe:duration-200 motion-safe:hover:-translate-y-0.5 motion-safe:active:scale-90 disabled:opacity-50"
                disabled={quantity >= listing.available_quantity}
              >
                <Plus className="w-4 h-4 text-stone-600" />
              </button>
            </div>
          </div>
        )}

        {/* Total Price */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-stone-500">{copy.total}</span>
          <span className="text-lg font-bold text-stone-900 transition-transform duration-300 motion-safe:group-hover:translate-x-0.5">
            {formatPrice(totalPrice)}
          </span>
        </div>

        {/* Add to Cart Button */}
        {isOwner ? (
          <div className="flex gap-2">
            <Link to={`/listings/${listing.id}/edit`} className="flex-1">
              <Button variant="secondary" className="w-full">
                <PencilLine className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
              onClick={() => onDeleteListing?.(listing)}
              disabled={isDeleting}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        ) : (
          <Button
            onClick={handleAddToCart}
            disabled={isAdding}
            className="w-full motion-safe:group-hover:translate-y-[-1px]"
            variant={isAdded ? 'secondary' : 'primary'}
          >
            {isAdded ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                {copy.added}
              </>
            ) : (
              <>
                <ShoppingCart className="w-4 h-4 mr-2" />
                {copy.addToCart}
              </>
            )}
          </Button>
        )}
      </div>
    </Card>
  )
}

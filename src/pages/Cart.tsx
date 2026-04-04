import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Button } from '../components/ui'
import { useCart } from '../hooks/useCart'
import { fallbackOnImageError, sanitizeImageUrl, FALLBACK_IMAGE_SRC } from '../lib/image'
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight,
  Package,
  Truck
} from 'lucide-react'

export function Cart() {
  const navigate = useNavigate()
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart()

  const deliveryFee = 1500
  const subtotal = getCartTotal()
  const total = subtotal + deliveryFee

  if (cart.length === 0) {
    return (
      <Layout cartItemCount={0}>
        <div className="max-w-2xl mx-auto py-16 px-4 text-center">
          <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-stone-400" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">Your cart is empty</h1>
          <p className="text-stone-600 mb-8">Add some fresh produce to get started</p>
          <Button onClick={() => navigate('/marketplace')} size="lg">
            Browse Marketplace
          </Button>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-2xl font-bold text-stone-900 mb-8 flex items-center gap-3">
          <ShoppingCart className="w-7 h-7" />
          Shopping Cart ({cart.length} items)
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-white rounded-xl border border-stone-200 hover:border-emerald-200 transition-colors"
              >
                {/* Product Image */}
                <div className="w-24 h-24 bg-stone-100 rounded-lg flex-shrink-0 overflow-hidden">
                  {item.image ? (
                    <img
                      src={sanitizeImageUrl(item.image) ?? FALLBACK_IMAGE_SRC}
                      alt={item.name}
                      onError={fallbackOnImageError}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-8 h-8 text-stone-300" />
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-900 truncate">
                    <Link to={`/listing/${item.id}`} className="hover:text-emerald-700">
                      {item.name}
                    </Link>
                  </h3>
                  <p className="text-sm text-stone-500">₦{item.price.toLocaleString()} per kg</p>
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center gap-3 mt-3">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Price and Remove */}
                <div className="flex flex-col items-end justify-between">
                  <p className="font-bold text-stone-900">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            {/* Clear Cart Button */}
            <button
              onClick={clearCart}
              className="text-sm text-stone-500 hover:text-red-500 transition-colors"
            >
              Clear all items
            </button>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-stone-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-stone-900 mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Delivery Fee
                  </span>
                  <span>₦{deliveryFee.toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold text-stone-900">
                  <span>Total</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
              </div>

              <Button 
                onClick={() => navigate('/checkout')}
                className="w-full"
                size="lg"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <Link 
                to="/marketplace"
                className="block text-center mt-4 text-sm text-stone-600 hover:text-emerald-600 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

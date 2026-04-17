import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Button } from '../components/ui'
import { useCart } from '../hooks/useCart'
import { cartUnitsCount } from '../stores/cartStore'
import { fallbackOnImageError, getProductImageSrc } from '../lib/image'
import { useI18n } from '../i18n/useI18n'
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Truck } from 'lucide-react'

export function Cart() {
  const navigate = useNavigate()
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart()
  const { t } = useI18n()

  const deliveryFee = 1500
  const subtotal = getCartTotal()
  const total = subtotal + deliveryFee
  const itemCount = cartUnitsCount(cart)

  if (cart.length === 0) {
    return (
      <Layout cartItemCount={0}>
        <div className="max-w-2xl mx-auto py-16 px-4 text-center">
          <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-stone-400" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-2">{t('cart.emptyTitle')}</h1>
          <p className="text-stone-600 mb-8">{t('cart.emptySub')}</p>
          <Button onClick={() => navigate('/marketplace')} size="lg">
            {t('cart.browseMarketplace')}
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
          {t('cart.title')} ({itemCount} {t('cart.itemsCount')})
        </h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-white rounded-xl border border-stone-200 hover:border-primary-200 transition-colors"
              >
                <div className="w-24 h-24 bg-stone-100 rounded-lg flex-shrink-0 overflow-hidden">
                  <img
                    src={getProductImageSrc(item.image, item.name)}
                    alt={item.name}
                    onError={fallbackOnImageError}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-stone-900 truncate">
                    <Link to={`/listing/${item.id}`} className="hover:text-primary-700">
                      {item.name}
                    </Link>
                  </h3>
                  <p className="text-sm text-stone-500">
                    ₦{item.price.toLocaleString()} {t('cart.pricePerKg')}
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center hover:bg-stone-50 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <p className="font-bold text-stone-900">
                    ₦{(item.price * item.quantity).toLocaleString()}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={clearCart}
              className="text-sm text-stone-500 hover:text-red-500 transition-colors"
            >
              {t('cart.clearAll')}
            </button>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-stone-200 p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-stone-900 mb-4">{t('cart.orderSummary')}</h2>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-stone-600">
                  <span>{t('cart.subtotal')}</span>
                  <span>₦{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    {t('cart.deliveryFee')}
                  </span>
                  <span>₦{deliveryFee.toLocaleString()}</span>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold text-stone-900">
                  <span>{t('cart.total')}</span>
                  <span>₦{total.toLocaleString()}</span>
                </div>
              </div>

              <Button onClick={() => navigate('/checkout')} className="w-full" size="lg">
                {t('cart.proceedToCheckout')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <Link
                to="/marketplace"
                className="block text-center mt-4 text-sm text-stone-600 hover:text-primary-600 transition-colors"
              >
                {t('cart.continueShopping')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

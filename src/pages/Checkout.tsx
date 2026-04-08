import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Button } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { useCartStore, cartUnitsCount } from '../stores/cartStore'
import { ArrowLeft, MapPin, Phone, User, CreditCard, Truck, CheckCircle } from 'lucide-react'

export function Checkout() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const cart = useCartStore((s) => s.cart)
  const clearCart = useCartStore((s) => s.clearCart)
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'bank_transfer' | 'paystack'>('cash_on_delivery')

  const [deliveryInfo, setDeliveryInfo] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
  })

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const deliveryFee = 1500
  const finalTotal = totalAmount + deliveryFee
  const callbackBase = typeof window !== 'undefined' ? window.location.origin : ''

  const deliveryPayload = useMemo(
    () => ({
      address: deliveryInfo.address,
      city: deliveryInfo.city,
      state: deliveryInfo.state,
      phone: deliveryInfo.phone,
      contact_name: deliveryInfo.fullName,
    }),
    [deliveryInfo]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDeliveryInfo({ ...deliveryInfo, [e.target.name]: e.target.value })
  }

  const createOrdersAndPayments = async (providerReference?: string) => {
    if (!user) throw new Error('Please log in to place an order')
    const orderNumbers: string[] = []

    for (const item of cart) {
      const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase()
      const itemTotal = item.price * item.quantity
      const lineTotal = itemTotal + deliveryFee / cart.length

      const { data: orderRow, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          buyer_id: user.id,
          seller_id: item.seller_id,
          listing_id: item.id,
          quantity_kg: item.quantity,
          price_per_kg: item.price,
          subtotal: itemTotal,
          delivery_fee: deliveryFee / cart.length,
          total_amount: lineTotal,
          delivery_address: deliveryPayload,
          status: paymentMethod === 'paystack' ? 'paid' : 'pending',
        })
        .select('id')
        .single()

      if (orderError) throw orderError

      const { error: paymentError } = await supabase.from('payments').insert({
        order_id: orderRow.id,
        payer_id: user.id,
        payee_id: item.seller_id,
        amount: lineTotal,
        currency: 'NGN',
        payment_method: paymentMethod,
        provider: paymentMethod === 'paystack' ? 'paystack' : null,
        provider_reference: providerReference || null,
        status: paymentMethod === 'paystack' ? 'completed' : 'pending',
      })

      if (paymentError) {
        console.warn('Could not save payment record:', paymentError)
      }

      orderNumbers.push(orderNumber)
    }

    setOrderNumber(orderNumbers[0])
    setOrderComplete(true)
    clearCart()
  }

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref')
    if (!reference || authLoading || !user || cart.length === 0) return

    const marker = `paystack_verified_${reference}`
    if (sessionStorage.getItem(marker) === '1') return

    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        const r = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`)
        const data = await r.json()
        if (!r.ok) throw new Error(data?.error || 'Could not verify payment')
        if (data.status !== 'success') throw new Error('Payment was not successful')

        await createOrdersAndPayments(reference)
        sessionStorage.setItem(marker, '1')
        setSearchParams({}, { replace: true })
      } catch (e: any) {
        setError(e?.message || 'Could not verify payment')
      } finally {
        setLoading(false)
      }
    })()
  }, [searchParams, authLoading, user, cart.length, setSearchParams])

  const placeOrder = async () => {
    // `user` comes from fetching your `public.users` profile row, which is async.
    // Avoid blocking checkout with a false "not logged in" message during that window.
    if (authLoading) {
      return
    }

    if (!user) {
      setError('Please log in to place an order')
      return
    }
    
    if (!deliveryInfo.fullName || !deliveryInfo.phone || !deliveryInfo.address) {
      setError('Please fill in all required delivery information')
      return
    }
    
    setError(null)
    setLoading(true)
    try {
      if (paymentMethod === 'paystack') {
        const callbackUrl = callbackBase ? `${callbackBase}/checkout` : '/checkout'
        const resp = await fetch('/api/paystack/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: user.email,
            amountKobo: Math.round(finalTotal * 100),
            callbackUrl,
            metadata: {
              buyer_id: user.id,
              checkout_source: 'kilomarket_web',
            },
          }),
        })
        const payload = await resp.json()
        if (!resp.ok || !payload.authorization_url) {
          throw new Error(payload?.error || 'Could not initialize Paystack payment')
        }
        window.location.href = payload.authorization_url as string
        return
      }

      await createOrdersAndPayments()
    } catch (error: any) {
      console.error('Order failed:', error)
      setError(error?.message || error?.error_description || 'Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0 && !orderComplete) {
    return (
      <Layout cartItemCount={0}>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-10 h-10 text-stone-400" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Your cart is empty</h2>
          <p className="text-stone-600 mb-6">Add some products to proceed with checkout</p>
          <Button onClick={() => navigate('/marketplace')}>
            Browse Marketplace
          </Button>
        </div>
      </Layout>
    )
  }

  if (orderComplete) {
    return (
      <Layout cartItemCount={0}>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Order Placed Successfully!</h2>
          <p className="text-stone-600 mb-2">Order #{orderNumber}</p>
          <p className="text-stone-500 mb-8">You will receive a confirmation call within 24 hours</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/orders')} variant="outline">
              View Orders
            </Button>
            <Button onClick={() => navigate('/marketplace')}>
              Continue Shopping
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout cartItemCount={cartUnitsCount(cart)}>
      <div className="max-w-4xl mx-auto py-8">
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </button>

        <h1 className="text-2xl font-bold text-stone-900 mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Delivery Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold text-stone-900">Delivery Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="fullName"
                      value={deliveryInfo.fullName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      name="phone"
                      value={deliveryInfo.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="+234 800 000 0000"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Delivery Address
                  </label>
                  <textarea
                    name="address"
                    value={deliveryInfo.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Street address, landmark, etc."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={deliveryInfo.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="City"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={deliveryInfo.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="State"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold text-stone-900">Payment</h2>
              </div>
              <p className="text-sm text-stone-500 mb-4">
                Choose your payment option. Paystack card flow is verified server-side before orders are created.
              </p>
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-stone-200 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50/50">
                  <input
                    type="radio"
                    name="pay"
                    className="mt-1"
                    checked={paymentMethod === 'paystack'}
                    onChange={() => setPaymentMethod('paystack')}
                  />
                  <span>
                    <span className="font-medium text-stone-900">Paystack (card / transfer)</span>
                    <span className="block text-sm text-stone-500">Secure online payment and instant verification</span>
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-stone-200 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50/50">
                  <input
                    type="radio"
                    name="pay"
                    className="mt-1"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={() => setPaymentMethod('cash_on_delivery')}
                  />
                  <span>
                    <span className="font-medium text-stone-900">Cash on delivery</span>
                    <span className="block text-sm text-stone-500">Pay when your order arrives</span>
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-stone-200 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50/50">
                  <input
                    type="radio"
                    name="pay"
                    className="mt-1"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                  />
                  <span>
                    <span className="font-medium text-stone-900">Bank transfer</span>
                    <span className="block text-sm text-stone-500">
                      You will receive payment details from the seller or support
                    </span>
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                  <Truck className="w-5 h-5 text-emerald-600" />
                </div>
                <h2 className="text-lg font-semibold text-stone-900">Order Summary</h2>
              </div>

              <div className="space-y-4 mb-6">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-3 border-b border-stone-100">
                    <div>
                      <p className="font-medium text-stone-900">{item.name}</p>
                      <p className="text-sm text-stone-500">{item.quantity} kg × ₦{item.price.toLocaleString()}</p>
                    </div>
                    <p className="font-semibold text-stone-900">
                      ₦{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-stone-200 pt-4">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span>₦{totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    Delivery Fee
                  </span>
                  <span>₦{deliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-stone-900 pt-3 border-t border-stone-200">
                  <span>Total</span>
                  <span>₦{finalTotal.toLocaleString()}</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <Button
                onClick={placeOrder}
                disabled={loading || authLoading}
                className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700"
                size="lg"
              >
                {loading
                  ? 'Processing...'
                  : authLoading
                    ? 'Checking login...'
                    : `Place order — ₦${finalTotal.toLocaleString()}`}
              </Button>

              <p className="text-xs text-stone-500 text-center mt-4">
                {paymentMethod === 'cash_on_delivery'
                  ? 'You selected cash on delivery. Have the exact amount or confirm transfer with the rider.'
                  : paymentMethod === 'bank_transfer'
                  ? 'You selected bank transfer. Complete payment using details shared by the seller.'
                  : 'You selected Paystack. You will be redirected securely to complete payment.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

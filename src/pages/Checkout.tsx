import { useCallback, useEffect, useState, type ChangeEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Button } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { useCartStore, cartUnitsCount } from '../stores/cartStore'
import type { CartItem } from '../types'
import { ArrowLeft, MapPin, Phone, User, CreditCard, Truck, CheckCircle } from 'lucide-react'
import { repairText } from '../i18n/repairText'
import { useI18n } from '../i18n/useI18n'
import { useToastStore } from '../stores/toastStore'

const CHECKOUT_SNAPSHOT_KEY = 'farmersmarket_checkout_snapshot'

type DeliveryInfo = {
  fullName: string
  phone: string
  address: string
  city: string
  state: string
}

type CheckoutSnapshot = {
  cart: CartItem[]
  deliveryInfo: DeliveryInfo
  paymentMethod: 'cash_on_delivery' | 'bank_transfer' | 'paystack'
  totalAmount: number
  deliveryFee: number
  finalTotal: number
  createdAt: string
}

function readCheckoutSnapshot(): CheckoutSnapshot | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(CHECKOUT_SNAPSHOT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CheckoutSnapshot
  } catch {
    return null
  }
}

function writeCheckoutSnapshot(snapshot: CheckoutSnapshot) {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(CHECKOUT_SNAPSHOT_KEY, JSON.stringify(snapshot))
}

function clearCheckoutSnapshot() {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem(CHECKOUT_SNAPSHOT_KEY)
}

async function safeJson(response: Response): Promise<any> {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

export function Checkout() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const cart = useCartStore((s) => s.cart)
  const clearCart = useCartStore((s) => s.clearCart)
  const { user, loading: authLoading } = useAuth()
  const { t, language } = useI18n()
  const toastSuccess = useToastStore((state) => state.success)
  const toastError = useToastStore((state) => state.error)
  const [loading, setLoading] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderNumber, setOrderNumber] = useState('')
  const [snapshot, setSnapshot] = useState<CheckoutSnapshot | null>(() => readCheckoutSnapshot())
  
  const [error, setError] = useState<string | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<'cash_on_delivery' | 'bank_transfer' | 'paystack'>('cash_on_delivery')

  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo>({
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
  const apiBase =
    (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '') ||
    (typeof window !== 'undefined' && !['localhost', '127.0.0.1'].includes(window.location.hostname)
      ? window.location.origin
      : '')
  const initializeUrl = apiBase ? `${apiBase}/api/paystack/initialize` : '/api/paystack/initialize'
  const verifyUrl = apiBase ? `${apiBase}/api/paystack/verify` : '/api/paystack/verify'
  const [debugHint, setDebugHint] = useState<string | null>(null)
  const copy = repairText(
    language === 'ha'
      ? {
          loginToOrder: 'Don Allah shiga kafin yin oda',
          fillDelivery: 'Don Allah cika dukkan bayanan isarwa da ake bukata',
          verifyPayment: 'Ba a iya tabbatar da biyan kudi ba',
          payNotSuccessful: 'Biyan kudi bai yi nasara ba',
          initPaystack: 'Ba a iya fara biyan Paystack ba',
          orderFailed: 'An kasa yin oda. Don Allah sake gwadawa.',
          cartEmptyTitle: 'Katin ka babu komai',
          cartEmptyBody: 'Saka wasu kayayyaki domin ci gaba da checkout',
          browseMarketplace: 'Bude kasuwa',
          orderPlaced: 'An yi oda cikin nasara!',
          orderCall: 'Za a kira ka don tabbatarwa cikin awa 24',
          viewOrders: 'Duba umarni',
          continueShopping: 'Ci gaba da siyayya',
        }
      : language === 'yo'
        ? {
            loginToOrder: 'Jowo wÃ¡Â»Âle ki o to paÃ¡Â¹Â£Ã¡ÂºÂ¹',
            fillDelivery: 'Jowo kun gbogbo alaye ifijiÃ¡Â¹Â£Ã¡ÂºÂ¹ to nilo',
            verifyPayment: 'Ko le jÃ¡ÂºÂ¹risi isanwo',
            payNotSuccessful: 'Isanwo ko Ã¡Â¹Â£aÃ¡Â¹Â£eyÃ¡Â»Âri',
            initPaystack: 'Ko le bÃ¡ÂºÂ¹rÃ¡ÂºÂ¹ isanwo Paystack',
            orderFailed: 'Ko Ã¡Â¹Â£ee paÃ¡Â¹Â£Ã¡ÂºÂ¹. Jowo tun gbiyanju.',
            cartEmptyTitle: 'Kati rÃ¡ÂºÂ¹ Ã¡Â¹Â£ofo',
            cartEmptyBody: 'Fi diÃ¡ÂºÂ¹ Ã¡Â»Âja kun lati tÃ¡ÂºÂ¹siwaju si checkout',
            browseMarketplace: 'Bude oja',
            orderPlaced: 'A ti fi aÃ¡Â¹Â£Ã¡ÂºÂ¹ ranÃ¡Â¹Â£Ã¡ÂºÂ¹ ni aÃ¡Â¹Â£eyÃ¡Â»Âri!',
            orderCall: 'A o pe Ã¡Â»Â fun ÃƒÂ¬mÃƒÂºdÃƒÂ¡jÃƒÂº laarin wakati 24',
            viewOrders: 'Wo awÃ¡Â»Ân aÃ¡Â¹Â£Ã¡ÂºÂ¹',
            continueShopping: 'Tesiwaju rira',
          }
        : language === 'ig'
          ? {
              loginToOrder: 'Biko banye tupu itinye order',
              fillDelivery: 'Biko juputa ozi nnyefe niile a choro',
              verifyPayment: 'Enweghi ike nyochaa ugwo',
              payNotSuccessful: 'Ugwo adighi nke oma',
              initPaystack: 'Enweghi ike ibido ugwo Paystack',
              orderFailed: 'Enweghi ike itinye order. Biko nwaa ozo.',
              cartEmptyTitle: 'Kati gi di nÃ¢â‚¬â„¢efu',
              cartEmptyBody: 'Tinye ufodu ngwaahÃ¡Â»â€¹a ka i gaa nÃ¢â‚¬â„¢ihu checkout',
              browseMarketplace: 'Gaa ahia',
              orderPlaced: 'Etinyere order nke oma!',
              orderCall: 'A ga-akpo gi maka nkwenye nÃ¢â‚¬â„¢ime awa 24',
              viewOrders: 'Lee orders',
              continueShopping: 'Gaa nÃ¢â‚¬â„¢ihu Ã¡Â»â€¹zÃ¡Â»Â¥ ahÃ¡Â»â€¹a',
            }
          : {
              loginToOrder: 'Please log in to place an order',
              fillDelivery: 'Please fill in all required delivery information',
              verifyPayment: 'Could not verify payment',
              payNotSuccessful: 'Payment was not successful',
              initPaystack: 'Could not initialize Paystack payment',
              orderFailed: 'Failed to place order. Please try again.',
              cartEmptyTitle: 'Your cart is empty',
              cartEmptyBody: 'Add some products to proceed with checkout',
              browseMarketplace: 'Browse Marketplace',
              orderPlaced: 'Order Placed Successfully!',
              orderCall: 'You will receive a confirmation call within 24 hours',
              viewOrders: 'View Orders',
              continueShopping: 'Continue Shopping',
            },
  )
  const missingEmailMessage =
    repairText(
      language === 'ha'
      ? 'Ba a sami imel na asusu ba. Da fatan za a sake shiga sannan a gwada.'
      : language === 'yo'
        ? 'A ko ri imeeli akanti. Jowo wole si i lekansi ki o tun gbiyanju.'
        : language === 'ig'
          ? 'Achotaghi email akauntu. Biko banye ozo ma nwalee ozo.'
          : 'No account email found. Please sign out and sign in again.',
    )

  const checkoutCart = snapshot?.paymentMethod === 'paystack' && cart.length === 0 ? snapshot.cart : cart
  const checkoutSubtotal =
    snapshot?.paymentMethod === 'paystack' && cart.length === 0 ? snapshot.totalAmount : totalAmount
  const checkoutDeliveryFee =
    snapshot?.paymentMethod === 'paystack' && cart.length === 0 ? snapshot.deliveryFee : deliveryFee
  const checkoutFinalTotal =
    snapshot?.paymentMethod === 'paystack' && cart.length === 0 ? snapshot.finalTotal : finalTotal

  const submitOrderBatch = useCallback(
    async (
      items: CartItem[],
      currentDeliveryInfo: DeliveryInfo,
      currentPaymentMethod: 'cash_on_delivery' | 'bank_transfer' | 'paystack',
      providerReference?: string
    ) => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.access_token) {
        throw new Error(copy.loginToOrder)
      }

      const response = await fetch('/api/orders/create', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            listing_id: item.id,
            quantity_kg: item.quantity,
          })),
          deliveryInfo: currentDeliveryInfo,
          paymentMethod: currentPaymentMethod,
          providerReference,
        }),
      })

      const data = await safeJson(response)
      if (!response.ok) {
        throw new Error(data?.error || copy.orderFailed)
      }

      const orderNumbers = Array.isArray(data?.orderNumbers) ? data.orderNumbers : []
      if (orderNumbers.length === 0) {
        throw new Error('Order completed but no order number was returned.')
      }
      const firstOrderNumber = orderNumbers[0] || ''

      setOrderNumber(firstOrderNumber)
      setOrderComplete(true)
      clearCart()
      clearCheckoutSnapshot()
      setSnapshot(null)
      toastSuccess(
        currentPaymentMethod === 'paystack'
          ? 'Payment verified and your order is on the way.'
          : `Order ${firstOrderNumber} placed successfully.`
      )
    },
    [clearCart, copy.loginToOrder, copy.orderFailed, setSnapshot, toastSuccess]
  )

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDeliveryInfo({ ...deliveryInfo, [e.target.name]: e.target.value })
  }

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref')
    const snapshotData = readCheckoutSnapshot()
    if (!reference || authLoading || !user) return
    if (cart.length === 0 && !snapshotData?.cart?.length) return

    const marker = `paystack_verified_${reference}`
    if (sessionStorage.getItem(marker) === '1') return

    ;(async () => {
      try {
        setLoading(true)
        setError(null)
        setDebugHint(null)
        const r = await fetch(`${verifyUrl}?reference=${encodeURIComponent(reference)}`)
        const data = await safeJson(r)
        if (!r.ok) throw new Error(data?.error || copy.verifyPayment)
        if (!data || data.status !== 'success') throw new Error(copy.payNotSuccessful)

        const itemsToCreate = snapshotData?.cart?.length ? snapshotData.cart : cart
        const deliveryInfoToUse = snapshotData?.deliveryInfo || deliveryInfo
        const paymentMethodToUse = snapshotData?.paymentMethod || paymentMethod
        await submitOrderBatch(itemsToCreate, deliveryInfoToUse, paymentMethodToUse, reference)
        sessionStorage.setItem(marker, '1')
        setSearchParams({}, { replace: true })
      } catch (e: any) {
        setError(e?.message || copy.verifyPayment)
        toastError(e?.message || copy.verifyPayment, 'Payment verification failed')
      } finally {
        setLoading(false)
      }
    })()
  }, [searchParams, authLoading, user, cart.length, setSearchParams, submitOrderBatch])

  const placeOrder = async () => {
    // `user` comes from fetching your `public.users` profile row, which is async.
    // Avoid blocking checkout with a false "not logged in" message during that window.
    if (authLoading) {
      return
    }

    if (!user) {
      setError(copy.loginToOrder)
      toastError(copy.loginToOrder, 'Checkout blocked')
      return
    }
    
    if (
      !deliveryInfo.fullName ||
      !deliveryInfo.phone ||
      !deliveryInfo.address ||
      !deliveryInfo.city ||
      !deliveryInfo.state
    ) {
      setError(copy.fillDelivery)
      setDebugHint(null)
      toastError(copy.fillDelivery, 'Missing delivery details')
      return
    }
    
    setError(null)
    setDebugHint(null)
    setLoading(true)
    try {
      if (paymentMethod === 'paystack') {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser()
        const payerEmail = authUser?.email || user.email
        if (!payerEmail) {
          throw new Error(missingEmailMessage)
        }

        const callbackUrl = callbackBase ? `${callbackBase}/checkout` : '/checkout'
        const nextSnapshot: CheckoutSnapshot = {
          cart,
          deliveryInfo,
          paymentMethod,
          totalAmount,
          deliveryFee,
          finalTotal,
          createdAt: new Date().toISOString(),
        }
        writeCheckoutSnapshot(nextSnapshot)
        setSnapshot(nextSnapshot)
        const resp = await fetch(initializeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: payerEmail,
            amountKobo: Math.round(finalTotal * 100),
            callbackUrl,
            metadata: {
              buyer_id: user.id,
              checkout_source: 'farmersmarket_web',
            },
          }),
        })
        const payload = await safeJson(resp)
        if (!resp.ok) {
          setDebugHint(`Init URL: ${initializeUrl} | HTTP ${resp.status}`)
          throw new Error(payload?.error || `${copy.initPaystack} (HTTP ${resp.status})`)
        }
        if (!payload?.authorization_url) {
          setDebugHint(`Init URL: ${initializeUrl} | Missing authorization_url`)
          throw new Error(payload?.error || `${copy.initPaystack}: invalid API response`)
        }
        window.location.href = payload.authorization_url as string
        return
      }

      await submitOrderBatch(cart, deliveryInfo, paymentMethod)
    } catch (error: any) {
      console.error('Order failed:', error)
      setError(error?.message || error?.error_description || copy.orderFailed)
      toastError(error?.message || error?.error_description || copy.orderFailed, 'Order failed')
    } finally {
      setLoading(false)
    }
  }

  if (checkoutCart.length === 0 && !orderComplete) {
    return (
      <Layout cartItemCount={0}>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <div className="w-20 h-20 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CreditCard className="w-10 h-10 text-stone-400" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">{copy.cartEmptyTitle}</h2>
          <p className="text-stone-600 mb-6">{copy.cartEmptyBody}</p>
          <Button onClick={() => navigate('/marketplace')}>
            {copy.browseMarketplace}
          </Button>
        </div>
      </Layout>
    )
  }

  if (orderComplete) {
    return (
      <Layout cartItemCount={0}>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-primary-600" />
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">{copy.orderPlaced}</h2>
          <p className="text-stone-600 mb-2">Order #{orderNumber}</p>
          <p className="text-stone-500 mb-8">{copy.orderCall}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/orders')} variant="outline">
              {copy.viewOrders}
            </Button>
            <Button onClick={() => navigate('/marketplace')}>
              {copy.continueShopping}
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout cartItemCount={cartUnitsCount(checkoutCart)}>
      <div className="max-w-4xl mx-auto py-8">
        <button
          onClick={() => navigate('/marketplace')}
          className="flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('checkout.backToMarketplace')}
        </button>

        <h1 className="text-2xl font-bold text-stone-900 mb-8">{t('checkout.title')}</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Delivery Information */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-lg font-semibold text-stone-900">{t('checkout.deliveryInfoTitle')}</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {t('checkout.fullNameLabel')}
                  </label>
                  <div className="relative">
                    <User className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      name="fullName"
                      value={deliveryInfo.fullName}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={t('checkout.fullNamePlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {t('checkout.phoneLabel')}
                  </label>
                  <div className="relative">
                    <Phone className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      name="phone"
                      value={deliveryInfo.phone}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={t('checkout.phonePlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    {t('checkout.addressLabel')}
                  </label>
                  <textarea
                    name="address"
                    value={deliveryInfo.address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder={t('checkout.addressPlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      {t('checkout.cityLabel')}
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={deliveryInfo.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={t('checkout.cityPlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">
                      {t('checkout.stateLabel')}
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={deliveryInfo.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder={t('checkout.statePlaceholder')}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-stone-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-lg font-semibold text-stone-900">{t('checkout.paymentTitle')}</h2>
              </div>
              <p className="text-sm text-stone-500 mb-4">
                {t('checkout.paymentSubtitle')}
              </p>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 rounded-lg border border-stone-200 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50/50 cursor-pointer">
                  <input
                    type="radio"
                    name="pay"
                    className="mt-1"
                    checked={paymentMethod === 'paystack'}
                    onChange={() => setPaymentMethod('paystack')}
                  />
                  <span>
                    <span className="font-medium text-stone-900">{t('checkout.paystackTitle')}</span>
                    <span className="block text-sm text-stone-500">{t('checkout.paystackSub')}</span>
                    <span className="block text-xs text-stone-500 mt-1">
                      Paystack now uses the current host&apos;s `/api/paystack` routes.
                    </span>
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-stone-200 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50/50">
                  <input
                    type="radio"
                    name="pay"
                    className="mt-1"
                    checked={paymentMethod === 'cash_on_delivery'}
                    onChange={() => setPaymentMethod('cash_on_delivery')}
                  />
                  <span>
                    <span className="font-medium text-stone-900">{t('checkout.codTitle')}</span>
                    <span className="block text-sm text-stone-500">{t('checkout.codSub')}</span>
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer p-3 rounded-lg border border-stone-200 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50/50">
                  <input
                    type="radio"
                    name="pay"
                    className="mt-1"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                  />
                  <span>
                    <span className="font-medium text-stone-900">{t('checkout.bankTitle')}</span>
                    <span className="block text-sm text-stone-500">
                      {t('checkout.bankSub')}
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
                  <Truck className="w-5 h-5 text-primary-600" />
                </div>
                <h2 className="text-lg font-semibold text-stone-900">{t('checkout.orderSummaryTitle')}</h2>
              </div>

              <div className="space-y-4 mb-6">
                {checkoutCart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center py-3 border-b border-stone-100">
                    <div>
                      <p className="font-medium text-stone-900">{item.name}</p>
                      <p className="text-sm text-stone-500">{item.quantity} kg x N{item.price.toLocaleString()}</p>
                    </div>
                    <p className="font-semibold text-stone-900">
                      N{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-stone-200 pt-4">
                <div className="flex justify-between text-stone-600">
                  <span>{t('checkout.subtotal')}</span>
                  <span>N{checkoutSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4" />
                    {t('checkout.deliveryFee')}
                  </span>
                  <span>N{checkoutDeliveryFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-stone-900 pt-3 border-t border-stone-200">
                  <span>{t('checkout.total')}</span>
                  <span>N{checkoutFinalTotal.toLocaleString()}</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                  {debugHint && (
                    <p className="text-xs text-red-700/80 mt-2 break-all">{debugHint}</p>
                  )}
                </div>
              )}

              <Button
                onClick={placeOrder}
                disabled={loading || authLoading}
                className="w-full mt-6 bg-primary-600 hover:bg-primary-700"
                size="lg"
              >
                {loading
                  ? t('checkout.processing')
                  : authLoading
                    ? t('checkout.checkingLogin')
                    : `${t('checkout.placeOrder')} - N${checkoutFinalTotal.toLocaleString()}`}
              </Button>

              <p className="text-xs text-stone-500 text-center mt-4">
                {paymentMethod === 'cash_on_delivery'
                  ? t('checkout.noteCod')
                  : paymentMethod === 'bank_transfer'
                  ? t('checkout.noteBank')
                  : t('checkout.notePaystack')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

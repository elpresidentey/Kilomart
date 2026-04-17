import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Card, Badge, Button } from '../components/ui'
import { supabase } from '../lib/supabase'
import { formatDeliveryAddress, orderLineTotal } from '../lib/orderDisplay'
import { useAuth } from '../hooks/useAuth'
import type { Order, OrderStatus } from '../types'
import { fallbackOnImageError, getProductImageSrc } from '../lib/image'
import { repairText } from '../i18n/repairText'
import { useI18n } from '../i18n/useI18n'
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  RefreshCw,
  HelpCircle,
} from 'lucide-react'

type StatusUi = {
  label: string
  variant: 'default' | 'success' | 'warning' | 'error' | 'info'
  icon: typeof Clock
}

const STATUS_CONFIG: Record<OrderStatus, StatusUi> = {
  pending: { label: 'status.pending', variant: 'warning', icon: Clock },
  confirmed: { label: 'status.confirmed', variant: 'info', icon: CheckCircle },
  paid: { label: 'status.paid', variant: 'info', icon: CheckCircle },
  processing: { label: 'status.processing', variant: 'info', icon: Package },
  shipped: { label: 'status.shipped', variant: 'info', icon: Truck },
  delivered: { label: 'status.delivered', variant: 'success', icon: CheckCircle },
  completed: { label: 'status.completed', variant: 'success', icon: CheckCircle },
  cancelled: { label: 'status.cancelled', variant: 'error', icon: XCircle },
  refunded: { label: 'status.refunded', variant: 'error', icon: XCircle },
}

function statusUi(status: string): StatusUi {
  if (status in STATUS_CONFIG) {
    return STATUS_CONFIG[status as OrderStatus]
  }
  return { label: status, variant: 'default', icon: HelpCircle }
}

export function BuyerOrders() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const { t } = useI18n()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const statusFilter = (searchParams.get('status') || '').toLowerCase()
  const copy = repairText(
    t('nav.home') === 'Gida'
      ? {
          productFallback: 'Kaya',
          orderPrefix: 'Umarni',
          rlsHint:
            'Idan kana amfani da RLS a Supabase, tabbatar da dokoki sun ba masu siya damar ganin layukan orders nasu.',
          leaveReview: 'Bar sharhi',
          emptyTitle: 'Babu umarni tukuna',
          emptyPending: 'Ba ka da umarni masu jiran aiki yanzu. Duba duk umarni daga menu na Orders.',
          emptyAll:
            'Da zarar ka kammala biyan kudi, siyayyarka za ta bayyana a nan. Tabbatar kana shiga da asusun da ka yi amfani da shi wajen biya.',
          browseMarketplace: 'Bude kasuwa',
        }
      : t('nav.home') === 'IlÃ©'
        ? {
            productFallback: 'á»Œja',
            orderPrefix: 'Aá¹£áº¹',
            rlsHint:
              'Ti o ba n lo RLS ninu Supabase, rii daju pe awá»n ilana gba awá»n onira laaye lati ka awá»n ila orders tiwá»n.',
            leaveReview: 'Fi atunyáº¹wo siláº¹',
            emptyTitle: 'Ko si aá¹£áº¹ sibáº¹sibáº¹',
            emptyPending: 'O ko ni aá¹£áº¹ pending bayii. Wo gbogbo aá¹£áº¹ lati inu akojá» Orders.',
            emptyAll:
              'Nigbati o ba pari isanwo, awá»n rira ráº¹ yoo han nibi. Rii daju pe o wá»le páº¹lu aká»á»láº¹ ti o lo lati sanwo.',
            browseMarketplace: 'á¹¢ii á»ja',
          }
        : t('nav.home') === 'á»¤lá»'
          ? {
              productFallback: 'Ngwaahá»‹a',
              orderPrefix: 'Order',
              rlsHint:
                'á»Œ bá»¥rá»¥ na á»‹ na-eji RLS na Supabase, há»¥ na policies na-ekwe ka ndá»‹ zá»¥rá»¥ ahá»‹a gá»¥á» ahá»‹rá»‹ orders nke ha.',
              leaveReview: 'Hapá»¥ nyocha',
              emptyTitle: 'Enweghá»‹ orders ugbu a',
              emptyPending: 'á»Š nweghá»‹ pending orders ugbu a. Lee orders niile nâ€™ime menu Orders.',
              emptyAll:
                'Mgbe á»‹ mechara checkout, ihe á»‹ zá»¥rá»¥ ga-apá»¥ta ebe a. Jide nâ€™aka na á»‹ banye na akaá»¥ntá»¥ á»‹ jiri kwá»¥á» á»¥gwá».',
              browseMarketplace: 'Gaa ahá»‹a',
            }
          : {
              productFallback: 'Product',
              orderPrefix: 'Order',
              rlsHint:
                'If you use Row Level Security in Supabase, ensure policies allow buyers to read their own orders rows.',
              leaveReview: 'Leave review',
              emptyTitle: 'No orders yet',
              emptyPending: 'You have no orders in pending status. View all orders from the Orders menu.',
              emptyAll:
                'When you complete checkout, your purchases will show here. Make sure you are signed in with the same account you used to pay.',
              browseMarketplace: 'Browse marketplace',
            }
  )

  const fetchOrders = useCallback(async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      setFetchError(null)
      const { data, error } = await supabase
        .from('orders')
        .select('*, listing:produce_listings(*)')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders((data as Order[]) || [])
    } catch (error: unknown) {
      console.error('Error fetching orders:', error)
      const msg =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message: string }).message)
          : 'Could not load orders.'
      setFetchError(msg)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user) {
      fetchOrders()
    } else if (!authLoading) {
      setLoading(false)
      setOrders([])
    }
  }, [user, authLoading, fetchOrders])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const showSkeleton = authLoading || loading
  const visibleOrders =
    statusFilter === 'pending'
      ? orders.filter((o) => (o.status || '').toLowerCase() === 'pending')
      : orders

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">
              {statusFilter === 'pending' ? t('orders.pendingTitle') : t('orders.historyTitle')}
            </h1>
            <p className="text-stone-500">
              {statusFilter === 'pending' ? t('orders.pendingSub') : t('orders.historySub')}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchOrders()}
            disabled={showSkeleton || !user}
            className="self-start sm:self-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('common.refresh')}
          </Button>
        </div>

        <div className="space-y-4">
          {fetchError && (
            <Card padding="md" className="border-amber-200 bg-amber-50/80">
              <p className="text-sm font-medium text-amber-950">{t('orders.unableToLoad')}</p>
              <p className="text-sm text-amber-900/90 mt-1">{fetchError}</p>
              <p className="text-xs text-amber-800/80 mt-2">
                {copy.rlsHint}
              </p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => fetchOrders()}>
                {t('common.tryAgain')}
              </Button>
            </Card>
          )}
          {showSkeleton ? (
            [...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse" padding="lg">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-stone-200 rounded-lg" />
                  <div className="flex-1 space-y-3">
                    <div className="h-5 bg-stone-200 rounded w-1/3" />
                    <div className="h-4 bg-stone-200 rounded w-1/4" />
                    <div className="h-4 bg-stone-200 rounded w-1/2" />
                  </div>
                </div>
              </Card>
            ))
          ) : visibleOrders.length > 0 ? (
            visibleOrders.map((order) => {
              const cfg = statusUi(order.status)
              const StatusIcon = cfg.icon
              const thumb = order.listing?.images?.[0]
              const priceKg = order.price_per_kg ?? order.listing?.price_per_kg ?? 0

              return (
                <Card key={order.id} padding="lg">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="w-full sm:w-24 h-24 bg-stone-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img
                        src={getProductImageSrc(thumb, order.listing?.product_name)}
                        alt=""
                        onError={fallbackOnImageError}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div>
                          <h3 className="font-semibold text-stone-900 text-lg">
                            {order.listing?.product_name || copy.productFallback}
                          </h3>
                          <p className="text-sm text-stone-500">
                            {order.order_number || `${copy.orderPrefix} ${order.id.slice(0, 8)}`} •{' '}
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <Badge variant={cfg.variant} size="md">
                          <StatusIcon className="w-3.5 h-3.5 mr-1" />
                          {t(cfg.label)}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-stone-500 mb-1">{t('orders.quantity')}</p>
                          <p className="font-medium text-stone-900">{order.quantity_kg} kg</p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-500 mb-1">{t('orders.pricePerKg')}</p>
                          <p className="font-medium text-stone-900">
                            {formatCurrency(Number(priceKg))}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-500 mb-1">{t('orders.subtotal')}</p>
                          <p className="font-medium text-stone-900">
                            {formatCurrency(Number(order.subtotal ?? 0))}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-500 mb-1">{t('orders.total')}</p>
                          <p className="font-bold text-primary-700">
                            {formatCurrency(orderLineTotal(order))}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2 text-sm">
                        <div>
                          <p className="text-xs text-stone-500 mb-0.5">{t('orders.deliveryFee')}</p>
                          <p className="font-medium text-stone-800">
                            {formatCurrency(Number(order.delivery_fee ?? 0))}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2 text-sm text-stone-600">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span>{formatDeliveryAddress(order.delivery_address)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-stone-100">
                    <Button
                      variant="secondary"
                      size="sm"
                      type="button"
                      onClick={() => navigate('/marketplace')}
                    >
                      {t('orders.buyAgain')}
                    </Button>
                    {order.status === 'pending' && (
                      <Button variant="outline" size="sm" type="button" disabled>
                        {t('orders.cancelOrder')}
                      </Button>
                    )}
                    {order.status === 'delivered' && (
                      <Button variant="outline" size="sm" type="button" disabled>
                        {copy.leaveReview}
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })
          ) : (
            <Card className="text-center py-12" padding="lg">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 mb-4">
                <Package className="w-8 h-8 text-stone-400" />
              </div>
              <h3 className="text-lg font-medium text-stone-900 mb-2">{copy.emptyTitle}</h3>
              <p className="text-stone-500 mb-6">
                {statusFilter === 'pending'
                  ? copy.emptyPending
                  : copy.emptyAll}
              </p>
              <Button onClick={() => navigate('/marketplace')}>{copy.browseMarketplace}</Button>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}


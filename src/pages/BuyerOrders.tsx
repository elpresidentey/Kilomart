import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Card, Badge, Button } from '../components/ui'
import { supabase } from '../lib/supabase'
import { formatDeliveryAddress, orderLineTotal } from '../lib/orderDisplay'
import { useAuth } from '../hooks/useAuth'
import type { Order, OrderStatus } from '../types'
import { fallbackOnImageError, sanitizeImageUrl, FALLBACK_IMAGE_SRC } from '../lib/image'
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
  pending: { label: 'Pending', variant: 'warning', icon: Clock },
  confirmed: { label: 'Confirmed', variant: 'info', icon: CheckCircle },
  paid: { label: 'Paid', variant: 'info', icon: CheckCircle },
  processing: { label: 'Processing', variant: 'info', icon: Package },
  shipped: { label: 'Shipped', variant: 'info', icon: Truck },
  delivered: { label: 'Delivered', variant: 'success', icon: CheckCircle },
  completed: { label: 'Completed', variant: 'success', icon: CheckCircle },
  cancelled: { label: 'Cancelled', variant: 'error', icon: XCircle },
  refunded: { label: 'Refunded', variant: 'error', icon: XCircle },
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
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const statusFilter = (searchParams.get('status') || '').toLowerCase()

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
              {statusFilter === 'pending' ? 'Pending orders' : 'Order history'}
            </h1>
            <p className="text-stone-500">
              {statusFilter === 'pending' ? 'Orders waiting to be processed' : 'Track and manage your purchases'}
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
            Refresh
          </Button>
        </div>

        <div className="space-y-4">
          {fetchError && (
            <Card padding="md" className="border-amber-200 bg-amber-50/80">
              <p className="text-sm font-medium text-amber-950">Unable to load orders</p>
              <p className="text-sm text-amber-900/90 mt-1">{fetchError}</p>
              <p className="text-xs text-amber-800/80 mt-2">
                If you use Row Level Security in Supabase, ensure policies allow buyers to read their own
                <code className="mx-1 rounded bg-amber-100/80 px-1">orders</code> rows.
              </p>
              <Button variant="outline" size="sm" className="mt-3" onClick={() => fetchOrders()}>
                Try again
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
                      {thumb ? (
                        <img
                          src={sanitizeImageUrl(thumb) ?? FALLBACK_IMAGE_SRC}
                          alt=""
                          onError={fallbackOnImageError}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-10 h-10 text-stone-400" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div>
                          <h3 className="font-semibold text-stone-900 text-lg">
                            {order.listing?.product_name || 'Product'}
                          </h3>
                          <p className="text-sm text-stone-500">
                            {order.order_number || `Order ${order.id.slice(0, 8)}`} •{' '}
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                        <Badge variant={cfg.variant} size="md">
                          <StatusIcon className="w-3.5 h-3.5 mr-1" />
                          {cfg.label}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-stone-500 mb-1">Quantity</p>
                          <p className="font-medium text-stone-900">{order.quantity_kg} kg</p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-500 mb-1">Price/kg</p>
                          <p className="font-medium text-stone-900">
                            {formatCurrency(Number(priceKg))}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-500 mb-1">Subtotal</p>
                          <p className="font-medium text-stone-900">
                            {formatCurrency(Number(order.subtotal ?? 0))}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-stone-500 mb-1">Total</p>
                          <p className="font-bold text-primary-700">
                            {formatCurrency(orderLineTotal(order))}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2 text-sm">
                        <div>
                          <p className="text-xs text-stone-500 mb-0.5">Delivery fee</p>
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
                      Buy again
                    </Button>
                    {order.status === 'pending' && (
                      <Button variant="outline" size="sm" type="button" disabled>
                        Cancel order
                      </Button>
                    )}
                    {order.status === 'delivered' && (
                      <Button variant="outline" size="sm" type="button" disabled>
                        Leave review
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
              <h3 className="text-lg font-medium text-stone-900 mb-2">No orders yet</h3>
              <p className="text-stone-500 mb-6">
                {statusFilter === 'pending'
                  ? 'You have no orders in pending status. View all orders from the Orders menu.'
                  : 'When you complete checkout, your purchases will show here. Make sure you are signed in with the same account you used to pay.'}
              </p>
              <Button onClick={() => navigate('/marketplace')}>Browse marketplace</Button>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  )
}

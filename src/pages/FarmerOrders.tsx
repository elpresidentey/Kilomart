import { useCallback, useEffect, useRef, useState } from 'react'
import { Layout } from '../components/Layout'
import { Card, Button, Badge } from '../components/ui'
import { supabase } from '../lib/supabase'
import { formatDeliveryAddress, getDeliveryContact, orderLineTotal } from '../lib/orderDisplay'
import { useAuth } from '../hooks/useAuth'
import type { Order, OrderStatus } from '../types'
import { Package, MapPin, RefreshCw } from 'lucide-react'
import { useI18n } from '../i18n/useI18n'

const STATUS_OPTIONS: OrderStatus[] = [
  'pending',
  'confirmed',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
  'refunded',
]

export function FarmerOrders() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [newOrderIds, setNewOrderIds] = useState<string[]>([])
  const [statusChangedOrderIds, setStatusChangedOrderIds] = useState<string[]>([])

  const hasLoadedRef = useRef(false)
  const orderIdsRef = useRef<Set<string>>(new Set())
  const orderStatusRef = useRef<Map<string, OrderStatus>>(new Map())

  const fetchOrders = useCallback(async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('orders')
        .select('*, listing:produce_listings(*)')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      const nextOrders = ((data as Order[]) || []) as Order[]

      if (hasLoadedRef.current) {
        const prevIds = orderIdsRef.current
        const prevStatusMap = orderStatusRef.current

        const incomingIds = nextOrders
          .filter((o) => !prevIds.has(o.id))
          .map((o) => o.id)
        if (incomingIds.length > 0) {
          setNewOrderIds(incomingIds)
          window.setTimeout(() => setNewOrderIds([]), 8000)
        }

        const changedIds = nextOrders
          .filter((o) => prevIds.has(o.id) && prevStatusMap.get(o.id) !== o.status)
          .map((o) => o.id)
        if (changedIds.length > 0) {
          setStatusChangedOrderIds(changedIds)
          window.setTimeout(() => setStatusChangedOrderIds([]), 8000)
        }
      }

      setOrders(nextOrders)
      orderIdsRef.current = new Set(nextOrders.map((o) => o.id))
      orderStatusRef.current = new Map(nextOrders.map((o) => [o.id, o.status]))
      hasLoadedRef.current = true
    } catch (e) {
      console.error(e)
      setOrders([])
      orderIdsRef.current = new Set()
      orderStatusRef.current = new Map()
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  // Realtime: auto-refresh when a buyer creates a new order for this seller.
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`seller-orders:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `seller_id=eq.${user.id}`,
        },
        () => {
          fetchOrders()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user?.id, fetchOrders])

  async function updateOrderStatus(orderId: string, status: OrderStatus) {
    setUpdatingId(orderId)
    try {
      const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
      if (error) throw error
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)))
    } catch (e) {
      console.error(e)
      alert(t('farmerOrders.updateStatusError'))
    } finally {
      setUpdatingId(null)
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-NG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">{t('farmerOrders.title')}</h1>
            <p className="text-stone-500">{t('farmerOrders.subtitle')}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchOrders()} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('common.refresh')}
          </Button>
        </div>

        {(newOrderIds.length > 0 || statusChangedOrderIds.length > 0) && (
          <div
            className="rounded-lg border border-primary-200 bg-primary-50/60 p-3 text-sm text-primary-900 motion-safe:animate-fade-in motion-reduce:animate-none"
            role="status"
            aria-live="polite"
          >
            {newOrderIds.length > 0 ? (
              <span className="font-medium">
                {t('farmerOrders.newTransaction')} ({newOrderIds.length}).
              </span>
            ) : (
              <span className="font-medium">
                {t('farmerOrders.statusUpdated')} ({statusChangedOrderIds.length}).
              </span>
            )}
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-stone-100 animate-pulse h-28 bg-stone-100" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card className="text-center py-14" padding="lg">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-600">{t('farmerOrders.noOrders')}</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const deliveryContact = getDeliveryContact(order.delivery_address)

              return (
                <Card
                  key={order.id}
                  padding="lg"
                  className={[
                    newOrderIds.includes(order.id)
                      ? 'border-primary-400/60 ring-1 ring-primary-200 bg-primary-50/30 animate-pulse'
                      : '',
                    !newOrderIds.includes(order.id) && statusChangedOrderIds.includes(order.id)
                      ? 'border-amber-300/60 ring-1 ring-amber-200 bg-amber-50/40 animate-pulse'
                      : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                <div className="flex flex-col lg:flex-row lg:items-start gap-4 justify-between">
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold text-stone-900">
                        {order.listing?.product_name || 'Product'}
                      </h2>
                      <Badge variant="default" size="sm">
                        {order.order_number || order.id.slice(0, 8)}
                      </Badge>
                    </div>
                    <p className="text-sm text-stone-500">
                      Buyer: {deliveryContact.contactName || 'Customer'}
                    </p>
                    {deliveryContact.phone && (
                      <p className="text-sm text-stone-500">Phone: {deliveryContact.phone}</p>
                    )}
                    <p className="text-sm text-stone-500">{formatDate(order.created_at)}</p>
                    <p className="text-sm text-stone-700">
                      {order.quantity_kg} kg · {formatCurrency(orderLineTotal(order))}
                    </p>
                    <div className="flex items-start gap-2 text-sm text-stone-600 max-w-xl">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{formatDeliveryAddress(order.delivery_address)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 lg:items-end flex-shrink-0">
                    <label className="text-xs text-stone-500">{t('farmerOrders.orderStatusLabel')}</label>
                    <select
                      className="px-3 py-2 border border-stone-200 rounded-lg text-sm bg-white min-w-[180px]"
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {updatingId === order.id && (
                      <span className="text-xs text-stone-400">{t('farmerOrders.saving')}</span>
                    )}
                  </div>
                </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </Layout>
  )
}

import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { Card, Button, Badge } from '../components/ui'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { ProduceListing, Order } from '../types'
import { orderLineTotal } from '../lib/orderDisplay'
import {
  TrendingUp,
  Package,
  DollarSign,
  ShoppingCart,
  Plus,
  MoreVertical,
} from 'lucide-react'
import { Link } from 'react-router-dom'

export function FarmerDashboard() {
  const { user } = useAuth()
  const [listings, setListings] = useState<ProduceListing[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalSales: 0,
    totalEarnings: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  async function fetchDashboardData() {
    try {
      setLoading(true)

      // Fetch listings
      const { data: listingsData, error: listingsError } = await supabase
        .from('produce_listings')
        .select('*')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false })

      if (listingsError) throw listingsError
      setListings(listingsData || [])

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*, listing:produce_listings(*)')
        .eq('seller_id', user?.id)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError
      setOrders(ordersData || [])

      // Calculate stats
      const activeListings = listingsData?.filter((l) => l.status === 'active') || []
      const completedOrders =
        ordersData?.filter((o) => o.status === 'delivered' || o.status === 'completed') || []
      const totalEarnings = completedOrders.reduce((sum, o) => sum + orderLineTotal(o), 0)

      setStats({
        totalListings: listingsData?.length || 0,
        activeListings: activeListings.length,
        totalSales: completedOrders.length,
        totalEarnings,
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">Farmer Dashboard</h1>
            <p className="text-stone-500">Manage your produce and track sales</p>
          </div>
          <Link to="/listings/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Listing
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-stone-500 mb-1">Total Listings</p>
                <p className="text-2xl font-bold text-stone-900">
                  {stats.totalListings}
                </p>
              </div>
              <div className="p-2 bg-primary-100 rounded-lg">
                <Package className="w-5 h-5 text-primary-700" />
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-stone-500 mb-1">Active Listings</p>
                <p className="text-2xl font-bold text-stone-900">
                  {stats.activeListings}
                </p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-700" />
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-stone-500 mb-1">Total Sales</p>
                <p className="text-2xl font-bold text-stone-900">
                  {stats.totalSales}
                </p>
              </div>
              <div className="p-2 bg-amber-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-amber-700" />
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-stone-500 mb-1">Total Earnings</p>
                <p className="text-2xl font-bold text-primary-700">
                  {formatCurrency(stats.totalEarnings)}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-green-700" />
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Listings */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-stone-900">Recent Listings</h2>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-4 animate-pulse">
                  <div className="w-16 h-16 bg-stone-200 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <div className="h-5 bg-stone-200 rounded w-1/4" />
                    <div className="h-4 bg-stone-200 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="divide-y divide-stone-100">
              {listings.slice(0, 5).map((listing) => (
                <div
                  key={listing.id}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-stone-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-stone-900">
                        {listing.product_name}
                      </h3>
                      <p className="text-sm text-stone-500">
                        {listing.available_quantity.toLocaleString()} kg @{' '}
                        {formatCurrency(listing.price_per_kg)}/kg
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        listing.status === 'active'
                          ? 'success'
                          : listing.status === 'sold'
                          ? 'default'
                          : 'warning'
                      }
                    >
                      {listing.status}
                    </Badge>
                    <button className="p-2 hover:bg-stone-100 rounded-lg">
                      <MoreVertical className="w-4 h-4 text-stone-400" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-stone-500 mb-4">No listings yet</p>
              <Link to="/listings/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Listing
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Recent Orders */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-stone-900">Recent Orders</h2>
            <Link to="/farmer/orders">
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </Link>
          </div>

          {orders.length > 0 ? (
            <div className="divide-y divide-stone-100">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between py-4 first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-stone-100 rounded-lg flex items-center justify-center">
                      <ShoppingCart className="w-6 h-6 text-stone-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-stone-900">
                        {order.order_number || `Order ${order.id.slice(0, 8)}`}
                      </h3>
                      <p className="text-sm text-stone-500">
                        {order.quantity_kg} kg of {order.listing?.product_name}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-medium text-stone-900">
                        {formatCurrency(orderLineTotal(order))}
                      </p>
                      <Badge
                        size="sm"
                        variant={
                          order.status === 'delivered'
                            ? 'success'
                            : order.status === 'pending'
                            ? 'warning'
                            : 'info'
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-stone-500">No orders yet</p>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}

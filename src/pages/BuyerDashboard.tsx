import { useState, useEffect } from 'react'
import { Layout } from '../components/Layout'
import { Card, Button, Badge } from '../components/ui'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { Order, ProduceListing } from '../types'
import { orderLineTotal } from '../lib/orderDisplay'
import { POPULAR_CATEGORY_LINKS } from '../data/marketplaceFilters'
import { ShoppingBag, Clock, Package, MapPin, Search, ChevronRight, Store, CreditCard, Heart, TrendingUp, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'warning' | 'info' | 'success' | 'error' | 'default'; color: string }
> = {
  pending: { label: 'Pending', variant: 'warning', color: 'text-amber-600 bg-amber-50' },
  confirmed: { label: 'Confirmed', variant: 'info', color: 'text-blue-600 bg-blue-50' },
  paid: { label: 'Paid', variant: 'info', color: 'text-blue-600 bg-blue-50' },
  processing: { label: 'Processing', variant: 'info', color: 'text-blue-600 bg-blue-50' },
  shipped: { label: 'Shipped', variant: 'info', color: 'text-blue-600 bg-blue-50' },
  delivered: { label: 'Delivered', variant: 'success', color: 'text-emerald-600 bg-emerald-50' },
  completed: { label: 'Completed', variant: 'success', color: 'text-emerald-600 bg-emerald-50' },
  cancelled: { label: 'Cancelled', variant: 'error', color: 'text-red-600 bg-red-50' },
  refunded: { label: 'Refunded', variant: 'error', color: 'text-red-600 bg-red-50' },
}

export function BuyerDashboard() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [recentProducts, setRecentProducts] = useState<ProduceListing[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    activeOrders: 0,
    totalSpent: 0,
    favoritesCount: 0
  })

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  async function fetchDashboardData() {
    try {
      setLoading(true)

      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*, listing:produce_listings(*)')
        .eq('buyer_id', user?.id)
        .order('created_at', { ascending: false })

      if (ordersError) throw ordersError
      setOrders(ordersData || [])

      // Calculate stats
      const activeOrders =
        ordersData?.filter((o) =>
          ['pending', 'confirmed', 'paid', 'processing', 'shipped'].includes(o.status)
        ) || []
      const totalSpent = ordersData?.reduce((sum, o) => sum + orderLineTotal(o), 0) || 0

      setStats({
        totalOrders: ordersData?.length || 0,
        activeOrders: activeOrders.length,
        totalSpent,
        favoritesCount: 0
      })

      // Fetch recent products
      const { data: productsData } = await supabase
        .from('produce_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(4)

      setRecentProducts(productsData || [])

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
            <h1 className="text-2xl font-bold text-stone-900">My Dashboard</h1>
            <p className="text-stone-500">Welcome back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! Manage your orders and discover fresh produce.</p>
          </div>
          <div className="flex gap-3">
            <Link to="/marketplace">
              <Button variant="outline">
                <Search className="w-4 h-4 mr-2" />
                Browse Market
              </Button>
            </Link>
            <Link to="/orders">
              <Button>
                <ShoppingBag className="w-4 h-4 mr-2" />
                My Orders
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-stone-500 mb-1">Total Orders</p>
                <p className="text-2xl font-bold text-stone-900">{stats.totalOrders}</p>
              </div>
              <div className="p-2 bg-primary-100 rounded-lg">
                <ShoppingBag className="w-5 h-5 text-primary-700" />
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-stone-500 mb-1">Active Orders</p>
                <p className="text-2xl font-bold text-blue-600">{stats.activeOrders}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-700" />
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-stone-500 mb-1">Total Spent</p>
                <p className="text-2xl font-bold text-stone-900">{formatCurrency(stats.totalSpent)}</p>
              </div>
              <div className="p-2 bg-amber-100 rounded-lg">
                <CreditCard className="w-5 h-5 text-amber-700" />
              </div>
            </div>
          </Card>

          <Card padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-stone-500 mb-1">Favorites</p>
                <p className="text-2xl font-bold text-stone-900">{stats.favoritesCount}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <Heart className="w-5 h-5 text-red-700" />
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <div className="lg:col-span-2 space-y-4">
            <Card padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-stone-900">Recent Orders</h2>
                <Link to="/orders">
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                      <div className="w-16 h-16 bg-stone-200 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <div className="h-5 bg-stone-200 rounded w-1/3" />
                        <div className="h-4 bg-stone-200 rounded w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.slice(0, 3).map((order) => (
                    <div key={order.id} className="flex items-center gap-4 p-4 bg-stone-50 rounded-lg">
                      <div className="w-16 h-16 bg-stone-200 rounded-lg flex items-center justify-center">
                        <Package className="w-8 h-8 text-stone-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-stone-900">{order.listing?.product_name}</h3>
                        <p className="text-sm text-stone-500">
                          {order.quantity_kg} kg • {formatCurrency(orderLineTotal(order))}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            (STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending).color
                          }`}
                        >
                          {(STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending).label}
                        </span>
                        <p className="text-xs text-stone-400 mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-500 mb-4">No orders yet</p>
                  <Link to="/marketplace">
                    <Button>Start Shopping</Button>
                  </Link>
                </div>
              )}
            </Card>

            {/* Recently Added Products */}
            <Card padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-stone-900">Fresh Arrivals</h2>
                <Link to="/marketplace">
                  <Button variant="ghost" size="sm">
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>

              {recentProducts.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  {recentProducts.map((product) => (
                    <div key={product.id} className="flex gap-3 p-3 border border-stone-100 rounded-lg hover:shadow-md transition-shadow">
                      <div className="w-20 h-20 bg-stone-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Package className="w-8 h-8 text-stone-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-stone-900 truncate">{product.product_name}</h3>
                        <p className="text-sm text-primary-700 font-semibold">{formatCurrency(product.price_per_kg)}/kg</p>
                        <p className="text-xs text-stone-500">{product.location}</p>
                        <Badge variant={product.quality_grade === 'A' ? 'success' : 'warning'} size="sm" className="mt-1">
                          Grade {product.quality_grade}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Store className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-500">No products available</p>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-stone-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link to="/marketplace">
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="w-4 h-4 mr-2" />
                    Search Products
                  </Button>
                </Link>
                <Link to="/orders">
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    View Orders
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="w-4 h-4 mr-2" />
                  My Favorites
                </Button>
                <Link to="/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="w-4 h-4 mr-2" />
                    Update Address
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Trending Categories */}
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-stone-900 mb-4">Popular Categories</h2>
              <div className="space-y-2">
                {POPULAR_CATEGORY_LINKS.map((category) => (
                  <Link 
                    key={category} 
                    to={`/marketplace?category=${encodeURIComponent(category)}`}
                    className="flex items-center justify-between p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors"
                  >
                    <span className="font-medium text-stone-700">{category}</span>
                    <TrendingUp className="w-4 h-4 text-stone-400" />
                  </Link>
                ))}
              </div>
            </Card>

            {/* Tips Card */}
            <Card padding="lg" className="bg-gradient-to-br from-primary-50 to-emerald-50 border-primary-100">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Star className="w-5 h-5 text-primary-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900">Pro Tip</h3>
                  <p className="text-sm text-stone-600 mt-1">
                    Buy in bulk to save on delivery fees. Most farmers offer discounts for orders above 100kg.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}

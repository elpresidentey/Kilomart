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
import { repairText } from '../i18n/repairText'
import { useI18n } from '../i18n/useI18n'

export function FarmerDashboard() {
  const { language, t } = useI18n()
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
  const statusLabel = (status: string) => {
    const key = `status.${status}`
    const translated = t(key)
    return translated === key ? status.replace(/_/g, ' ') : translated
  }
  const copy = repairText(
    language === 'ha'
      ? {
          title: 'Dashboard na Manomi',
          subtitle: 'Sarrafa amfanin gona da bibiyar tallace-tallace',
          newListing: 'Sabon jeri',
          totalListings: 'Jimlar jerin kaya',
          activeListings: 'Jerin da ke aiki',
          totalSales: 'Jimlar tallace-tallace',
          totalEarnings: 'Jimlar kudin shiga',
          recentListings: 'Sabbin jerin kaya',
          viewAll: 'Duba duka',
          noListings: 'Babu jeri tukuna',
          createFirst: 'Kirkiri jerinka na farko',
          recentOrders: 'Sabbin umarni',
          noOrders: 'Babu umarni tukuna',
        }
      : language === 'yo'
        ? {
            title: 'Dashboard Agbe',
            subtitle: 'Ṣakoso ọja rẹ ki o tọpa tita',
            newListing: 'Akojọ tuntun',
            totalListings: 'Lapapọ akojọ',
            activeListings: 'Akojọ to n ṣiṣẹ',
            totalSales: 'Lapapọ tita',
            totalEarnings: 'Lapapọ owo-wiwọle',
            recentListings: 'Awọn akojọ to ṣẹṣẹ',
            viewAll: 'Wo gbogbo',
            noListings: 'Ko si akojọ sibẹsibẹ',
            createFirst: 'Ṣẹda akojọ akọkọ rẹ',
            recentOrders: 'Awọn aṣẹ to ṣẹṣẹ',
            noOrders: 'Ko si aṣẹ sibẹsibẹ',
          }
        : language === 'ig'
          ? {
              title: 'Dashboard Onye Ọrụ Ugbo',
              subtitle: 'Jikwaa ngwaahịa gị ma soro ire ahịa',
              newListing: 'Ndepụta ọhụrụ',
              totalListings: 'Ngụkọta ndepụta',
              activeListings: 'Ndepụta na-arụ ọrụ',
              totalSales: 'Ngụkọta ahịa',
              totalEarnings: 'Ngụkọta ego',
              recentListings: 'Ndepụta ọhụrụ',
              viewAll: 'Lee ha niile',
              noListings: 'Enweghị ndepụta ugbu a',
              createFirst: 'Mepụta ndepụta mbụ gị',
              recentOrders: 'Orders ọhụrụ',
              noOrders: 'Enweghị orders ugbu a',
            }
          : {
              title: 'Farmer Dashboard',
              subtitle: 'Manage your produce and track sales',
              newListing: 'New Listing',
              totalListings: 'Total Listings',
              activeListings: 'Active Listings',
              totalSales: 'Total Sales',
              totalEarnings: 'Total Earnings',
              recentListings: 'Recent Listings',
              viewAll: 'View All',
              noListings: 'No listings yet',
              createFirst: 'Create Your First Listing',
              recentOrders: 'Recent Orders',
              noOrders: 'No orders yet',
            },
  )

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
            <h1 className="text-2xl font-bold text-stone-900">{copy.title}</h1>
            <p className="text-stone-500">{copy.subtitle}</p>
          </div>
          <Link to="/listings/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {copy.newListing}
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-stone-500 mb-1">{copy.totalListings}</p>
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
                <p className="text-sm text-stone-500 mb-1">{copy.activeListings}</p>
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
                <p className="text-sm text-stone-500 mb-1">{copy.totalSales}</p>
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
                <p className="text-sm text-stone-500 mb-1">{copy.totalEarnings}</p>
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
            <h2 className="text-lg font-semibold text-stone-900">{copy.recentListings}</h2>
            <Button variant="ghost" size="sm">
              {copy.viewAll}
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
                          : listing.status === 'sold' || listing.status === 'sold_out'
                          ? 'default'
                          : 'warning'
                      }
                    >
                      {statusLabel(listing.status)}
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
              <p className="text-stone-500 mb-4">{copy.noListings}</p>
              <Link to="/listings/new">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  {copy.createFirst}
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Recent Orders */}
        <Card padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-stone-900">{copy.recentOrders}</h2>
            <Link to="/farmer/orders">
              <Button variant="ghost" size="sm">
                {copy.viewAll}
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
                        {statusLabel(order.status)}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-stone-500">{copy.noOrders}</p>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  )
}

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
import { repairText } from '../i18n/repairText'
import { useI18n } from '../i18n/useI18n'

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'warning' | 'info' | 'success' | 'error' | 'default'; color: string }
> = {
  pending: { label: 'status.pending', variant: 'warning', color: 'text-amber-600 bg-amber-50' },
  confirmed: { label: 'status.confirmed', variant: 'info', color: 'text-blue-600 bg-blue-50' },
  paid: { label: 'status.paid', variant: 'info', color: 'text-blue-600 bg-blue-50' },
  processing: { label: 'status.processing', variant: 'info', color: 'text-blue-600 bg-blue-50' },
  shipped: { label: 'status.shipped', variant: 'info', color: 'text-blue-600 bg-blue-50' },
  delivered: { label: 'status.delivered', variant: 'success', color: 'text-primary-600 bg-primary-50' },
  completed: { label: 'status.completed', variant: 'success', color: 'text-primary-600 bg-primary-50' },
  cancelled: { label: 'status.cancelled', variant: 'error', color: 'text-red-600 bg-red-50' },
  refunded: { label: 'status.refunded', variant: 'error', color: 'text-red-600 bg-red-50' },
}

export function BuyerDashboard() {
  const { language, t } = useI18n()
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
  const copy = repairText(
    language === 'ha'
      ? {
          title: 'Dashboard dina',
          welcome: 'Barka da dawowa',
          welcomeSuffix: 'Sarrafa umarninka kuma gano sabbin kayan gona.',
          browseMarket: 'Bude kasuwa',
          myOrders: 'Umarnina',
          totalOrders: 'Jimlar umarni',
          activeOrders: 'Umarni masu aiki',
          totalSpent: 'Jimlar kashe kudi',
          favorites: 'Abubuwan so',
          recentOrders: 'Sabbin umarni',
          viewAll: 'Duba duka',
          noOrders: 'Babu umarni tukuna',
          startShopping: 'Fara siyayya',
          freshArrivals: 'Sabbin kaya',
          noProducts: 'Babu kaya yanzu',
          quickActions: 'Ayyuka masu sauri',
          searchProducts: 'Nemo kayayyaki',
          viewOrders: 'Duba umarni',
          myFavorites: 'Abubuwan da nake so',
          updateAddress: 'Sabunta adireshi',
          popularCategories: 'Rukuni masu shahara',
          proTip: 'Shawara',
          tipText: 'Sayi da yawa domin rage kudin isarwa. Manoma da yawa na bayar da rangwame idan oda ya wuce 100kg.',
        }
      : language === 'yo'
        ? {
            title: 'Dashboard mi',
            welcome: 'Kaabo pada',
            welcomeSuffix: 'Ṣakoso awọn aṣẹ rẹ ki o si wa ọja tuntun.',
            browseMarket: 'Bude oja',
            myOrders: 'Awọn aṣẹ mi',
            totalOrders: 'Lapapọ aṣẹ',
            activeOrders: 'Aṣẹ to n ṣiṣẹ',
            totalSpent: 'Lapapọ inawo',
            favorites: 'Ayanfẹ',
            recentOrders: 'Awọn aṣẹ to ṣẹṣẹ',
            viewAll: 'Wo gbogbo',
            noOrders: 'Ko si aṣẹ sibẹsibẹ',
            startShopping: 'Bẹrẹ rira',
            freshArrivals: 'Awọn ọja tuntun',
            noProducts: 'Ko si ọja wa',
            quickActions: 'Igbese yarayara',
            searchProducts: 'Wa ọja',
            viewOrders: 'Wo awọn aṣẹ',
            myFavorites: 'Awọn ayanfẹ mi',
            updateAddress: 'Ṣatunkọ adirẹsi',
            popularCategories: 'Ẹka olokiki',
            proTip: 'Imọran',
            tipText: 'Ra ni opoiye lati fi owo ifijiṣẹ pamọ. Pupọ agbe nfunni ni ẹdinwo fun aṣẹ ju 100kg lọ.',
          }
        : language === 'ig'
          ? {
              title: 'Dashboard m',
              welcome: 'Nnọọ ọzọ',
              welcomeSuffix: 'Jikwaa orders gị ma chọpụta ngwaahịa ọhụrụ.',
              browseMarket: 'Gaa ahịa',
              myOrders: 'Orders m',
              totalOrders: 'Ngụkọta orders',
              activeOrders: 'Orders na-arụ ọrụ',
              totalSpent: 'Ngụkọta ego e mefuru',
              favorites: 'Ihe masịrị m',
              recentOrders: 'Orders ọhụrụ',
              viewAll: 'Lee ha niile',
              noOrders: 'Enweghị orders ugbu a',
              startShopping: 'Bido ịzụ ahịa',
              freshArrivals: 'Ngwaahịa ọhụrụ',
              noProducts: 'Enweghị ngwaahịa dị',
              quickActions: 'Ihe omume ọsọ ọsọ',
              searchProducts: 'Chọọ ngwaahịa',
              viewOrders: 'Lee orders',
              myFavorites: 'Ihe masịrị m',
              updateAddress: 'Melite adreesị',
              popularCategories: 'Ụdị ama ama',
              proTip: 'Ndụmọdụ',
              tipText: 'Zụta n’ọtụtụ ka i chekwaa ego nnyefe. Ọtụtụ ndị ọrụ ugbo na-enye ego mbelata maka orders karịrị 100kg.',
            }
          : {
              title: 'My Dashboard',
              welcome: 'Welcome back',
              welcomeSuffix: 'Manage your orders and discover fresh produce.',
              browseMarket: 'Browse Market',
              myOrders: 'My Orders',
              totalOrders: 'Total Orders',
              activeOrders: 'Active Orders',
              totalSpent: 'Total Spent',
              favorites: 'Favorites',
              recentOrders: 'Recent Orders',
              viewAll: 'View All',
              noOrders: 'No orders yet',
              startShopping: 'Start Shopping',
              freshArrivals: 'Fresh Arrivals',
              noProducts: 'No products available',
              quickActions: 'Quick Actions',
              searchProducts: 'Search Products',
              viewOrders: 'View Orders',
              myFavorites: 'My Favorites',
              updateAddress: 'Update Address',
              popularCategories: 'Popular Categories',
              proTip: 'Pro Tip',
              tipText: 'Buy in bulk to save on delivery fees. Most farmers offer discounts for orders above 100kg.',
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
            <h1 className="text-2xl font-bold text-stone-900">{copy.title}</h1>
            <p className="text-stone-500">{copy.welcome}{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}! {copy.welcomeSuffix}</p>
          </div>
          <div className="flex gap-3">
            <Link to="/marketplace">
              <Button variant="outline">
                <Search className="w-4 h-4 mr-2" />
                {copy.browseMarket}
              </Button>
            </Link>
            <Link to="/orders">
              <Button>
                <ShoppingBag className="w-4 h-4 mr-2" />
                {copy.myOrders}
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card padding="md">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-stone-500 mb-1">{copy.totalOrders}</p>
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
                <p className="text-sm text-stone-500 mb-1">{copy.activeOrders}</p>
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
                <p className="text-sm text-stone-500 mb-1">{copy.totalSpent}</p>
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
                <p className="text-sm text-stone-500 mb-1">{copy.favorites}</p>
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
                <h2 className="text-lg font-semibold text-stone-900">{copy.recentOrders}</h2>
                <Link to="/orders">
                  <Button variant="ghost" size="sm">
                    {copy.viewAll}
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
                          {t((STATUS_CONFIG[order.status] ?? STATUS_CONFIG.pending).label)}
                        </span>
                        <p className="text-xs text-stone-400 mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-500 mb-4">{copy.noOrders}</p>
                  <Link to="/marketplace">
                    <Button>{copy.startShopping}</Button>
                  </Link>
                </div>
              )}
            </Card>

            {/* Recently Added Products */}
            <Card padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-stone-900">{copy.freshArrivals}</h2>
                <Link to="/marketplace">
                  <Button variant="ghost" size="sm">
                    {copy.viewAll}
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
                  <p className="text-stone-500">{copy.noProducts}</p>
                </div>
              )}
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-stone-900 mb-4">{copy.quickActions}</h2>
              <div className="space-y-3">
                <Link to="/marketplace">
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="w-4 h-4 mr-2" />
                    {copy.searchProducts}
                  </Button>
                </Link>
                <Link to="/orders">
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    {copy.viewOrders}
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start">
                  <Heart className="w-4 h-4 mr-2" />
                    {copy.myFavorites}
                </Button>
                <Link to="/profile">
                  <Button variant="outline" className="w-full justify-start">
                    <MapPin className="w-4 h-4 mr-2" />
                    {copy.updateAddress}
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Trending Categories */}
            <Card padding="lg">
              <h2 className="text-lg font-semibold text-stone-900 mb-4">{copy.popularCategories}</h2>
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
            <Card padding="lg" className="bg-gradient-to-br from-primary-50 to-primary-50 border-primary-100">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Star className="w-5 h-5 text-primary-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-stone-900">{copy.proTip}</h3>
                  <p className="text-sm text-stone-600 mt-1">
                    {copy.tipText}
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

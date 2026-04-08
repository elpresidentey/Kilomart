import { useState, useEffect, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { useCartStore, cartUnitsCount } from '../stores/cartStore'
import { fallbackOnImageError, sanitizeImageUrl, FALLBACK_IMAGE_SRC } from '../lib/image'
import { 
  Leaf, 
  Home,
  ShoppingCart, 
  Truck, 
  ShieldCheck, 
  TrendingUp,
  Menu,
  X,
  ArrowRight,
  CheckCircle2,
  Users,
  User,
  LogOut,
  Search,
  Package,
  CreditCard,
  MapPin,
  Phone,
  Quote,
  Star,
  Mail,
  Award,
  Globe,
  Bot,
  MessageCircle,
  Sprout,
  Beef,
  Wheat,
  Apple,
  Carrot,
  Egg,
  Bean,
  Nut,
} from 'lucide-react'

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, signOut } = useAuth()
  const cartItemCount = useCartStore((s) => cartUnitsCount(s.cart))
  const location = useLocation()
  const navigate = useNavigate()
  const [language, setLanguage] = useState<'en' | 'pidgin'>('en')
  const [headerSearch, setHeaderSearch] = useState('')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'ok' | 'invalid'>('idle')
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [assistantQuery, setAssistantQuery] = useState('')
  const [assistantLoading, setAssistantLoading] = useState(false)
  const [assistantError, setAssistantError] = useState<string | null>(null)
  const [assistantMessages, setAssistantMessages] = useState<Array<{ role: 'assistant' | 'user'; content: string }>>([
    {
      role: 'assistant',
      content:
        'Hi, I am KiloMarket Assistant. Ask me how to order, track deliveries, list products, or understand what KiloMarket does.',
    },
  ])
  const [heroVideoError, setHeroVideoError] = useState(false)

  useEffect(() => {
    if (location.pathname !== '/') return
    const id = location.hash.replace(/^#/, '')
    if (!id) return
    const t = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
    return () => window.clearTimeout(t)
  }, [location.pathname, location.hash])

  const handleLogout = async () => {
    await signOut()
  }

  function submitHeaderSearch(e?: FormEvent) {
    e?.preventDefault()
    const q = headerSearch.trim()
    navigate(q ? `/marketplace?q=${encodeURIComponent(q)}` : '/marketplace')
    setMobileMenuOpen(false)
  }

  async function sendAssistantMessage() {
    const question = assistantQuery.trim()
    if (!question || assistantLoading) return

    const nextUserMessage = { role: 'user' as const, content: question }
    const history = assistantMessages.slice(-6)
    setAssistantQuery('')
    setAssistantError(null)
    setAssistantLoading(true)
    setAssistantMessages((prev) => [...prev, nextUserMessage])

    try {
      const r = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          history,
        }),
      })
      const data = await r.json()
      if (!r.ok || !data?.reply) {
        throw new Error(data?.error || 'Assistant is unavailable right now.')
      }

      setAssistantMessages((prev) => [...prev, { role: 'assistant', content: data.reply as string }])
    } catch (e: any) {
      setAssistantError(e?.message || 'Assistant is unavailable right now.')
      setAssistantMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I am having trouble responding right now. Please try again, or visit Help Center / Contact for urgent support.',
        },
      ])
    } finally {
      setAssistantLoading(false)
    }
  }

  function handleNewsletterSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = newsletterEmail.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setNewsletterStatus('invalid')
      return
    }
    setNewsletterStatus('ok')
    setNewsletterEmail('')
  }

  const copy = {
    en: {
      heroTitleTop: 'Farm Produce,',
      heroTitleBottom: 'Without Market Stress',
      heroSub:
        'KiloMarket helps buyers find trusted produce, pay securely, and get reliable delivery while helping farmers sell faster.',
      featuresHeading: 'Built To Solve Real Market Problems',
      featuresSub:
        'Every workflow is designed around what users struggle with today: trust, payment friction, delivery delays, and confusing interfaces.',
    },
    pidgin: {
      heroTitleTop: 'Fresh Food,',
      heroTitleBottom: 'Without Wahala',
      heroSub:
        'KiloMarket help buyers see trusted produce, pay safely, and get better delivery while farmers fit sell quick quick.',
      featuresHeading: 'We Build Am To Solve Real Wahala',
      featuresSub:
        'We focus on real problems: trust issue, payment stress, delivery delay, and hard-to-use apps.',
    },
  }[language]

  const features = [
    {
      icon: CreditCard,
      title: 'Easy payments',
      description: 'Checkout is simple and clear, with transparent order totals and supported local payment options.',
      color: 'bg-emerald-500',
    },
    {
      icon: Truck,
      title: 'Effective logistics',
      description: 'Delivery flow is designed for speed and accountability, so orders move from farm to doorstep with fewer delays.',
      color: 'bg-primary-500',
    },
    {
      icon: ShieldCheck,
      title: 'Human-first trust',
      description: 'Verified sellers, clear order status, and confidence signals help buyers and farmers trust each transaction.',
      color: 'bg-amber-500',
    },
    {
      icon: Leaf,
      title: 'Intuitive user experience',
      description: 'Clear navigation, quick onboarding, and simple order tracking make the app easy for first-time and repeat users.',
      color: 'bg-blue-500',
    },
  ]

  const howItWorks = [
    {
      step: '01',
      icon: Search,
      title: 'Browse the Market',
      description: 'Explore hundreds of fresh produce listings from verified farmers across Nigeria. Filter by category, location, or quality grade.',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      step: '02',
      icon: Package,
      title: 'Order by Weight',
      description: 'Select exactly how many kilograms you need. Add to cart and proceed to secure checkout with multiple payment options.',
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      step: '03',
      icon: Truck,
      title: 'Get It Delivered',
      description: 'Fresh produce delivered to your door within 24-48 hours. Track your order in real-time from farm to doorstep.',
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ]

  /** Aligned with Supabase `categories` (no seafood). `marketplaceHref` = filter or browse-all for split DB categories. */
  const categories = [
    {
      name: 'Grains & cereals',
      icon: Wheat,
      iconGradient: 'from-amber-500 via-amber-500 to-amber-700',
      surface: 'bg-gradient-to-br from-amber-50 via-amber-50 to-amber-100/90',
      items: 'Rice, Maize, Millet, Sorghum, Fonio',
      count: '2,500+',
      marketplaceHref: '/marketplace?category=Grains',
    },
    {
      name: 'Vegetables',
      icon: Carrot,
      iconGradient: 'from-emerald-500 via-emerald-500 to-emerald-700',
      surface: 'bg-gradient-to-br from-emerald-50 via-emerald-50 to-emerald-100/90',
      items:
        'Ugwu (Efo Riro), Nigerian spinach (Efo Shoko), Jos tomatoes, Peppers (Tatashe + Ata Rodo), Fresh okra',
      count: '1,800+',
      marketplaceHref: '/marketplace?category=Vegetables',
    },
    {
      name: 'Fruits',
      icon: Apple,
      iconGradient: 'from-rose-500 via-rose-500 to-rose-700',
      surface: 'bg-gradient-to-br from-rose-50 via-rose-50 to-rose-100/90',
      items: 'Oranges, Mangoes, Pawpaw, Pineapple, Watermelon, Bananas, Guava',
      count: '1,200+',
      marketplaceHref: '/marketplace?category=Fruits',
    },
    {
      name: 'Tubers & roots',
      icon: Leaf,
      iconGradient: 'from-violet-500 via-violet-600 to-violet-800',
      surface: 'bg-gradient-to-br from-violet-50 via-violet-50 to-violet-100/90',
      items: 'Yam, Cassava, Sweet potato, Irish potato — Plantain listed separately',
      count: '1,400+',
      marketplaceHref: '/marketplace',
    },
    {
      name: 'Beans & legumes',
      icon: Bean,
      iconGradient: 'from-lime-600 via-lime-600 to-green-800',
      surface: 'bg-gradient-to-br from-lime-50 via-lime-50 to-green-100/90',
      items: 'Honey beans, Oloyin, Brown beans, Cowpea, Soybeans',
      count: '950+',
      marketplaceHref: '/marketplace?category=Beans',
    },
    {
      name: 'Poultry & eggs',
      icon: Egg,
      iconGradient: 'from-orange-500 via-orange-500 to-orange-700',
      surface: 'bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100/90',
      items: 'Broilers, Layers, Turkey, Duck, Fresh eggs',
      count: '900+',
      marketplaceHref: '/marketplace?category=Poultry',
    },
    {
      name: 'Livestock',
      icon: Beef,
      iconGradient: 'from-red-500 via-red-500 to-red-800',
      surface: 'bg-gradient-to-br from-red-50 via-red-50 to-red-100/90',
      items: 'Beef, Goat, Ram, Pork (cuts & live where listed)',
      count: '600+',
      marketplaceHref: '/marketplace?category=Livestock',
    },
    {
      name: 'Oil seeds & nuts',
      icon: Nut,
      iconGradient: 'from-amber-700 via-amber-800 to-stone-800',
      surface: 'bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100/90',
      items: 'Groundnut, Sesame, Palm kernel, Shea — oils & kernels',
      count: '480+',
      marketplaceHref: '/marketplace?category=Oil%20Seeds',
    },
  ]

  const testimonials = [
    {
      name: 'Adebayo Johnson',
      role: 'Restaurant Owner, Lagos',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      quote: 'KiloMarket has transformed how I source ingredients. Fresh produce delivered daily, and the per-kilo pricing helps me manage costs better.',
      rating: 5,
    },
    {
      name: 'Chioma Nwosu',
      role: 'Home Cook, Abuja',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
      quote: 'The quality of vegetables is unmatched. I can taste the difference - everything is genuinely farm fresh. Worth every naira!',
      rating: 5,
    },
    {
      name: 'Ibrahim Yusuf',
      role: 'Catering Business, Kano',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
      quote: 'As a caterer, I need consistent supply. KiloMarket connects me directly with reliable farmers. My orders have never been smoother.',
      rating: 5,
    },
  ]

  const trustBadges = [
    { icon: ShieldCheck, title: 'Verified Farmers', desc: 'Every farmer is vetted and certified' },
    { icon: Award, title: 'Quality Assurance', desc: 'Premium grade produce guaranteed' },
    { icon: Truck, title: 'Fast Delivery', desc: '24-48 hours nationwide delivery' },
    { icon: CreditCard, title: 'Secure Payments', desc: 'Multiple safe payment options' },
  ]
  void trustBadges // suppress unused warning

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        {/* Top Bar */}
        <div className="bg-stone-900 text-stone-300 text-xs py-2 hidden lg:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                +234 800 123 4567
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Lagos, Nigeria
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>Free delivery on orders over ₦50,000</span>
              <label className="inline-flex items-center gap-2 text-stone-300">
                <Globe className="w-3.5 h-3.5" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as 'en' | 'pidgin')}
                  className="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-stone-100"
                >
                  <option value="en">English</option>
                  <option value="pidgin">Pidgin</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16 lg:h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 lg:gap-3">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <Leaf className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                </div>
                <div className="hidden sm:block">
                  <span className="text-xl lg:text-2xl font-bold text-stone-900">
                    Kilo<span className="text-emerald-600">Market</span>
                  </span>
                  <p className="text-xs text-stone-500 hidden lg:block">Farm Fresh • Fair Prices</p>
                </div>
              </Link>

              {/* Search Bar - Desktop */}
              <form onSubmit={submitHeaderSearch} className="hidden lg:flex flex-1 max-w-md mx-4">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={headerSearch}
                    onChange={(e) => setHeaderSearch(e.target.value)}
                    placeholder="Search for rice, vegetables, fruits..."
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                </div>
              </form>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-0.5">
                <Link
                  to="/"
                  className="flex items-center gap-1 px-2.5 lg:px-3 py-1.5 rounded-lg text-sm font-medium transition-all bg-emerald-50 text-emerald-700"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden lg:inline">Home</span>
                </Link>
                <a
                  href="#features"
                  className="flex items-center gap-1 px-2.5 lg:px-3 py-1.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-all"
                >
                  <span className="hidden lg:inline">Features</span>
                </a>
                <a
                  href="#how-it-works"
                  className="flex items-center gap-1 px-2.5 lg:px-3 py-1.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-all"
                >
                  <span className="hidden lg:inline">How It Works</span>
                </a>
                <Link
                  to="/marketplace"
                  className="flex items-center gap-1 px-2.5 lg:px-3 py-1.5 rounded-lg text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-all"
                >
                  <span className="hidden lg:inline">Marketplace</span>
                </Link>
              </nav>

              {/* User Actions */}
              <div className="flex items-center gap-2 lg:gap-4">
                {/* Search Button - Mobile */}
                <button className="md:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
                  <Search className="w-5 h-5" />
                </button>

                {/* Cart - visible to all users */}
                <Link to="/cart" className="relative p-2 text-stone-600 hover:text-emerald-600 transition-colors">
                  <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
                  {(cartItemCount ?? 0) > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {(cartItemCount ?? 0) > 9 ? '9+' : cartItemCount}
                    </span>
                  )}
                </Link>

                {user ? (
                  <>
                    <div className="hidden sm:flex items-center gap-3 pl-2 lg:pl-4 border-l border-stone-200">
                      <Link to="/profile" className="flex items-center gap-2 text-stone-600 hover:text-emerald-600 transition-colors">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center border border-emerald-200">
                          <User className="w-4 h-4 text-emerald-700" />
                        </div>
                        <span className="font-medium text-sm hidden lg:block">{user.full_name?.split(' ')[0]}</span>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="text-stone-500 hover:text-stone-900"
                      >
                        <LogOut className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="hidden md:flex items-center gap-2">
                    <Link to="/login">
                      <Button variant="ghost" size="sm" className="text-stone-600">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Mobile Menu Button */}
                <button
                  className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-100 bg-white shadow-lg">
            {/* Mobile Search */}
            <form onSubmit={submitHeaderSearch} className="px-4 py-3 border-b border-stone-100">
              <div className="relative">
                <input
                  type="text"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              </div>
            </form>
            
            <nav className="px-4 py-3 space-y-1">
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-5 h-5" />
                Home
              </Link>
              <a href="#features" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50" onClick={() => setMobileMenuOpen(false)}>
                Features
              </a>
              <a href="#how-it-works" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50" onClick={() => setMobileMenuOpen(false)}>
                How It Works
              </a>
              <Link to="/marketplace" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50" onClick={() => setMobileMenuOpen(false)}>
                Marketplace
              </Link>
              {!user && (
                <div className="pt-3 border-t border-stone-100 space-y-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-center bg-emerald-600 hover:bg-emerald-700">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
              {user && (
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="pt-14 pb-20 lg:pt-16 lg:pb-32 relative overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left Content */}
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-stone-900 leading-tight">
                {copy.heroTitleTop}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-600">
                  {copy.heroTitleBottom}
                </span>
              </h1>

              <p className="text-lg text-stone-600 leading-relaxed max-w-lg">
                {copy.heroSub}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/marketplace">
                  <Button size="lg" className="w-full sm:w-auto group">
                    Explore Marketplace
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                {!user && (
                  <Link to="/signup">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Start Selling
                    </Button>
                  </Link>
                )}
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-6 pt-4">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 border-2 border-white flex items-center justify-center"
                    >
                      <Users className="w-4 h-4 text-stone-500" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <svg
                        key={i}
                        className="w-5 h-5 text-amber-400 fill-current"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-stone-500">
                    Trusted by 10,000+ buyers
                  </p>
                </div>
              </div>
            </div>

            {/* Right Content - Hero Video */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-primary-100 to-emerald-50 rounded-3xl p-3 lg:p-4 shadow-xl">
                <div className="aspect-video rounded-2xl overflow-hidden bg-stone-900">
                  {!heroVideoError ? (
                    <video
                      className="w-full h-full object-cover"
                      src="/hero.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      onError={() => setHeroVideoError(true)}
                    />
                  ) : (
                    <iframe
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/6x1fuxhNOBM?autoplay=1&mute=1&loop=1&playlist=6x1fuxhNOBM"
                      title="KiloMarket intro video"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl p-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm text-stone-500">App walkthrough</p>
                      <p className="text-xl font-bold text-stone-900">Live demo</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-sm font-medium text-primary-700 mb-4">
              <Sprout className="w-4 h-4" />
              Browse by Category
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-stone-900 mb-4">
              Explore Our Product Range
            </h2>
            <p className="text-lg text-stone-600">
              From farm-fresh vegetables to premium grains, find exactly what you need from verified Nigerian farmers.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                to={category.marketplaceHref}
                className={`group flex h-full min-h-[11.5rem] flex-col overflow-hidden rounded-2xl border border-stone-200/80 shadow-sm outline-none transition-all duration-300 hover:border-emerald-300/80 hover:shadow-lg hover:shadow-emerald-100/60 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${category.surface} transform-gpu motion-safe:transition-transform motion-safe:duration-200 hover:-translate-y-0.5 motion-safe:active:scale-[0.99]`}
              >
                <div
                  className="flex h-full w-full flex-col p-5 sm:p-6"
                >
                  <div
                    className={`mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-md ring-1 ring-white/40 transition-transform duration-200 group-hover:scale-105 group-hover:-translate-y-0.5 ${category.iconGradient}`}
                  >
                    <category.icon className="h-6 w-6 text-white drop-shadow-sm" />
                  </div>
                  <h3 className="mb-1 font-semibold text-stone-900">{category.name}</h3>
                  <p className="flex-1 text-sm leading-snug text-stone-600">{category.items}</p>
                  <p className="mt-3 text-xs font-medium text-emerald-700">{category.count} listings</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-stone-900 mb-4">
              {copy.featuresHeading}
            </h2>
            <p className="text-lg text-stone-600">
              {copy.featuresSub}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group p-6 bg-white rounded-2xl border border-stone-100 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-100/50 transition-all duration-300 h-full"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-stone-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-stone-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-32 bg-gradient-to-br from-stone-50 to-primary-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-stone-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-stone-600">
              Getting fresh produce has never been easier. Three simple steps to farm-fresh quality.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step) => (
              <div key={step.step} className="relative">
                <div className="p-8 bg-white rounded-2xl border border-stone-100 h-full hover:shadow-lg hover:border-primary-200 transition-all duration-300">
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-5xl font-bold text-stone-200">
                    {step.step}
                  </span>
                  <h3 className="text-xl font-semibold text-stone-900 mt-4 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-stone-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Farmers Section */}
      <section id="for-farmers" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-emerald-50 to-primary-50 rounded-3xl p-8">
                <div className="space-y-4">
                  {[
                    'Direct access to thousands of buyers',
                    'Fair pricing with no middlemen',
                    'Digital weighing & quality grading',
                    'Secure payments & logistics support',
                    'Real-time market insights',
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                      <p className="text-stone-700">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full">
                <span className="text-sm font-medium text-emerald-700">
                  For Farmers
                </span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-stone-900">
                Grow Your Business with KiloMarket
              </h2>

              <p className="text-lg text-stone-600 leading-relaxed">
                Join 500+ verified farmers already selling on our platform. 
                Get fair prices, reduce waste, and connect directly with buyers 
                who value quality.
              </p>

              {!user && (
                <Link to="/signup">
                  <Button size="lg" className="group">
                    Start Selling Today
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 lg:py-32 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-sm font-medium text-primary-700 mb-4">
              <Star className="w-4 h-4" />
              Customer Reviews
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-stone-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-stone-600">
              Join thousands of satisfied buyers and sellers who trust KiloMarket for their agricultural needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-sm border border-stone-100 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <div className="flex items-start gap-3 mb-6">
                  <Quote className="w-8 h-8 text-primary-200 flex-shrink-0" />
                  <p className="text-stone-600 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <img
                    src={sanitizeImageUrl(testimonial.image) ?? FALLBACK_IMAGE_SRC}
                    alt={testimonial.name}
                    onError={fallbackOnImageError}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-semibold text-stone-900">{testimonial.name}</p>
                    <p className="text-sm text-stone-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Whether you're buying for your home, restaurant, or business, 
            KiloMarket makes it simple and affordable.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/marketplace">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Browse Marketplace
              </Button>
            </Link>
            {!user && (
              <Link to="/signup">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-white text-primary-600 hover:bg-primary-50"
                >
                  Create Account
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-stone-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/20 rounded-full text-primary-300 text-sm mb-4">
                  <Mail className="w-4 h-4" />
                  Stay Updated
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Get Fresh Deals Delivered
                </h3>
                <p className="text-stone-400">
                  Subscribe to our newsletter for exclusive offers, seasonal produce alerts, and farming tips.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-stone-400 focus:outline-none focus:border-primary-500"
                />
                <Button size="lg" className="whitespace-nowrap">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-950 text-stone-400">
        {/* Newsletter Strip */}
        <div className="border-b border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Stay Updated</h3>
                  <p className="text-sm">Get fresh deals and farming tips delivered to your inbox</p>
                </div>
              </div>
              <div className="w-full md:w-auto flex flex-col items-stretch md:items-end gap-2">
                {newsletterStatus === 'ok' ? (
                  <p className="text-sm text-emerald-400 font-medium" role="status">
                    Thanks — you&apos;re on the list. (Demo: no email sent yet.)
                  </p>
                ) : (
                  <form
                    onSubmit={handleNewsletterSubmit}
                    className="flex w-full md:w-auto flex-col sm:flex-row gap-2"
                  >
                    <input
                      type="email"
                      name="email"
                      value={newsletterEmail}
                      onChange={(e) => {
                        setNewsletterEmail(e.target.value)
                        if (newsletterStatus !== 'idle') setNewsletterStatus('idle')
                      }}
                      placeholder="Enter your email"
                      autoComplete="email"
                      aria-invalid={newsletterStatus === 'invalid'}
                      className="flex-1 md:w-64 px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-lg text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-emerald-500"
                    />
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 whitespace-nowrap">
                      Subscribe
                    </Button>
                  </form>
                )}
                {newsletterStatus === 'invalid' && (
                  <p className="text-sm text-red-400">Please enter a valid email address.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Brand Column */}
            <div className="col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <Leaf className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">
                  Kilo<span className="text-emerald-500">Market</span>
                </span>
              </Link>
              <p className="text-sm leading-relaxed mb-6 max-w-xs">
                Nigeria's leading digital marketplace for agricultural produce. 
                Connecting farmers and buyers for fresher, fairer food.
              </p>
              {/* Social Links */}
              <div className="flex items-center gap-3">
                <Link
                  to="/social/facebook"
                  aria-label="Facebook"
                  className="w-9 h-9 bg-stone-900 rounded-lg flex items-center justify-center hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </Link>
                <Link
                  to="/social/x"
                  aria-label="X (Twitter)"
                  className="w-9 h-9 bg-stone-900 rounded-lg flex items-center justify-center hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </Link>
                <Link
                  to="/social/instagram"
                  aria-label="Instagram"
                  className="w-9 h-9 bg-stone-900 rounded-lg flex items-center justify-center hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* For Buyers */}
            <div>
              <h4 className="text-white font-semibold mb-4">For Buyers</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/marketplace" className="hover:text-emerald-500 transition-colors">
                    Browse marketplace
                  </Link>
                </li>
                <li>
                  <Link
                    to={user ? '/orders' : '/login?redirect=/orders'}
                    className="hover:text-emerald-500 transition-colors"
                  >
                    My orders
                  </Link>
                </li>
                <li>
                  <Link to="/#how-it-works" className="hover:text-emerald-500 transition-colors">
                    How to buy
                  </Link>
                </li>
                <li>
                  <Link to="/#features" className="hover:text-emerald-500 transition-colors">
                    Delivery & quality
                  </Link>
                </li>
                <li>
                  <Link to="/#features" className="hover:text-emerald-500 transition-colors">
                    Buyer protection
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Farmers */}
            <div>
              <h4 className="text-white font-semibold mb-4">For Farmers</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/signup" className="hover:text-emerald-500 transition-colors">
                    Start selling
                  </Link>
                </li>
                <li>
                  <Link to="/listings/new" className="hover:text-emerald-500 transition-colors">
                    List your produce
                  </Link>
                </li>
                <li>
                  <Link to="/#for-farmers" className="hover:text-emerald-500 transition-colors">
                    Seller guidelines
                  </Link>
                </li>
                <li>
                  <Link to="/#features" className="hover:text-emerald-500 transition-colors">
                    Pricing & quality tips
                  </Link>
                </li>
                <li>
                  <Link to="/#testimonials" className="hover:text-emerald-500 transition-colors">
                    Success stories
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-emerald-500 transition-colors">
                    Farmer support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/about" className="hover:text-emerald-500 transition-colors">
                    About us
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="hover:text-emerald-500 transition-colors">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link to="/press" className="hover:text-emerald-500 transition-colors">
                    Press
                  </Link>
                </li>
                <li>
                  <Link to="/partners" className="hover:text-emerald-500 transition-colors">
                    Partners
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-emerald-500 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/help" className="hover:text-emerald-500 transition-colors">
                    Help center
                  </Link>
                </li>
                <li>
                  <Link to="/legal/safety" className="hover:text-emerald-500 transition-colors">
                    Safety
                  </Link>
                </li>
                <li>
                  <Link to="/legal/terms" className="hover:text-emerald-500 transition-colors">
                    Terms of service
                  </Link>
                </li>
                <li>
                  <Link to="/legal/privacy" className="hover:text-emerald-500 transition-colors">
                    Privacy policy
                  </Link>
                </li>
                <li>
                  <Link to="/legal/cookies" className="hover:text-emerald-500 transition-colors">
                    Cookie policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-stone-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
              <p>© 2026 KiloMarket. All rights reserved.</p>
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Lagos, Nigeria
                </span>
                <a
                  href="tel:+2348001234567"
                  className="flex items-center gap-2 hover:text-emerald-500 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  +234 800 123 4567
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* AI Helper Widget */}
      <div className="fixed bottom-4 right-4 z-50">
        {assistantOpen && (
          <div className="mb-3 w-80 rounded-2xl border border-stone-200 bg-white shadow-xl">
            <div className="flex items-center gap-2 border-b border-stone-100 p-3">
              <Bot className="h-4 w-4 text-emerald-600" />
              <p className="text-sm font-medium text-stone-900">KiloMarket Assistant</p>
            </div>
            <div className="p-3 space-y-2 text-sm text-stone-700">
              <p className="text-stone-500">Ask basic questions:</p>
              <p className="rounded-lg bg-stone-50 p-2 text-xs">"How do I place an order?"</p>
              <p className="rounded-lg bg-stone-50 p-2 text-xs">"How do I list my products as a farmer?"</p>

              <div className="max-h-56 overflow-y-auto space-y-2 rounded-lg border border-stone-100 bg-stone-50/60 p-2">
                {assistantMessages.map((m, i) => (
                  <div
                    key={`${m.role}-${i}`}
                    className={`rounded-lg px-2.5 py-2 text-xs leading-relaxed ${
                      m.role === 'user' ? 'bg-emerald-600 text-white ml-6' : 'bg-white text-stone-700 mr-6'
                    }`}
                  >
                    {m.content}
                  </div>
                ))}
                {assistantLoading && (
                  <div className="rounded-lg px-2.5 py-2 text-xs bg-white text-stone-500 mr-6">
                    Thinking...
                  </div>
                )}
              </div>

              {assistantError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-md p-2">{assistantError}</p>
              )}

              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  void sendAssistantMessage()
                }}
                className="flex items-center gap-2"
              >
                <input
                  value={assistantQuery}
                  onChange={(e) => setAssistantQuery(e.target.value)}
                  placeholder="Type your question..."
                  className="flex-1 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={assistantLoading || assistantQuery.trim().length === 0}
                >
                  Send
                </Button>
              </form>

              <div className="rounded-lg bg-emerald-50 p-2 text-emerald-800 text-xs">
                Quick links: <Link to="/marketplace" className="underline">Marketplace</Link> ·{' '}
                <Link to="/orders" className="underline">Orders</Link> ·{' '}
                <Link to="/listings/new" className="underline">List Product</Link>
              </div>
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={() => setAssistantOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-3 text-sm font-medium text-white shadow-lg hover:bg-emerald-700"
        >
          <MessageCircle className="h-4 w-4" />
          AI Help
        </button>
      </div>
    </div>
  )
}

import type { FormEvent, ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../lib/utils'
import { useI18n } from '../i18n/useI18n'
import { PageTransition } from './PageTransition'
import { Button } from './ui/Button'
import {
  Store,
  Package,
  User,
  LogOut,
  Menu,
  X,
  ShoppingCart,
  Home,
  Search,
  Phone,
  MapPin,
  LayoutDashboard,
  ClipboardList,
  ChevronDown,
  Globe,
  Warehouse,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useCartStore, cartUnitsCount } from '../stores/cartStore'
import { canAccessBuyerOrders, canAccessOperations } from '../lib/roles'
import type { Language } from '../i18n/strings'

interface LayoutProps {
  children: ReactNode
  cartItemCount?: number
}

export function Layout({ children, cartItemCount }: LayoutProps) {
  const storeCartCount = useCartStore((s) => cartUnitsCount(s.cart))
  const resolvedCartCount = cartItemCount ?? storeCartCount
  const { user, signOut } = useAuth()
  const { language, setLanguage, t } = useI18n()
  function parseLanguage(raw: string): Language {
    if (raw === 'en' || raw === 'ha' || raw === 'yo' || raw === 'ig') return raw
    return 'en'
  }
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [headerSearch, setHeaderSearch] = useState('')
  const [headerElevated, setHeaderElevated] = useState(false)
  const [ordersMenuOpen, setOrdersMenuOpen] = useState(false)
  const [operationsMenuOpen, setOperationsMenuOpen] = useState(false)
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [mobileOrdersOpen, setMobileOrdersOpen] = useState(false)
  const [mobileOperationsOpen, setMobileOperationsOpen] = useState(false)
  const isLandingPage = location.pathname === '/'
  const ordersMenuRef = useRef<HTMLDivElement | null>(null)
  const operationsMenuRef = useRef<HTMLDivElement | null>(null)
  const accountMenuRef = useRef<HTMLDivElement | null>(null)
  const mobileSearchRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    const onScroll = () => setHeaderElevated(window.scrollY > 6)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (location.pathname === '/marketplace') {
      const q = new URLSearchParams(location.search).get('q') || ''
      setHeaderSearch(q)
    }
  }, [location.pathname, location.search])

  useEffect(() => {
    if (location.pathname !== '/marketplace') return
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [location.pathname, location.search])

  useEffect(() => {
    setOrdersMenuOpen(false)
    setOperationsMenuOpen(false)
    setAccountMenuOpen(false)
    setMobileOrdersOpen(false)
    setMobileOperationsOpen(false)
  }, [location.pathname, location.search])

  useEffect(() => {
    if (!ordersMenuOpen) return
    const onPointerDown = (e: MouseEvent) => {
      const el = ordersMenuRef.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) setOrdersMenuOpen(false)
    }
    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [ordersMenuOpen])

  useEffect(() => {
    if (!operationsMenuOpen) return
    const onPointerDown = (e: MouseEvent) => {
      const el = operationsMenuRef.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) setOperationsMenuOpen(false)
    }
    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [operationsMenuOpen])

  useEffect(() => {
    if (!accountMenuOpen) return
    const onPointerDown = (e: MouseEvent) => {
      const el = accountMenuRef.current
      if (!el) return
      if (e.target instanceof Node && !el.contains(e.target)) setAccountMenuOpen(false)
    }
    window.addEventListener('mousedown', onPointerDown)
    return () => window.removeEventListener('mousedown', onPointerDown)
  }, [accountMenuOpen])

  const mainNavigation = user
    ? user.role === 'farmer'
      ? [
          { name: t('nav.home'), href: '/', icon: Home },
          { name: t('nav.marketplace'), href: '/marketplace', icon: Store },
          { name: t('nav.dashboard'), href: '/dashboard', icon: Store },
        ]
      : canAccessOperations(user.role)
        ? [
            { name: t('nav.home'), href: '/', icon: Home },
            { name: t('nav.marketplace'), href: '/marketplace', icon: Store },
          ]
      : [
          { name: t('nav.home'), href: '/', icon: Home },
          { name: t('nav.marketplace'), href: '/marketplace', icon: Store },
          ...(user.role === 'buyer'
            ? [{ name: t('nav.dashboard'), href: '/buyer', icon: LayoutDashboard }]
            : []),
          ...(canAccessBuyerOrders(user.role)
            ? [{ name: t('nav.orders'), href: '/orders', icon: Package }]
            : []),
        ]
    : [
        { name: t('nav.home'), href: '/', icon: Home },
        { name: t('nav.marketplace'), href: '/marketplace', icon: Store },
      ]

  const operationsNavigation = user
    ? user.role === 'farmer'
      ? [
          { name: t('nav.myListings'), href: '/listings', icon: Package },
          { name: t('nav.operations'), href: '/operations', icon: Warehouse },
          { name: t('nav.orders'), href: '/farmer/orders', icon: ClipboardList },
        ]
      : canAccessOperations(user.role)
        ? [{ name: t('nav.operations'), href: '/operations', icon: Warehouse }]
        : []
    : []

  const accountNavigation = user
    ? user.role === 'farmer'
      ? [
          { name: t('nav.dashboard'), href: '/dashboard', icon: Store },
          { name: t('nav.orders'), href: '/farmer/orders', icon: ClipboardList },
        ]
      : user.role === 'buyer'
        ? [
            { name: t('nav.dashboard'), href: '/buyer', icon: LayoutDashboard },
            { name: t('nav.orders'), href: '/orders', icon: Package },
          ]
        : canAccessBuyerOrders(user.role)
          ? [{ name: t('nav.orders'), href: '/orders', icon: Package }]
          : []
    : []

  const submitHeaderSearch = (e: FormEvent) => {
    e.preventDefault()
    const q = headerSearch.trim()
    navigate(q ? `/marketplace?q=${encodeURIComponent(q)}` : '/marketplace')
    setMobileMenuOpen(false)
  }

  const isActive = (path: string) => location.pathname === path

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header
        className={cn(
          'sticky top-0 z-50 border-b border-transparent bg-white/90 backdrop-blur-md transition-[box-shadow,border-color] duration-300 ease-out',
          headerElevated ? 'shadow-md shadow-stone-900/5 border-stone-200/80' : 'shadow-sm'
        )}
      >
        {/* Top Bar */}
        <div className="bg-stone-900 text-stone-300 text-xs py-2 hidden lg:block">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {t('topbar.contactPhone')}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                {t('topbar.location')}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>{t('topbar.freeDelivery')}</span>
              <label className="inline-flex items-center gap-2 text-stone-300">
                <Globe className="w-3.5 h-3.5" />
                <select
                  value={language}
                  onChange={(e) => setLanguage(parseLanguage(e.target.value))}
                  className="bg-stone-900 border border-stone-700 rounded px-2 py-1 text-xs text-stone-100"
                >
                  <option value="en">English</option>
                  <option value="ha">Hausa</option>
                  <option value="yo">Yoruba</option>
                  <option value="ig">Igbo</option>
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
              <Link
                to="/"
                className="flex items-center gap-2 lg:gap-3 rounded-xl tap-highlight-none motion-safe:transition-transform motion-safe:duration-200 motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
              >
                <img
                  src="/logo-farmers-market.png"
                  alt="Farmers Market logo"
                  className="h-11 w-auto sm:h-12 lg:h-14"
                />
              </Link>

              {/* Search Bar - Desktop */}
              <form
                onSubmit={submitHeaderSearch}
                className="hidden lg:flex flex-1 max-w-md mx-4"
              >
                <div className="relative w-full">
                  <input
                    type="search"
                    value={headerSearch}
                    onChange={(e) => setHeaderSearch(e.target.value)}
                    placeholder={t('search.placeholder')}
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-full text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/80 focus-visible:border-primary-200/50 transition-all duration-200"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                </div>
              </form>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-3">
                <nav className="flex items-center gap-0.5">
                  {mainNavigation.map((item) => {
                    const isOrdersDropdown =
                      item.href === '/orders' && user != null && canAccessBuyerOrders(user.role)

                    if (!isOrdersDropdown) {
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={cn(
                            'relative flex items-center gap-1 px-2.5 lg:px-3 py-1.5 rounded-lg text-sm font-medium tap-highlight-none',
                            'motion-safe:transition-all motion-safe:duration-200 motion-safe:active:scale-[0.98]',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                            isActive(item.href)
                              ? 'bg-primary-50 text-primary-700 shadow-sm'
                              : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                          )}
                        >
                          <item.icon
                            className={cn(
                              'w-4 h-4 motion-safe:transition-transform motion-safe:duration-200',
                              isActive(item.href) && 'motion-safe:scale-110'
                            )}
                          />
                          {item.name}
                        </Link>
                      )
                    }

                    const activeOrders =
                      location.pathname === '/orders' || location.pathname.startsWith('/orders/')

                    return (
                      <div key={item.name} className="relative" ref={ordersMenuRef}>
                        <button
                          type="button"
                          aria-label="Orders: open menu for My orders and Pending orders"
                          aria-haspopup="menu"
                          aria-expanded={ordersMenuOpen}
                          onClick={() => setOrdersMenuOpen((v) => !v)}
                          className={cn(
                            'relative flex items-center gap-1 px-2.5 lg:px-3 py-1.5 rounded-lg text-sm font-medium tap-highlight-none',
                            'motion-safe:transition-all motion-safe:duration-200 motion-safe:active:scale-[0.98]',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                            activeOrders
                              ? 'bg-primary-50 text-primary-700 shadow-sm'
                              : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                          )}
                        >
                          <item.icon
                            className={cn(
                              'w-4 h-4 motion-safe:transition-transform motion-safe:duration-200',
                              activeOrders && 'motion-safe:scale-110'
                            )}
                          />
                          {t('nav.ordersDropdown')}
                          <ChevronDown
                            className={cn(
                              'w-4 h-4 ml-0.5 motion-safe:transition-transform motion-safe:duration-200',
                              ordersMenuOpen && 'motion-safe:rotate-180'
                            )}
                          />
                        </button>

                        {ordersMenuOpen && (
                          <div
                            role="menu"
                            className="absolute left-0 mt-2 w-48 rounded-xl border border-stone-200 bg-white shadow-lg shadow-stone-900/10 p-1"
                          >
                            <Link
                              to="/orders"
                              role="menuitem"
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
                              onClick={() => setOrdersMenuOpen(false)}
                            >
                              <Package className="w-4 h-4" />
                              {t('nav.myOrders')}
                            </Link>
                            <Link
                              to="/orders?status=pending"
                              role="menuitem"
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-stone-700 hover:bg-stone-50"
                              onClick={() => setOrdersMenuOpen(false)}
                            >
                              <ClipboardList className="w-4 h-4" />
                              {t('nav.pendingOrders')}
                            </Link>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </nav>

                {operationsNavigation.length > 0 && (
                  <div className="relative" ref={operationsMenuRef}>
                    <button
                      type="button"
                      aria-label="Operations menu"
                      aria-haspopup="menu"
                      aria-expanded={operationsMenuOpen}
                      onClick={() => setOperationsMenuOpen((v) => !v)}
                      className={cn(
                        'flex items-center gap-2 rounded-2xl border border-amber-100 bg-amber-50/80 px-3 py-2 text-sm font-semibold text-amber-800 shadow-sm shadow-amber-950/5',
                        'motion-safe:transition-all motion-safe:duration-200 motion-safe:active:scale-[0.98]',
                        'hover:border-amber-200 hover:bg-amber-50 hover:shadow-md',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2'
                      )}
                    >
                      <Warehouse className="h-4 w-4" />
                      <span>Operations</span>
                      <ChevronDown
                        className={cn(
                          'h-4 w-4 motion-safe:transition-transform motion-safe:duration-200',
                          operationsMenuOpen && 'motion-safe:rotate-180'
                        )}
                      />
                    </button>

                    {operationsMenuOpen && (
                      <div
                        role="menu"
                        className="absolute right-0 mt-2 w-64 rounded-2xl border border-amber-100 bg-white p-2 shadow-xl shadow-stone-900/10"
                      >
                        <div className="px-3 py-2">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700">
                            Operations
                          </p>
                          <p className="mt-1 text-xs text-stone-500">
                            Warehousing, logistics, and inventory tools.
                          </p>
                        </div>
                        <div className="space-y-1">
                          {operationsNavigation.map((item) => (
                            <Link
                              key={item.name}
                              to={item.href}
                              role="menuitem"
                              className={cn(
                                'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium tap-highlight-none',
                                'motion-safe:transition-all motion-safe:duration-200 motion-safe:active:scale-[0.99]',
                                isActive(item.href)
                                  ? 'bg-amber-50 text-amber-800'
                                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                              )}
                              onClick={() => setOperationsMenuOpen(false)}
                            >
                              <item.icon className="h-4 w-4" />
                              <span>{item.name}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Actions */}
              <div className="flex items-center gap-2 lg:gap-4">
                {/* Search Button - Mobile */}
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(true)
                    window.setTimeout(() => mobileSearchRef.current?.focus(), 0)
                  }}
                  aria-label="Open search"
                  className={cn(
                    'md:hidden inline-flex items-center gap-2 rounded-full border border-stone-200 bg-stone-50 px-3 py-2',
                    'text-sm font-medium text-stone-700 shadow-sm tap-highlight-none',
                    'motion-safe:transition-all motion-safe:duration-200 motion-safe:ease-out',
                    'hover:border-stone-300 hover:bg-white hover:text-primary-700 hover:shadow-md',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                    'motion-safe:active:scale-[0.98]'
                  )}
                >
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">Search</span>
                </button>

                {/* Cart - visible to all users */}
                <Link
                  to="/cart"
                  className="relative p-2 rounded-lg text-stone-600 hover:text-primary-600 motion-safe:transition-colors motion-safe:duration-200 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 tap-highlight-none"
                >
                  <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
                  {resolvedCartCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 bg-primary-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md ring-2 ring-white motion-safe:transition-transform motion-safe:duration-200">
                      {resolvedCartCount > 9 ? '9+' : resolvedCartCount}
                    </span>
                  )}
                </Link>

                {user ? (
                  <div
                    ref={accountMenuRef}
                    className="hidden sm:flex items-center gap-2 pl-2 lg:pl-4 border-l border-stone-200"
                  >
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 rounded-full px-2 py-1.5 text-stone-600 hover:text-primary-600 hover:bg-stone-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center border border-primary-200">
                        <User className="w-4 h-4 text-primary-700" />
                      </div>
                      <span className="font-medium text-sm hidden lg:block">
                        {user.full_name?.split(' ')[0]}
                      </span>
                    </Link>

                    {accountNavigation.length > 0 && (
                      <div className="relative">
                        <button
                          type="button"
                          aria-label="Open account menu"
                          aria-haspopup="menu"
                          aria-expanded={accountMenuOpen}
                          onClick={() => setAccountMenuOpen((v) => !v)}
                          className={cn(
                            'inline-flex items-center justify-center rounded-full border border-stone-200 bg-white p-2 text-stone-500 shadow-sm',
                            'motion-safe:transition-all motion-safe:duration-200 motion-safe:active:scale-[0.98]',
                            'hover:border-stone-300 hover:text-stone-800 hover:shadow-md',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2'
                          )}
                        >
                          <ChevronDown
                            className={cn(
                              'h-4 w-4 motion-safe:transition-transform motion-safe:duration-200',
                              accountMenuOpen && 'motion-safe:rotate-180'
                            )}
                          />
                        </button>

                        {accountMenuOpen && (
                          <div
                            role="menu"
                            className="absolute right-0 mt-2 w-56 rounded-2xl border border-stone-200 bg-white p-2 shadow-xl shadow-stone-900/10"
                          >
                            <div className="px-3 py-2">
                              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                                Account
                              </p>
                              <p className="mt-1 text-xs text-stone-500">
                                Quick access to your workspace.
                              </p>
                            </div>
                            <div className="space-y-1">
                              {accountNavigation.map((item) => (
                                <Link
                                  key={item.name}
                                  to={item.href}
                                  role="menuitem"
                                  className={cn(
                                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium tap-highlight-none',
                                    'motion-safe:transition-all motion-safe:duration-200 motion-safe:active:scale-[0.99]',
                                    isActive(item.href)
                                      ? 'bg-stone-50 text-stone-900'
                                      : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                                  )}
                                  onClick={() => setAccountMenuOpen(false)}
                                >
                                  <item.icon className="h-4 w-4" />
                                  <span>{item.name}</span>
                                </Link>
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  setAccountMenuOpen(false)
                                  void signOut()
                                }}
                                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                              >
                                <LogOut className="h-4 w-4" />
                                <span>{t('nav.signOut')}</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="hidden md:flex items-center gap-2">
                    <Link to="/login">
                      <Button variant="ghost" size="sm" className="text-stone-600">
                        {t('nav.signIn')}
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button size="sm" className="bg-primary-600 hover:bg-primary-700 text-white">
                        {t('nav.getStarted')}
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Mobile Menu Button */}
                <button
                  type="button"
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-nav"
                  className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 motion-safe:transition-colors tap-highlight-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  <span className="relative block w-6 h-6">
                    <Menu
                      className={cn(
                        'absolute inset-0 w-6 h-6 motion-safe:transition-all motion-safe:duration-200',
                        mobileMenuOpen ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0'
                      )}
                    />
                    <X
                      className={cn(
                        'absolute inset-0 w-6 h-6 motion-safe:transition-all motion-safe:duration-200',
                        mobileMenuOpen ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90 scale-50'
                      )}
                    />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          id="mobile-nav"
          aria-hidden={!mobileMenuOpen}
          className={cn(
            'md:hidden overflow-hidden border-t bg-white transition-[max-height] duration-300 ease-out-expo',
            mobileMenuOpen
              ? 'max-h-[min(85vh,560px)] border-stone-200 shadow-lg shadow-stone-900/5'
              : 'max-h-0 border-transparent pointer-events-none'
          )}
        >
          <div className="pointer-events-auto">
            <form onSubmit={submitHeaderSearch} className="px-4 py-3 border-b border-stone-100">
              <div className="relative">
                <input
                  type="search"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  placeholder={t('search.placeholderMobile')}
                  ref={mobileSearchRef}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/80 transition-all duration-200"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              </div>
            </form>

            <div className="px-4 py-3 border-b border-stone-100">
              <label className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
                <Globe className="w-5 h-5 text-primary-600 shrink-0" />
                <span className="font-medium">{t('topbar.language')}</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(parseLanguage(e.target.value))}
                  className="ml-auto min-w-0 flex-1 max-w-[10rem] rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/80"
                >
                  <option value="en">English</option>
                  <option value="ha">Hausa</option>
                  <option value="yo">Yoruba</option>
                  <option value="ig">Igbo</option>
                </select>
              </label>
            </div>

            <nav className="px-4 py-3 space-y-4">
              <div className="space-y-1">
                {mainNavigation.map((item) => {
                  const isOrdersDropdown =
                    item.href === '/orders' && user != null && canAccessBuyerOrders(user.role)

                  if (!isOrdersDropdown) {
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium tap-highlight-none',
                          'motion-safe:transition-all motion-safe:duration-200 motion-safe:active:scale-[0.99]',
                          isActive(item.href)
                            ? 'bg-primary-50 text-primary-700'
                            : 'text-stone-600 hover:bg-stone-50'
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    )
                  }

                  const activeOrders = location.pathname === '/orders'

                  return (
                    <div key={item.name} className="rounded-xl">
                      <button
                        type="button"
                        onClick={() => setMobileOrdersOpen((v) => !v)}
                        className={cn(
                          'flex w-full items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium tap-highlight-none',
                          'motion-safe:transition-all motion-safe:duration-200 motion-safe:active:scale-[0.99]',
                          activeOrders ? 'bg-primary-50 text-primary-700' : 'text-stone-600 hover:bg-stone-50'
                        )}
                      >
                        <span className="flex items-center gap-3">
                          <Package className="w-5 h-5" />
                          {t('nav.ordersDropdown')}
                        </span>
                        <ChevronDown
                          className={cn(
                            'w-5 h-5 motion-safe:transition-transform motion-safe:duration-200',
                            mobileOrdersOpen && 'motion-safe:rotate-180'
                          )}
                        />
                      </button>

                      {mobileOrdersOpen && (
                        <div className="mt-1 ml-4 pl-3 border-l border-stone-200 space-y-1">
                          <Link
                            to="/orders"
                            className="block px-4 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {t('nav.myOrders')}
                          </Link>
                          <Link
                            to="/orders?status=pending"
                            className="block px-4 py-2 rounded-lg text-sm text-stone-600 hover:bg-stone-50"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {t('nav.pendingOrders')}
                          </Link>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {operationsNavigation.length > 0 && (
                <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-2">
                  <button
                    type="button"
                    onClick={() => setMobileOperationsOpen((v) => !v)}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-amber-800',
                      'motion-safe:transition-all motion-safe:duration-200 motion-safe:active:scale-[0.99]',
                      'hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2'
                    )}
                  >
                    <span className="flex items-center gap-3">
                      <Warehouse className="h-5 w-5" />
                      Operations
                    </span>
                    <ChevronDown
                      className={cn(
                        'h-5 w-5 motion-safe:transition-transform motion-safe:duration-200',
                        mobileOperationsOpen && 'motion-safe:rotate-180'
                      )}
                    />
                  </button>

                  {mobileOperationsOpen && (
                    <div className="mt-2 space-y-1">
                      {operationsNavigation.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={cn(
                            'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium tap-highlight-none',
                            'motion-safe:transition-all motion-safe:duration-200 motion-safe:active:scale-[0.99]',
                            isActive(item.href)
                              ? 'bg-white text-amber-800 shadow-sm'
                              : 'text-stone-600 hover:bg-white/80'
                          )}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {user && (
                <div className="rounded-2xl border border-stone-200 bg-white p-2 shadow-sm">
                  <div className="px-2 pb-2">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
                      Account
                    </p>
                    <p className="mt-1 text-xs text-stone-500">Profile, dashboard, and sign out.</p>
                  </div>
                  <div className="space-y-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="w-5 h-5" />
                      Profile
                    </Link>
                    {accountNavigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={cn(
                          'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium tap-highlight-none',
                          'motion-safe:transition-all motion-safe:duration-200 motion-safe:active:scale-[0.99]',
                          isActive(item.href)
                            ? 'bg-stone-50 text-stone-900'
                            : 'text-stone-600 hover:bg-stone-50'
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <item.icon className="w-5 h-5" />
                        {item.name}
                      </Link>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        void signOut()
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 motion-safe:transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      {t('nav.signOut')}
                    </button>
                  </div>
                </div>
              )}
              {!user && (
                <div className="pt-3 border-t border-stone-100 space-y-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full justify-center">
                      {t('nav.signIn')}
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-center bg-primary-600 hover:bg-primary-700">
                      {t('nav.getStarted')}
                    </Button>
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={[
          'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
          isLandingPage ? 'py-4 md:py-6' : 'py-6 md:py-8',
        ].join(' ')}
      >
        <PageTransition key={location.pathname}>{children}</PageTransition>
      </main>
    </div>
  )
}

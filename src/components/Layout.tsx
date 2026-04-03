import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { cn } from '../lib/utils'
import { PageTransition } from './PageTransition'
import { Button } from './ui/Button'
import {
  Leaf,
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
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface LayoutProps {
  children: ReactNode
  cartItemCount?: number
}

export function Layout({ children, cartItemCount }: LayoutProps) {
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [headerSearch, setHeaderSearch] = useState('')
  const [headerElevated, setHeaderElevated] = useState(false)
  const isLandingPage = location.pathname === '/'

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

  const navigation = user
    ? user.role === 'farmer'
      ? [
          { name: 'Home', href: '/', icon: Home },
          { name: 'Dashboard', href: '/dashboard', icon: Store },
          { name: 'My Listings', href: '/listings', icon: Package },
          { name: 'Orders', href: '/farmer/orders', icon: ClipboardList },
          { name: 'Profile', href: '/profile', icon: User },
        ]
      : [
          { name: 'Home', href: '/', icon: Home },
          { name: 'Marketplace', href: '/marketplace', icon: Store },
          ...(user.role === 'buyer'
            ? [{ name: 'Dashboard', href: '/buyer', icon: LayoutDashboard }]
            : []),
          { name: 'My Orders', href: '/orders', icon: Package },
          { name: 'Profile', href: '/profile', icon: User },
        ]
    : [
        { name: 'Home', href: '/', icon: Home },
        { name: 'Marketplace', href: '/marketplace', icon: Store },
      ]

  const submitHeaderSearch = (e: React.FormEvent) => {
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
                +234 800 123 4567
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Lagos, Nigeria
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>Free delivery on orders over ₦50,000</span>
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
                className="flex items-center gap-2 lg:gap-3 rounded-xl tap-highlight-none motion-safe:transition-transform motion-safe:duration-200 motion-safe:active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 motion-safe:transition-transform motion-safe:duration-200 motion-safe:hover:scale-105 motion-safe:hover:rotate-[-2deg]">
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
              <form
                onSubmit={submitHeaderSearch}
                className="hidden lg:flex flex-1 max-w-md mx-4"
              >
                <div className="relative w-full">
                  <input
                    type="search"
                    value={headerSearch}
                    onChange={(e) => setHeaderSearch(e.target.value)}
                    placeholder="Search for rice, vegetables, fruits..."
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-full text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80 focus-visible:border-emerald-200/50 transition-all duration-200"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
                </div>
              </form>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-0.5">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'relative flex items-center gap-1 px-2.5 lg:px-3 py-1.5 rounded-lg text-sm font-medium tap-highlight-none',
                      'motion-safe:transition-all motion-safe:duration-200 motion-safe:active:scale-[0.98]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
                      isActive(item.href)
                        ? 'bg-emerald-50 text-emerald-700 shadow-sm'
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
                ))}
              </nav>

              {/* User Actions */}
              <div className="flex items-center gap-2 lg:gap-4">
                {/* Search Button - Mobile */}
                <button className="md:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">
                  <Search className="w-5 h-5" />
                </button>

                {/* Cart - visible to all users */}
                <Link
                  to="/cart"
                  className="relative p-2 rounded-lg text-stone-600 hover:text-emerald-600 motion-safe:transition-colors motion-safe:duration-200 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 tap-highlight-none"
                >
                  <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
                  {(cartItemCount ?? 0) > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 bg-emerald-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md ring-2 ring-white motion-safe:transition-transform motion-safe:duration-200">
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
                        onClick={signOut}
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
                  type="button"
                  aria-expanded={mobileMenuOpen}
                  aria-controls="mobile-nav"
                  className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 motion-safe:transition-colors tap-highlight-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
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
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/80 transition-all duration-200"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              </div>
            </form>

            <nav className="px-4 py-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium tap-highlight-none',
                    'motion-safe:transition-all motion-safe:duration-200 motion-safe:active:scale-[0.99]',
                    isActive(item.href)
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-stone-600 hover:bg-stone-50'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ))}
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
                  type="button"
                  onClick={() => {
                    signOut()
                    setMobileMenuOpen(false)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50 motion-safe:transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
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

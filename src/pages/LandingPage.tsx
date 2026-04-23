import { useState, useEffect, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { useCartStore, cartUnitsCount } from '../stores/cartStore'
import { fallbackOnImageError, sanitizeImageUrl, FALLBACK_IMAGE_SRC } from '../lib/image'
import { useI18n } from '../i18n/useI18n'
import heroVideo from '../../Hero image/4K Cinematic Drone view village Highway l Free  Drone Video l Free stock footage l Copyright free.mp4'
import { 
  Leaf,
  Home,
  ShoppingCart, 
  Truck, 
  ShieldCheck, 
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
  const { language, setLanguage, t } = useI18n()
  function parseLanguage(raw: string) {
    if (raw === 'en' || raw === 'ha' || raw === 'yo' || raw === 'ig') return raw
    return 'en'
  }
  const [headerSearch, setHeaderSearch] = useState('')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'ok' | 'invalid'>('idle')
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

  // TODO(i18n): migrate the rest of LandingPage strings into `src/i18n/strings.ts`.
  // For now, we use a minimal language-aware mapping to avoid breaking the existing UX.
  const copy =
    language === 'ha'
      ? {
          heroTitleTop: 'Kayan Gona,',
          heroTitleBottom: 'Ba Tare Da Wahala Ba',
          heroSub:
            'Farmers Market na taimakawa masu siya su samu kayan gona masu aminci, su biya cikin tsaro, kuma su samu isarwa mai kyau yayin da manoma ke sayarwa da sauri.',
          featuresHeading: 'An Gina Don Magance Matsalolin Kasuwa',
          featuresSub:
            'Dukkanin matakai an tsara su ne bisa matsalolin da mutane ke fuskanta: amincewa, wahalar biya, jinkirin isarwa, da rikice-rikicen amfani.',
        }
      : language === 'yo'
        ? {
            heroTitleTop: 'Oja Ogbin,',
            heroTitleBottom: 'Laisi Wahala Oja',
            heroSub:
              'Farmers Market n ran awon onira lowo lati ri oja to daju, sanwo lailewu, ati gba ifijise to dara nigba ti o tun n ran awon agbe lowo lati ta ni yarayara.',
            featuresHeading: 'A Ko O Lati Yanju Isoro Oja Gidi',
            featuresSub:
              'A se gbogbo irinajo olumulo lori awon isoro ti eniyan maa n koju loni: igbekele, idena isanwo, idaduro ifijise, ati iriri ti ko ye.',
          }
        : language === 'ig'
          ? {
              heroTitleTop: 'Ngwaahia Ugbo,',
              heroTitleBottom: 'Enweghi Nsogbu Ahia',
              heroSub:
                'Farmers Market na-enyere ndi na-azu ahia ichota ngwaahia a puru itukwasi obi, kwuo ugwo nwayoo, ma nweta nnyefe a puru idabere na ya mgbe o na-enyere ndi oru ugbo ire ngwa ngwa.',
              featuresHeading: 'E Wuru Ya Iji Dozie Nsogbu Ahia Gidi',
              featuresSub:
                'E haziri usoro obula dabere na nsogbu ndi mmadu na-enwe taa: ntukwasi obi, nsogbu ugwo, oge nnyefe, na uzo eji ngwa nke na-agbagwoju anya.',
            }
          : {
              heroTitleTop: 'Farm Produce,',
              heroTitleBottom: 'Without Market Stress',
              heroSub:
                'Farmers Market helps buyers find trusted produce, pay securely, and get reliable delivery while helping farmers sell faster.',
              featuresHeading: 'Built To Solve Real Market Problems',
              featuresSub:
                'Every workflow is designed around what users struggle with today: trust, payment friction, delivery delays, and confusing interfaces.',
            }
  const landingUi =
    language === 'ha'
      ? {
          navFeatures: 'Fasali',
          navHow: 'Yadda yake aiki',
          rated: 'Masu siya da manoma sun yaba dandalin nan',
          walkthrough: 'Yawon amfani da app',
          preview: 'Gabatarwar dandali',
          ctaTitle: 'Fara Siya ko Siyarwa Cikin Mintuna',
          stayUpdated: 'Ci gaba da sabuntawa',
          stayUpdatedSub: 'Samu sababbin rangwame da shawarwarin noma a inbox dinka',
          invalidEmail: 'Don Allah shigar da ingantaccen adireshin imel.',
          company: 'Kamfani',
        }
      : language === 'yo'
        ? {
            navFeatures: 'Awon Ise',
            navHow: 'Bawo Lo Se N Sise',
            rated: 'Awon onira ati awon agbe ni igbagbo ninu wa kaakiri Naijiria',
            walkthrough: 'Itosona app',
            preview: 'Akotan platform',
            ctaTitle: 'Bere Rira Tabi Tita Ni Iseju Die',
            stayUpdated: 'Maa Ba Wa Lo Tuntun',
            stayUpdatedSub: 'Gba awon ipese tuntun ati awon imo ogbin sinu imeeli re',
            invalidEmail: 'Jowo te imeeli to pe.',
            company: 'Ile Ise',
          }
        : language === 'ig'
          ? {
              navFeatures: 'Njirimara',
              navHow: 'Otu O Si Aru Oru',
              rated: 'Ndi na-azu na ndi oru ugbo nwere ntụkwasi obi na anyi na Naijiria',
              walkthrough: 'Nkuzi app',
              preview: 'Nlele platform',
              ctaTitle: 'Malite Izu Ma O Bu Ire Nime Nkeji Ole Na Ole',
              stayUpdated: 'Nodu Na Mmelite',
              stayUpdatedSub: 'Nweta ego mbelata ohuru na aro ogbin na email gi',
              invalidEmail: 'Biko tinye email ziri ezi.',
              company: 'Ulo OrU',
            }
          : {
              navFeatures: 'Features',
              navHow: 'How It Works',
              rated: 'Rated highly by buyers and farmers across Nigeria',
              walkthrough: 'App walkthrough',
              preview: 'Platform preview',
              ctaTitle: 'Start Buying or Selling in Minutes',
              stayUpdated: 'Stay Updated',
              stayUpdatedSub: 'Get fresh deals and farming tips delivered to your inbox',
              invalidEmail: 'Please enter a valid email address.',
              company: 'Company',
            }
  const features = [
    {
      icon: CreditCard,
      title: 'Easy Payments',
      description: 'Pay securely with Paystack, bank transfer, or cash on delivery based on what works best for you.',
      color: 'bg-primary-500',
    },
    {
      icon: Truck,
      title: 'Effective Logistics',
      description: 'Real delivery workflows reduce spoilage and keep produce traceable from farm pickup to doorstep.',
      color: 'bg-amber-500',
    },
    {
      icon: Users,
      title: 'Intuitive User Experience',
      description: 'Simple discovery, clear checkout, and transparent order status help first-time and repeat users.',
      color: 'bg-primary-500',
    },
    {
      icon: Globe,
      title: 'Local Language Support',
      description: 'Buyers and farmers can navigate core flows in English, Hausa, Yoruba, and Igbo.',
      color: 'bg-blue-500',
    },
    {
      icon: Mail,
      title: 'Guided Email Confirmation',
      description: 'Signup includes clear confirmation-email onboarding steps so users can activate accounts quickly.',
      color: 'bg-stone-700',
    },
  ]

  const howItWorks = [
    {
      step: '01',
      icon: Search,
      title: 'Find Trusted Produce Fast',
      description: 'Search verified listings by category, location, and quality grade to quickly match your needs.',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      step: '02',
      icon: Package,
      title: 'Order by Weight and Pay Your Way',
      description: 'Set exact kilograms, confirm delivery details, and choose secure payment options with less checkout friction.',
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      step: '03',
      icon: Truck,
      title: 'Track Delivery to Doorstep',
      description: 'Follow each order from farm dispatch to final drop-off and stay updated through completion.',
      color: 'from-primary-500 to-primary-600',
      bgColor: 'bg-primary-50',
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
      iconGradient: 'from-primary-500 via-primary-500 to-primary-700',
      surface: 'bg-gradient-to-br from-primary-50 via-primary-50 to-primary-100/90',
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
      items: 'Yam, Cassava, Sweet potato, Irish potato - Plantain listed separately',
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
      items: 'Groundnut, Sesame, Palm kernel, Shea - oils & kernels',
      count: '480+',
      marketplaceHref: '/marketplace?category=Oil%20Seeds',
    },
  ]

  const testimonials = [
    {
      name: 'Adebayo Johnson',
      role: 'Restaurant Owner, Lagos',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      quote: 'Farmers Market has transformed how I source ingredients. Fresh produce delivered daily, and the per-kilo pricing helps me manage costs better.',
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
      quote: 'As a caterer, I need consistent supply. Farmers Market connects me directly with reliable farmers. My orders have never been smoother.',
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
      <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 shadow-[0_14px_40px_rgba(15,23,42,0.06)] backdrop-blur">
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
        <div className="bg-white/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between gap-3 lg:h-16">
              {/* Logo */}
              <Link
                to="/"
                className="group motion-lift motion-press flex items-center gap-3 rounded-full border border-stone-200 bg-white px-2 py-1.5 pr-4 shadow-[0_10px_30px_rgba(15,23,42,0.08)] hover:border-primary-200 hover:shadow-[0_14px_36px_rgba(15,23,42,0.1)]"
              >
                <div className="pulse-soft flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_10px_24px_rgba(15,23,42,0.12)] ring-1 ring-primary-200/70 sm:h-11 sm:w-11 lg:h-11 lg:w-11">
                  <img
                    src="/logo-farmers-market.png"
                    alt="Farmers Market logo"
                    className="h-8 w-8 rounded-full object-contain brightness-[1.2] contrast-[1.08] saturate-[1.18] sm:h-9 sm:w-9 lg:h-9 lg:w-9"
                  />
                </div>
                <span className="hidden min-w-0 whitespace-nowrap text-[0.98rem] font-semibold leading-none tracking-[-0.01em] text-stone-950 sm:block lg:text-base">
                  Farmers Market
                </span>
              </Link>

              {/* Search Bar - Desktop */}
              <form onSubmit={submitHeaderSearch} className="hidden lg:flex flex-1 max-w-md mx-4">
                <div className="relative w-full">
                  <input
                    type="text"
                    value={headerSearch}
                    onChange={(e) => setHeaderSearch(e.target.value)}
                    placeholder={t('search.placeholder')}
                    className="w-full rounded-full border border-stone-200 bg-stone-50/90 py-3 pl-10 pr-4 text-sm shadow-inner shadow-stone-200/40 transition-all focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                </div>
              </form>

              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1 rounded-full border border-stone-200/80 bg-stone-50/90 p-1 shadow-sm shadow-stone-900/5">
                <Link
                  to="/"
                  className="motion-lift hover-underline-soft flex items-center gap-1 rounded-full bg-white px-3 py-2 text-sm font-medium text-primary-700 shadow-sm"
                >
                  <Home className="w-4 h-4" />
                  <span className="hidden lg:inline">{t('nav.home')}</span>
                </Link>
                <a
                  href="#features"
                  className="motion-lift hover-underline-soft flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-stone-600 transition-all hover:bg-white hover:text-stone-900"
                >
                  <span className="hidden lg:inline">{landingUi.navFeatures}</span>
                </a>
                <a
                  href="#how-it-works"
                  className="motion-lift hover-underline-soft flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-stone-600 transition-all hover:bg-white hover:text-stone-900"
                >
                  <span className="hidden lg:inline">{landingUi.navHow}</span>
                </a>
                <Link
                  to="/marketplace"
                  className="motion-lift hover-underline-soft flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-stone-600 transition-all hover:bg-white hover:text-stone-900"
                >
                  <span className="hidden lg:inline">{t('nav.marketplace')}</span>
                </Link>
              </nav>

              {/* User Actions */}
              <div className="flex items-center gap-2 lg:gap-4">
                {/* Search Button - Mobile */}
                <button className="md:hidden rounded-full border border-stone-200 bg-white p-2 text-stone-600 shadow-sm transition-colors hover:bg-stone-100">
                  <Search className="w-5 h-5" />
                </button>

                {/* Cart - visible to all users */}
                <Link to="/cart" className="motion-lift motion-press relative rounded-full border border-stone-200 bg-white p-2 text-stone-600 shadow-sm transition-colors hover:border-primary-200 hover:text-primary-600">
                  <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6" />
                  {(cartItemCount ?? 0) > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white ring-2 ring-white">
                      {(cartItemCount ?? 0) > 9 ? '9+' : cartItemCount}
                    </span>
                  )}
                </Link>

                {user ? (
                  <>
                    <div className="hidden sm:flex items-center gap-3 pl-2 lg:pl-4 border-l border-stone-200">
                      <Link to="/profile" className="flex items-center gap-2 rounded-full border border-transparent px-2 py-1 text-stone-600 transition-colors hover:border-primary-100 hover:bg-primary-50/60 hover:text-primary-600">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center border border-primary-200">
                          <User className="w-4 h-4 text-primary-700" />
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
                  className="md:hidden rounded-full border border-stone-200 bg-white p-2 text-stone-600 shadow-sm transition-colors hover:bg-stone-100"
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
          <div className="md:hidden border-t border-stone-100 bg-white/95 shadow-lg backdrop-blur">
            {/* Mobile Search */}
            <form onSubmit={submitHeaderSearch} className="px-4 py-3 border-b border-stone-100">
              <div className="relative">
                <input
                  type="text"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                    placeholder={t('search.placeholderMobile')}
                  className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              </div>
            </form>

            <div className="px-4 py-3 border-b border-stone-100">
              <label className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3 text-sm text-stone-700">
                <Globe className="w-5 h-5 text-primary-600 shrink-0" />
                <span className="font-medium">{t('topbar.language')}</span>
                <select
                  value={language}
                  onChange={(e) => setLanguage(parseLanguage(e.target.value))}
                  className="ml-auto min-w-0 flex-1 max-w-[10rem] rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="en">English</option>
                  <option value="ha">Hausa</option>
                  <option value="yo">Yoruba</option>
                  <option value="ig">Igbo</option>
                </select>
              </label>
            </div>
            
            <nav className="px-4 py-3 space-y-1">
              <Link
                to="/"
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-primary-50 text-primary-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-5 h-5" />
                {t('nav.home')}
              </Link>
              <a href="#features" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50" onClick={() => setMobileMenuOpen(false)}>
                {landingUi.navFeatures}
              </a>
              <a href="#how-it-works" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50" onClick={() => setMobileMenuOpen(false)}>
                {landingUi.navHow}
              </a>
              <Link to="/marketplace" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50" onClick={() => setMobileMenuOpen(false)}>
                {t('nav.marketplace')}
              </Link>
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
              {user && (
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50"
                >
                  <LogOut className="w-5 h-5" />
                  {t('nav.signOut')}
                </button>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pb-14 pt-10 lg:pb-20 lg:pt-12">
        {/* Background Decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-[-3rem] top-10 h-72 w-72 rounded-full bg-stone-100/80 blur-3xl" />
          <div className="absolute right-[-4rem] top-24 h-96 w-96 rounded-full bg-stone-100/70 blur-3xl" />
          <div className="absolute bottom-[-5rem] left-1/3 h-72 w-72 rounded-full bg-stone-100/60 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.18fr)] gap-10 lg:gap-14 items-center">
            {/* Left Content */}
            <div className="fade-up space-y-5 lg:space-y-4 max-w-lg">
              <h1 className="text-4xl sm:text-[3.2rem] lg:text-[3.7rem] font-bold text-stone-900 leading-[1.05]">
                {copy.heroTitleTop}
                <span className="block text-primary-700">
                  {copy.heroTitleBottom}
                </span>
              </h1>

              <p className="fade-up fade-up-delay-1 text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl">
                {copy.heroSub}
              </p>

              <div className="fade-up fade-up-delay-2 flex flex-col sm:flex-row gap-4">
                <Link to="/marketplace">
                  <Button size="lg" className="group motion-lift motion-press w-full bg-primary-600 shadow-lg shadow-primary-500/20 sm:w-auto">
                    Explore Marketplace
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                {!user && (
                  <Link to="/signup">
                    <Button variant="outline" size="lg" className="motion-lift motion-press w-full border-stone-300 bg-white/80 sm:w-auto">
                      Start Selling
                    </Button>
                  </Link>
                )}
              </div>

              {/* Trust Badges */}
              <div className="fade-up fade-up-delay-3 flex items-center gap-4 pt-2">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="motion-lift flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-primary-100 via-white to-amber-100 shadow-sm"
                    >
                      <Users className="h-4 w-4 text-primary-700" />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-stone-500">Trusted by verified farmers and active buyers.</p>
              </div>
            </div>

            {/* Right Content - Hero Video */}
            <div className="fade-up fade-up-delay-2 relative w-full">
              <div className="float-soft relative overflow-hidden rounded-[2rem] border border-stone-200/80 bg-white p-3 shadow-[0_28px_80px_rgba(15,23,42,0.14)] lg:p-4">
                <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-white/40 bg-stone-900 shadow-inner shadow-stone-950/40 sm:aspect-[16/11] lg:aspect-[5/4]">
                  {!heroVideoError ? (
                    <video
                      className="w-full h-full object-cover"
                      src={heroVideo}
                      autoPlay
                      muted
                      loop
                      playsInline
                      onError={() => setHeroVideoError(true)}
                    />
                  ) : (
                    <iframe
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/nNjYd1Qh1Ws?autoplay=1&mute=1&loop=1&playlist=nNjYd1Qh1Ws"
                      title="Farmers Market intro video"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-14 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="fade-up text-center max-w-3xl mx-auto mb-10 lg:mb-12">
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
                className={`group motion-lift motion-press flex h-full min-h-[11.5rem] flex-col overflow-hidden rounded-2xl border border-stone-200/80 shadow-sm outline-none transition-all duration-300 hover:border-primary-300/80 hover:shadow-lg hover:shadow-primary-100/60 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 ${category.surface} transform-gpu motion-safe:transition-transform motion-safe:duration-200 hover:-translate-y-0.5 motion-safe:active:scale-[0.99]`}
              >
                <div
                  className="flex h-full w-full flex-col p-5 sm:p-6"
                >
                  {category.images ? (
                    <div className="mb-4 grid h-24 grid-cols-[1.4fr_1fr] gap-2 overflow-hidden rounded-2xl">
                      <img
                        src={category.images[0]}
                        alt={`${category.name} preview 1`}
                        className="h-full w-full rounded-xl object-cover"
                        loading="lazy"
                        onError={fallbackOnImageError}
                      />
                      <img
                        src={category.images[1]}
                        alt={`${category.name} preview 2`}
                        className="h-full w-full rounded-xl object-cover"
                        loading="lazy"
                        onError={fallbackOnImageError}
                      />
                    </div>
                  ) : null}
                  <div
                    className={`mb-4 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-md ring-1 ring-white/40 transition-transform duration-200 group-hover:scale-105 group-hover:-translate-y-0.5 ${category.iconGradient}`}
                  >
                    <category.icon className="h-6 w-6 text-white drop-shadow-sm" />
                  </div>
                  <h3 className="mb-1 font-semibold text-stone-900">{category.name}</h3>
                  <p className="flex-1 text-sm leading-snug text-stone-600">{category.items}</p>
                  <p className="mt-3 text-xs font-medium text-primary-700">{category.count} listings</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="fade-up text-center max-w-3xl mx-auto mb-10 lg:mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-stone-900 mb-4">
              {copy.featuresHeading}
            </h2>
            <p className="text-lg text-stone-600">
              {copy.featuresSub}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group motion-lift p-6 bg-white rounded-2xl border border-stone-100 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-100/50 transition-all duration-300 h-full"
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
      <section id="how-it-works" className="py-14 lg:py-20 bg-gradient-to-br from-stone-50 to-primary-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="fade-up text-center max-w-3xl mx-auto mb-10 lg:mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-stone-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-stone-600">
              Getting fresh produce has never been easier. Three simple steps to farm-fresh quality.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {howItWorks.map((step) => (
              <div key={step.step} className="relative">
                <div className="motion-lift p-8 bg-white rounded-2xl border border-stone-100 h-full hover:shadow-lg hover:border-primary-200 transition-all duration-300">
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
      <section id="for-farmers" className="py-14 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            <div className="order-2 lg:order-1">
              <div className="motion-lift bg-gradient-to-br from-primary-50 to-primary-50 rounded-3xl p-8">
                <div className="space-y-4">
                  {[
                    'Direct access to thousands of buyers',
                    'Fair pricing with no middlemen',
                    'Digital weighing & quality grading',
                    'Secure payments & logistics support',
                    'Real-time market insights',
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-6 h-6 text-primary-500 flex-shrink-0 mt-0.5" />
                      <p className="text-stone-700">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full">
                <span className="text-sm font-medium text-primary-700">
                  For Farmers
                </span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-stone-900">
                Grow Your Business with Farmers Market
              </h2>

              <p className="text-lg text-stone-600 leading-relaxed">
                Join 500+ verified farmers already selling on our platform. 
                Get fair prices, reduce waste, and connect directly with buyers 
                who value quality.
              </p>

              {!user && (
                <Link to="/signup">
                  <Button size="lg" className="group motion-lift motion-press">
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
      <section id="testimonials" className="py-14 lg:py-20 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="fade-up text-center max-w-3xl mx-auto mb-10 lg:mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-sm font-medium text-primary-700 mb-4">
              <Star className="w-4 h-4" />
              Customer Reviews
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-stone-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-lg text-stone-600">
              Join thousands of satisfied buyers and sellers who trust Farmers Market for their agricultural needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="motion-lift bg-white rounded-2xl p-8 shadow-sm border border-stone-100 hover:shadow-lg transition-shadow duration-300"
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
      <section className="py-14 lg:py-20 bg-gradient-to-br from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">{landingUi.ctaTitle}</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Move from signup to verified onboarding quickly, then buy or list produce with clear payments and logistics.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/marketplace">
              <Button size="lg" variant="secondary" className="motion-lift motion-press w-full sm:w-auto">
                Browse Marketplace
              </Button>
            </Link>
            {!user && (
              <Link to="/signup">
                <Button
                  size="lg"
                  className="motion-lift motion-press w-full sm:w-auto bg-white text-primary-600 hover:bg-primary-50"
                >
                  Create Account
                </Button>
              </Link>
            )}
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
                <div className="w-10 h-10 bg-primary-500/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary-500" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">{landingUi.stayUpdated}</h3>
                  <p className="text-sm">{landingUi.stayUpdatedSub}</p>
                </div>
              </div>
              <div className="w-full md:w-auto flex flex-col items-stretch md:items-end gap-2">
                {newsletterStatus === 'ok' ? (
                  <p className="text-sm text-primary-400 font-medium" role="status">
                    Thanks, your request has been received by the Farmers Market team.
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
                      className="flex-1 md:w-64 px-4 py-2.5 bg-stone-900 border border-stone-800 rounded-lg text-sm text-white placeholder:text-stone-500 focus:outline-none focus:border-primary-500"
                    />
                    <Button type="submit" className="bg-primary-600 hover:bg-primary-700 whitespace-nowrap">
                      Subscribe
                    </Button>
                  </form>
                )}
                {newsletterStatus === 'invalid' && (
                  <p className="text-sm text-red-400">{landingUi.invalidEmail}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Footer */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-10">
            {/* Brand Column */}
            <div className="col-span-2">
              <Link
                to="/"
                className="inline-flex items-center gap-3 rounded-full border border-stone-700/80 bg-white px-2 py-1.5 pr-4 shadow-[0_10px_28px_rgba(15,23,42,0.12)]"
              >
                <img
                  src="/logo-farmers-market.png"
                  alt="Farmers Market logo"
                  className="h-12 w-12 rounded-full bg-white object-contain p-1 brightness-110 contrast-110 saturate-125"
                />
                <span className="text-sm font-semibold tracking-[-0.01em] text-white">
                  Farmers Market
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
                  className="w-9 h-9 bg-stone-900 rounded-lg flex items-center justify-center hover:bg-primary-500/10 hover:text-primary-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </Link>
                <Link
                  to="/social/x"
                  aria-label="X (Twitter)"
                  className="w-9 h-9 bg-stone-900 rounded-lg flex items-center justify-center hover:bg-primary-500/10 hover:text-primary-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </Link>
                <Link
                  to="/social/instagram"
                  aria-label="Instagram"
                  className="w-9 h-9 bg-stone-900 rounded-lg flex items-center justify-center hover:bg-primary-500/10 hover:text-primary-500 transition-colors"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* For Buyers */}
            <div>
              <h4 className="text-white font-semibold mb-4">{t('footer.forBuyers')}</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/marketplace" className="hover:text-primary-500 transition-colors">
                    {t('contact.browseMarketplace')}
                  </Link>
                </li>
                <li>
                  <Link
                    to={user ? '/orders' : '/login?redirect=/orders'}
                    className="hover:text-primary-500 transition-colors"
                  >
                    {t('contact.myOrders')}
                  </Link>
                </li>
                <li>
                  <Link to="/#how-it-works" className="hover:text-primary-500 transition-colors">
                    How to buy
                  </Link>
                </li>
                <li>
                  <Link to="/#features" className="hover:text-primary-500 transition-colors">
                    Delivery & quality
                  </Link>
                </li>
                <li>
                  <Link to="/#features" className="hover:text-primary-500 transition-colors">
                    Buyer protection
                  </Link>
                </li>
              </ul>
            </div>

            {/* For Farmers */}
            <div>
              <h4 className="text-white font-semibold mb-4">{t('footer.forFarmers')}</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/signup" className="hover:text-primary-500 transition-colors">
                    Start selling
                  </Link>
                </li>
                <li>
                  <Link to="/listings/new" className="hover:text-primary-500 transition-colors">
                    List your produce
                  </Link>
                </li>
                <li>
                  <Link to="/#for-farmers" className="hover:text-primary-500 transition-colors">
                    Seller guidelines
                  </Link>
                </li>
                <li>
                  <Link to="/#features" className="hover:text-primary-500 transition-colors">
                    Pricing & quality tips
                  </Link>
                </li>
                <li>
                  <Link to="/#testimonials" className="hover:text-primary-500 transition-colors">
                    Success stories
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-primary-500 transition-colors">
                    Farmer support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h4 className="text-white font-semibold mb-4">{landingUi.company}</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/about" className="hover:text-primary-500 transition-colors">
                    About us
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="hover:text-primary-500 transition-colors">
                    {t('careers.title')}
                  </Link>
                </li>
                <li>
                  <Link to="/press" className="hover:text-primary-500 transition-colors">
                    {t('press.title')}
                  </Link>
                </li>
                <li>
                  <Link to="/partners" className="hover:text-primary-500 transition-colors">
                    {t('partners.title')}
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-primary-500 transition-colors">
                    {t('contact.title')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">{t('contact.helpCenter')}</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link to="/help" className="hover:text-primary-500 transition-colors">
                    {t('contact.helpCenter')}
                  </Link>
                </li>
                <li>
                  <Link to="/legal/safety" className="hover:text-primary-500 transition-colors">
                    Safety
                  </Link>
                </li>
                <li>
                  <Link to="/legal/terms" className="hover:text-primary-500 transition-colors">
                    Terms of service
                  </Link>
                </li>
                <li>
                  <Link to="/legal/privacy" className="hover:text-primary-500 transition-colors">
                    Privacy policy
                  </Link>
                </li>
                <li>
                  <Link to="/legal/cookies" className="hover:text-primary-500 transition-colors">
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
              <p>Copyright 2026 Farmers Market. Built by IEL Iduwe Ekene Leonard 2026.</p>
              <div className="flex items-center gap-6">
                <span className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                {t('topbar.location')}
                </span>
                <a
                  href="tel:+2348001234567"
                  className="flex items-center gap-2 hover:text-primary-500 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                {t('topbar.contactPhone')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}

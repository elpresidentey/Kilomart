import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { useCartStore, cartUnitsCount } from '../stores/cartStore'
import { ThreeParticlesField } from '../components/ThreeParticlesField'
import { useI18n } from '../i18n/useI18n'
import { Footer } from '../components/Footer'
import {
  Leaf,
  ShoppingCart,
  Truck,
  ShieldCheck,
  Menu,
  X,
  ArrowRight,
  CheckCircle2,
  Users,
  User,
  Search,
  Package,
  CreditCard,
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
  const navigate = useNavigate()
  const { language, setLanguage, t } = useI18n()
  function parseLanguage(raw: string) {
    if (raw === 'en' || raw === 'ha' || raw === 'yo' || raw === 'ig') return raw
    return 'en'
  }
  const [headerSearch, setHeaderSearch] = useState('')
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'ok' | 'invalid'>('idle')

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
  type LandingCategory = {
    name: string
    icon: typeof Leaf
    iconGradient: string
    surface: string
    items: string
    count: string
    marketplaceHref: string
    images?: string[]
    /** Spans 2 columns (and 2 rows on desktop) in the bento grid */
    featured?: boolean
    /** Spans 2 columns in the bento grid */
    wide?: boolean
  }

  const categories: LandingCategory[] = [
    {
      name: 'Vegetables',
      icon: Carrot,
      iconGradient: 'from-primary-500 via-primary-500 to-primary-700',
      surface: 'bg-gradient-to-br from-primary-50 via-primary-50 to-primary-100/90',
      items:
        'Ugwu (Efo Riro), Nigerian spinach (Efo Shoko), Jos tomatoes, Peppers (Tatashe + Ata Rodo), Fresh okra',
      count: '24+',
      marketplaceHref: '/marketplace?category=Vegetables',
      featured: true,
    },
    {
      name: 'Fruits',
      icon: Apple,
      iconGradient: 'from-rose-500 via-rose-500 to-rose-700',
      surface: 'bg-gradient-to-br from-rose-50 via-rose-50 to-rose-100/90',
      items: 'Oranges, Mangoes, Pawpaw, Pineapple, Watermelon, Bananas, Guava',
      count: '18+',
      marketplaceHref: '/marketplace?category=Fruits',
      wide: true,
    },
    {
      name: 'Grains & cereals',
      icon: Wheat,
      iconGradient: 'from-amber-500 via-amber-500 to-amber-700',
      surface: 'bg-gradient-to-br from-amber-50 via-amber-50 to-amber-100/90',
      items: 'Rice, Maize, Millet, Sorghum, Fonio',
      count: '8+',
      marketplaceHref: '/marketplace?category=Grains',
    },
    {
      name: 'Tubers & roots',
      icon: Leaf,
      iconGradient: 'from-violet-500 via-violet-600 to-violet-800',
      surface: 'bg-gradient-to-br from-violet-50 via-violet-50 to-violet-100/90',
      items: 'Yam, Cassava, Sweet potato, Irish potato - Plantain listed separately',
      count: '32+',
      marketplaceHref: '/marketplace',
    },
    {
      name: 'Beans & legumes',
      icon: Bean,
      iconGradient: 'from-lime-600 via-lime-600 to-green-800',
      surface: 'bg-gradient-to-br from-lime-50 via-lime-50 to-green-100/90',
      items: 'Honey beans, Oloyin, Brown beans, Cowpea, Soybeans',
      count: '12+',
      marketplaceHref: '/marketplace?category=Beans',
    },
    {
      name: 'Poultry',
      icon: Egg,
      iconGradient: 'from-orange-500 via-orange-500 to-orange-700',
      surface: 'bg-gradient-to-br from-orange-50 via-orange-50 to-orange-100/90',
      items: 'Broilers, Layers, Turkey, Duck, Fresh eggs',
      count: '15+',
      marketplaceHref: '/marketplace?category=Poultry',
    },
    {
      name: 'Livestock',
      icon: Beef,
      iconGradient: 'from-red-500 via-red-500 to-red-800',
      surface: 'bg-gradient-to-br from-red-50 via-red-50 to-red-100/90',
      items: 'Beef, Goat, Ram, Pork (cuts & live where listed)',
      count: '10+',
      marketplaceHref: '/marketplace?category=Livestock',
    },
    {
      name: 'Oil seeds & nuts',
      icon: Nut,
      iconGradient: 'from-amber-700 via-amber-800 to-stone-800',
      surface: 'bg-gradient-to-br from-amber-50 via-stone-50 to-amber-100/90',
      items: 'Groundnut, Sesame, Palm kernel, Shea - oils & kernels',
      count: '9+',
      marketplaceHref: '/marketplace?category=Oil%20Seeds',
    },
  ]

  const testimonials = [
    {
      name: 'Adebayo Johnson',
      quote: 'Farmers Market has transformed how I source ingredients. Fresh produce delivered daily, and the per-kilo pricing helps me manage costs better.',
      rating: 5,
    },
    {
      name: 'Chioma Nwosu',
      quote: 'The quality of vegetables is unmatched. I can taste the difference - everything is genuinely farm fresh. Worth every naira!',
      rating: 5,
    },
    {
      name: 'Ibrahim Yusuf',
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
      <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/90 backdrop-blur-xl">
        {/* Top Bar: Language + Scrolling Produce */}
        <div className="bg-primary-950 text-primary-100/80 text-[0.65rem] py-1.5 hidden lg:block overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <label className="inline-flex items-center gap-1.5 shrink-0">
              <Globe className="w-3 h-3 text-primary-400" />
              <select
                value={language}
                onChange={(e) => setLanguage(parseLanguage(e.target.value))}
                className="appearance-none bg-transparent text-[0.65rem] text-primary-200 hover:text-white focus:outline-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="ha">Hausa</option>
                <option value="yo">Yoruba</option>
                <option value="ig">Igbo</option>
              </select>
            </label>
            <div className="flex-1 mx-6 overflow-hidden">
              <div className="marquee flex items-center gap-6 whitespace-nowrap text-primary-300/70">
                <span>Ugwu</span><span className="text-primary-600/40">●</span>
                <span>Fresh Tomatoes</span><span className="text-primary-600/40">●</span>
                <span>Ofada Rice</span><span className="text-primary-600/40">●</span>
                <span>Honey Beans</span><span className="text-primary-600/40">●</span>
                <span>Puna Yam</span><span className="text-primary-600/40">●</span>
                <span>Broiler Chickens</span><span className="text-primary-600/40">●</span>
                <span>Sweet Oranges</span><span className="text-primary-600/40">●</span>
                <span>Plantain</span><span className="text-primary-600/40">●</span>
                <span>Millet</span><span className="text-primary-600/40">●</span>
                <span>Groundnut</span><span className="text-primary-600/40">●</span>
                <span>Goat Meat</span><span className="text-primary-600/40">●</span>
                <span>Scotch Bonnet</span><span className="text-primary-600/40">●</span>
                <span>Egusi Seeds</span><span className="text-primary-600/40">●</span>
                <span>Fresh Eggs</span><span className="text-primary-600/40">●</span>
                <span>Cassava</span><span className="text-primary-600/40">●</span>
                <span>Ugwu</span><span className="text-primary-600/40">●</span>
                <span>Fresh Tomatoes</span><span className="text-primary-600/40">●</span>
                <span>Ofada Rice</span><span className="text-primary-600/40">●</span>
                <span>Honey Beans</span><span className="text-primary-600/40">●</span>
                <span>Puna Yam</span><span className="text-primary-600/40">●</span>
                <span>Broiler Chickens</span><span className="text-primary-600/40">●</span>
                <span>Sweet Oranges</span><span className="text-primary-600/40">●</span>
                <span>Plantain</span><span className="text-primary-600/40">●</span>
                <span>Millet</span><span className="text-primary-600/40">●</span>
                <span>Groundnut</span><span className="text-primary-600/40">●</span>
                <span>Goat Meat</span><span className="text-primary-600/40">●</span>
                <span>Scotch Bonnet</span><span className="text-primary-600/40">●</span>
                <span>Egusi Seeds</span><span className="text-primary-600/40">●</span>
                <span>Fresh Eggs</span><span className="text-primary-600/40">●</span>
                <span>Cassava</span><span className="text-primary-600/40">●</span>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between gap-3">
            {/* Logo */}
            <Link
              to="/"
              className="inline-flex items-center gap-2.5 tap-highlight-none motion-safe:transition-opacity motion-safe:duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 shrink-0"
            >
              <img
                src="/logo-farmers-market.png"
                alt="Farmers Market logo"
                className="h-9 w-auto sm:h-10"
              />
              <span className="hidden sm:flex flex-col leading-none tracking-[-0.01em] text-stone-950">
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-primary-700">Farmers</span>
                <span className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-primary-700">Market</span>
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <form onSubmit={submitHeaderSearch} className="hidden lg:flex flex-1 max-w-sm mx-4">
              <div className="relative w-full">
                <input
                  type="text"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  placeholder={t('search.placeholder')}
                  className="w-full rounded-full border border-stone-200 bg-stone-50/80 py-2 pl-9 pr-4 text-sm transition-all focus:border-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              </div>
            </form>

            {/* Nav + Actions */}
            <div className="flex items-center gap-1">
              <Link
                to="/marketplace"
                className="hidden md:inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
              >
                {t('nav.marketplace')}
              </Link>

              <Link
                to="/cart"
                className="relative rounded-full p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700"
              >
                <ShoppingCart className="w-5 h-5" />
                {(cartItemCount ?? 0) > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white">
                    {(cartItemCount ?? 0) > 9 ? '9+' : cartItemCount}
                  </span>
                )}
              </Link>

              {user ? (
                <div className="flex items-center gap-1 pl-1 border-l border-stone-200 ml-1">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 rounded-full px-2 py-1.5 text-stone-600 transition-colors hover:bg-stone-100 hover:text-stone-900"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-50 flex items-center justify-center border border-primary-200/80">
                      <User className="w-4 h-4 text-primary-700" />
                    </div>
                    <span className="hidden lg:block text-sm font-medium">{user.full_name?.split(' ')[0]}</span>
                  </Link>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-stone-200 ml-1">
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
                className="md:hidden rounded-full p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-700 ml-1"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-100 bg-white/95 backdrop-blur-xl">
            {/* Mobile Search */}
            <form onSubmit={submitHeaderSearch} className="px-4 py-3">
              <div className="relative">
                <input
                  type="text"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  placeholder={t('search.placeholderMobile')}
                  className="w-full pl-10 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-300 transition-all"
                />
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              </div>
            </form>

            <nav className="px-3 pb-3 space-y-0.5">
              <Link
                to="/marketplace"
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.marketplace')}
              </Link>

              <div className="px-3 py-2">
                <label className="flex items-center gap-2 text-xs text-stone-500">
                  <Globe className="w-3.5 h-3.5" />
                  <select
                    value={language}
                    onChange={(e) => setLanguage(parseLanguage(e.target.value))}
                    className="bg-transparent text-xs text-stone-700 focus:outline-none cursor-pointer"
                  >
                    <option value="en">English</option>
                    <option value="ha">Hausa</option>
                    <option value="yo">Yoruba</option>
                    <option value="ig">Igbo</option>
                  </select>
                </label>
              </div>

              {!user && (
                <div className="pt-2 border-t border-stone-100 mt-2 space-y-1.5 px-1">
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
                <>
                  <Link
                    to="/profile"
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout()
                      setMobileMenuOpen(false)
                    }}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-600 hover:bg-stone-50"
                  >
                    {t('nav.signOut')}
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pb-12 pt-8 lg:pb-16 lg:pt-10">
        {/* Background Decorations */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-[-3rem] top-10 h-72 w-72 rounded-full bg-stone-100/80 blur-3xl" />
          <div className="absolute right-[-4rem] top-24 h-96 w-96 rounded-full bg-stone-100/70 blur-3xl" />
          <div className="absolute bottom-[-5rem] left-1/3 h-72 w-72 rounded-full bg-stone-100/60 blur-3xl" />
          <div className="absolute left-1/4 top-1/3 h-80 w-80 blur-3xl" />
          {/* Premium accent glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl bg-primary-600/10 w-96 h-96 opacity-80" />
          <div className="absolute bottom-0 right-0 -z-10 opacity-15">
            <div className="rounded-full blur-3xl bg-leaf-500/10 w-80 h-80" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.18fr)] lg:gap-12">
            {/* Left Content */}
            <div className="fade-up max-w-lg space-y-5 lg:space-y-5">
              <span className="inline-flex w-fit items-center gap-2 rounded-full border border-primary-200/70 bg-primary-50/80 px-4 py-1.5 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-primary-800 shadow-sm shadow-primary-600/5 backdrop-blur">
                <Sprout className="h-3.5 w-3.5" />
                Fresh from the Farm
              </span>

              <h1 className="text-balance text-3xl sm:text-[2.2rem] lg:text-[2.6rem] font-extrabold text-stone-900 leading-[1.1] tracking-[-0.02em]">
                {copy.heroTitleTop}
                <span className="block bg-gradient-to-r from-primary-700 via-primary-600 to-leaf-600 bg-clip-text pb-1 text-transparent">
                  {copy.heroTitleBottom}
                </span>
              </h1>

              <p className="fade-up fade-up-delay-1 text-base text-stone-600 leading-relaxed max-w-xl">
                {copy.heroSub}
              </p>

              <div className="fade-up fade-up-delay-2 flex flex-col gap-3 sm:flex-row sm:gap-4">
                <Link to="/marketplace">
                  <Button size="lg" className="group motion-lift motion-press w-full sm:w-auto">
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
              <div className="fade-up fade-up-delay-3 flex items-center gap-4 pt-1">
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

              {/* Hero Stats */}
              <dl className="fade-up fade-up-delay-3 grid grid-cols-3 divide-x divide-stone-200/80 rounded-2xl border border-stone-200/70 bg-white/70 shadow-soft backdrop-blur-sm">
                {[
                  { value: '100+', label: 'Produce listings' },
                  { value: '25+', label: 'Verified farmers' },
                  { value: '24–48h', label: 'Nationwide delivery' },
                ].map((stat) => (
                  <div key={stat.label} className="px-3 py-4 text-center first:rounded-l-2xl last:rounded-r-2xl">
                    <dd className="order-1 text-base font-bold tabular-nums text-stone-900 sm:text-base">
                      {stat.value}
                    </dd>
                    <dt className="order-2 mt-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-stone-500">
                      {stat.label}
                    </dt>
                  </div>
                ))}
              </dl>
            </div>

            {/* Right Content - Hero Image */}
            <div className="fade-up fade-up-delay-2 relative w-full">
              <div className="float-soft relative rounded-2xl bg-gradient-to-br from-primary-200/80 via-stone-100 to-amber-200/70 p-2 shadow-[0_32px_90px_rgba(15,23,42,0.16)]">
                <div className="relative overflow-hidden rounded-xl bg-white p-3 lg:p-4">
                  <ThreeParticlesField className="pointer-events-none absolute inset-0 z-0 opacity-70" />
                <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-white/40 bg-stone-900 shadow-inner shadow-stone-950/40 sm:aspect-[16/11] lg:aspect-[5/4]">
                  <img
                    src="/hero-farmers.jpg"
                    alt="Nigerian women farmers working in a lush green field"
                    className="relative z-10 w-full h-full object-cover"
                  />

                  {/* Floating glass chips */}
                  <div className="pointer-events-none absolute left-4 top-4 z-20 hidden items-center gap-1.5 rounded-full border border-white/40 bg-white/85 px-3 py-1.5 text-xs font-semibold text-stone-800 shadow-lg shadow-stone-900/10 backdrop-blur sm:flex">
                    <ShieldCheck className="h-3.5 w-3.5 text-primary-600" />
                    Quality checked
                  </div>
                  <div className="pointer-events-none absolute bottom-4 right-4 z-20 hidden items-center gap-1.5 rounded-full border border-white/40 bg-white/85 px-3 py-1.5 text-xs font-semibold text-stone-800 shadow-lg shadow-stone-900/10 backdrop-blur sm:flex">
                    <Truck className="h-3.5 w-3.5 text-primary-600" />
                    Free delivery · 24–48h
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="text-center max-w-3xl mx-auto mb-8 lg:mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-sm font-medium text-primary-700 mb-4">
              <Sprout className="w-4 h-4" />
              Browse by Category
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-[1.7rem] font-bold text-stone-900 mb-4">
              Explore Our Product Range
            </h2>
            <p className="text-base text-stone-600">
              From farm-fresh vegetables to premium grains, find exactly what you need from verified Nigerian farmers.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:auto-rows-[13rem] lg:grid-cols-4">
            {categories.map((category, index) => (
              <Link
                key={category.name}
                to={category.marketplaceHref}
                data-reveal
                data-reveal-delay={(index % 4) * 70}
                className={`group motion-lift motion-press relative flex h-full min-h-[10.5rem] transform-gpu flex-col overflow-hidden rounded-2xl border border-stone-200/80 shadow-sm outline-none transition-all duration-300 hover:-translate-y-0.5 hover:border-primary-300/80 hover:shadow-lg hover:shadow-primary-100/60 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 motion-safe:active:scale-[0.99] ${category.featured ? 'col-span-2 lg:row-span-2' : ''} ${category.wide ? 'col-span-2' : ''} ${category.surface}`}
              >
                {/* Oversized watermark icon */}
                <category.icon
                  aria-hidden
                  className={`pointer-events-none absolute -bottom-5 -right-5 rotate-12 text-stone-900 opacity-[0.05] transition-transform duration-500 ease-out motion-safe:group-hover:rotate-6 motion-safe:group-hover:scale-110 ${category.featured ? 'h-40 w-40' : 'h-24 w-24'}`}
                />

                {category.featured ? (
                  <div className="relative flex h-full flex-col p-5 sm:p-6">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/50 blur-2xl"
                    />
                    <div className={`mb-5 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br shadow-md ring-1 ring-white/40 transition-transform duration-200 group-hover:scale-105 group-hover:-translate-y-0.5 ${category.iconGradient}`}>
                      <category.icon className="h-7 w-7 text-white drop-shadow-sm" />
                    </div>
                    <h3 className="mb-1.5 text-xl font-bold text-stone-900">{category.name}</h3>
                    <p className="max-w-sm text-sm leading-relaxed text-stone-600">{category.items}</p>
                    <div className="mt-auto flex items-center justify-between pt-4">
                      <span className="inline-flex items-center rounded-full bg-white/70 px-3 py-1 text-xs font-semibold text-primary-700 ring-1 ring-inset ring-primary-600/10 backdrop-blur-sm">
                        {category.count} listings
                      </span>
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary-700">
                        Shop now
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                ) : category.wide ? (
                  <div className="relative flex h-full items-center gap-4 p-5">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-md ring-1 ring-white/40 transition-transform duration-200 group-hover:scale-105 group-hover:-translate-y-0.5 ${category.iconGradient}`}>
                      <category.icon className="h-6 w-6 text-white drop-shadow-sm" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-stone-900">{category.name}</h3>
                      <p className="mt-0.5 line-clamp-2 text-sm leading-snug text-stone-600">{category.items}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-semibold text-primary-700 ring-1 ring-inset ring-primary-600/10">
                          {category.count} listings
                        </span>
                        <ArrowRight className="h-4 w-4 text-primary-600 transition-transform duration-300 motion-safe:group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative flex h-full flex-col p-4 sm:p-5">
                    <div className={`mb-2.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-md ring-1 ring-white/40 transition-transform duration-200 group-hover:scale-105 group-hover:-translate-y-0.5 ${category.iconGradient}`}>
                      <category.icon className="h-5 w-5 text-white drop-shadow-sm" />
                    </div>
                    <h3 className="mb-1 text-base font-semibold leading-tight text-stone-900">{category.name}</h3>
                    <p className="line-clamp-2 flex-1 text-xs leading-snug text-stone-600 sm:text-sm">{category.items}</p>
                    <span className="mt-2.5 inline-flex w-fit items-center rounded-full bg-white/70 px-2.5 py-0.5 text-xs font-semibold text-primary-700 ring-1 ring-inset ring-primary-600/10">
                      {category.count} listings
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="text-center max-w-3xl mx-auto mb-8 lg:mb-10">
            <h2 className="text-xl sm:text-2xl lg:text-[1.7rem] font-bold text-stone-900 mb-4">
              {copy.featuresHeading}
            </h2>
            <p className="text-base text-stone-600">
              {copy.featuresSub}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                data-reveal
                data-reveal-delay={(index % 3) * 80}
                className="group motion-lift p-5 sm:p-6 bg-white rounded-2xl border border-stone-100 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-100/50 transition-all duration-300 h-full"
              >
                <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-semibold text-stone-900 mb-2">
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
      <section id="how-it-works" className="py-12 lg:py-16 bg-gradient-to-br from-stone-50 to-primary-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="text-center max-w-3xl mx-auto mb-8 lg:mb-10">
            <h2 className="text-xl sm:text-2xl lg:text-[1.7rem] font-bold text-stone-900 mb-4">
              How It Works
            </h2>
            <p className="text-base text-stone-600">
              Getting fresh produce has never been easier. Three simple steps to farm-fresh quality.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {howItWorks.map((step, index) => (
              <div key={step.step} data-reveal data-reveal-delay={index * 110} className="relative">
                <div className="motion-lift p-6 bg-white rounded-2xl border border-stone-100 h-full hover:shadow-lg hover:border-primary-200 transition-all duration-300">
                  <div className={`w-14 h-14 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-5 shadow-lg`}>
                    <step.icon className="w-7 h-7 text-white" />
                  </div>
                  <span className="text-4xl font-bold text-stone-200">
                    {step.step}
                  </span>
                  <h3 className="text-base font-semibold text-stone-900 mt-3 mb-2">
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
      <section id="for-farmers" className="py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            <div className="order-2 lg:order-1" data-reveal>
              <div className="motion-lift bg-gradient-to-br from-primary-50 to-primary-50 rounded-3xl p-6 lg:p-8">
                <div className="space-y-4">
                  {[
                    'Direct access to thousands of buyers',
                    'Fair pricing with no middlemen',
                    'Digital weighing & quality grading',
                    'Secure payments & logistics support',
                    'Real-time market insights',
                  ].map((benefit, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                      <p className="text-stone-700">{benefit}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6" data-reveal data-reveal-delay="90">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full">
                <span className="text-sm font-medium text-primary-700">
                  For Farmers
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl lg:text-[1.7rem] font-bold text-stone-900">
                Grow Your Business with Farmers Market
              </h2>

              <p className="text-base text-stone-600 leading-relaxed">
                Join 25+ verified farmers already selling on our platform. 
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
      <section id="testimonials" className="py-12 lg:py-16 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div data-reveal className="text-center max-w-3xl mx-auto mb-8 lg:mb-10">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 rounded-full text-sm font-medium text-primary-700 mb-4">
              <Star className="w-4 h-4" />
              Customer Reviews
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-[1.7rem] font-bold text-stone-900 mb-4">
              What Our Customers Say
            </h2>
            <p className="text-base text-stone-600">
              Join hundreds of satisfied buyers and sellers who trust Farmers Market for their agricultural needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                data-reveal
                data-reveal-delay={index * 90}
                className="motion-lift bg-white rounded-2xl p-6 shadow-sm border border-stone-100 hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <div className="flex items-start gap-3 mb-6">
                  <Quote className="w-6 h-6 text-primary-200 flex-shrink-0" />
                  <p className="text-stone-600 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                </div>
                <div className="pt-1">
                  <p className="font-semibold text-stone-900">{testimonial.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 lg:py-16 bg-gradient-to-br from-primary-600 to-primary-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" data-reveal>
          <h2 className="text-xl sm:text-2xl lg:text-[1.7rem] font-bold text-white mb-6">{landingUi.ctaTitle}</h2>
          <p className="text-base text-primary-100 mb-8 max-w-2xl mx-auto lg:text-base">
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

      {/* Newsletter — slim, light, not part of dark footer */}
      <section className="border-y border-stone-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-50 text-primary-700 ring-1 ring-primary-100">
                <Mail className="h-4 w-4" />
              </span>
              <div>
                <h3 className="text-sm font-semibold text-stone-900">{landingUi.stayUpdated}</h3>
                <p className="text-sm text-stone-500">{landingUi.stayUpdatedSub}</p>
              </div>
            </div>
            <div className="w-full sm:w-auto sm:min-w-[360px]">
              {newsletterStatus === 'ok' ? (
                <p className="rounded-xl bg-primary-50 px-4 py-2.5 text-sm font-medium text-primary-700 ring-1 ring-primary-100" role="status">
                  Thanks — your request has been received by the Farmers Market team.
                </p>
              ) : (
                <>
                  <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
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
                      className="min-w-0 flex-1 rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:border-primary-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />
                    <Button type="submit" className="shrink-0 bg-primary-600 hover:bg-primary-700">
                      Subscribe
                    </Button>
                  </form>
                  {newsletterStatus === 'invalid' && (
                    <p className="mt-1.5 text-xs text-red-600">{landingUi.invalidEmail}</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />

    </div>
  )
}

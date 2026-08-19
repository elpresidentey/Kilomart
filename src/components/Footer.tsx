import { Link } from 'react-router-dom'
import { Leaf, AtSign, Camera, ThumbsUp, MessageCircle, Mail, Phone, MapPin, ArrowRight } from 'lucide-react'
import { useI18n } from '../i18n/useI18n'

const socialLinks = [
  { label: 'Twitter', href: '/social/twitter', icon: AtSign },
  { label: 'Instagram', href: '/social/instagram', icon: Camera },
  { label: 'Facebook', href: '/social/facebook', icon: ThumbsUp },
  { label: 'WhatsApp', href: '/social/whatsapp', icon: MessageCircle },
]

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="relative overflow-hidden bg-primary-950 text-primary-100/80">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 left-1/4 h-96 w-[42rem] rounded-full bg-primary-600/20 blur-3xl" />
        <div className="absolute -bottom-24 right-0 h-72 w-96 rounded-full bg-leaf-600/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 lg:pt-20 pb-8">
        <div className="grid gap-12 lg:gap-8 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-lg shadow-primary-900/40 ring-1 ring-inset ring-white/20">
                <Leaf className="h-6 w-6 text-white" />
              </span>
              <span className="text-xl font-semibold text-white">Fresh from the Farm</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-primary-200/80">
              {t('footer.brandDescription')}
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-primary-300" />
                <a href="tel:+2348001234567" className="hover:text-white transition-colors">{t('topbar.contactPhone')}</a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary-300" />
                <a href="mailto:hello@freshfromthefarm.ng" className="hover:text-white transition-colors">hello@freshfromthefarm.ng</a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-primary-300" />
                {t('topbar.location')}
              </li>
            </ul>
            <div className="mt-6 flex items-center gap-2">
              {socialLinks.map(({ label, href, icon: Icon }) => (
                <Link
                  key={label}
                  to={href}
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-inset ring-white/10 text-primary-200 transition-all duration-200 hover:bg-primary-500 hover:text-white hover:-translate-y-0.5 hover:ring-primary-400"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div className="lg:col-span-2">
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white">Shop</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/marketplace" className="hover:text-white transition-colors">Marketplace</Link></li>
              <li><Link to="/#how-it-works" className="hover:text-white transition-colors">How it works</Link></li>
              <li><Link to="/cart" className="hover:text-white transition-colors">Your cart</Link></li>
              <li><Link to="/help" className="hover:text-white transition-colors">Help center</Link></li>
            </ul>
          </div>

          {/* For Farmers */}
          <div className="lg:col-span-2">
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white">{t('footer.forFarmers')}</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/signup" className="hover:text-white transition-colors">Start selling</Link></li>
              <li><Link to="/listings/new" className="hover:text-white transition-colors">List your produce</Link></li>
              <li><Link to="/#for-farmers" className="hover:text-white transition-colors">Seller guidelines</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Farmer support</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white">Company</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/about" className="hover:text-white transition-colors">About us</Link></li>
              <li><Link to="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link to="/press" className="hover:text-white transition-colors">Press</Link></li>
              <li><Link to="/partners" className="hover:text-white transition-colors">Partners</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="lg:col-span-2">
            <h4 className="mb-5 text-sm font-semibold uppercase tracking-[0.18em] text-white">Support</h4>
            <ul className="space-y-3 text-sm">
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact us</Link></li>
              <li><Link to="/legal/privacy" className="hover:text-white transition-colors">Privacy policy</Link></li>
              <li><Link to="/legal/terms" className="hover:text-white transition-colors">Terms of service</Link></li>
              <li><Link to="/social/whatsapp" className="inline-flex items-center gap-1.5 text-primary-300 hover:text-white transition-colors">
                Newsletter <ArrowRight className="h-3.5 w-3.5" />
              </Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-primary-300/70 sm:flex-row">
          <p>© {new Date().getFullYear()} Fresh from the Farm. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            <Leaf className="h-3.5 w-3.5 text-primary-400" />
            Grown with care, delivered with trust
          </p>
        </div>
      </div>
    </footer>
  )
}

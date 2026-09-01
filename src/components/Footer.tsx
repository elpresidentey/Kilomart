import { Link } from 'react-router-dom'
import { Leaf, Mail, MapPin, ArrowUpRight } from 'lucide-react'
import { useI18n } from '../i18n/useI18n'

export function Footer() {
  const { t } = useI18n()

  return (
    <footer className="relative overflow-hidden bg-primary-950 text-primary-100/75">
      {/* single, subtle glow — not the double-blur wall before */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-primary-700/15 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* main grid — brand gets breathing room, link cols are tight */}
        <div className="grid gap-10 py-12 lg:grid-cols-12 lg:gap-8 lg:py-14">
          {/* Brand — now single contact line + lighter socials */}
          <div className="lg:col-span-5">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-primary-900 shadow-sm ring-1 ring-white/10">
                <Leaf className="h-5 w-5" />
              </span>
              <span className="text-[17px] font-semibold tracking-tight text-white">Farmers Market</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-primary-200/70">
              {t('footer.brandDescription')}
            </p>

            {/* one-line contact — not a stacked 3-item list */}
            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              <a
                href="mailto:hello@freshfromthefarm.ng"
                className="inline-flex items-center gap-1.5 text-primary-200/80 transition-colors hover:text-white"
              >
                <Mail className="h-3.5 w-3.5 opacity-70" />
                hello@freshfromthefarm.ng
              </a>
              <span className="hidden h-3 w-px bg-white/10 sm:block" aria-hidden />
              <span className="inline-flex items-center gap-1.5 text-primary-200/60">
                <MapPin className="h-3.5 w-3.5 opacity-70" />
                {t('topbar.location')}
              </span>
            </div>

            {/* socials — 3 compact buttons, not 4 large translate-y cards */}
            <div className="mt-5 flex items-center gap-2">
              <Link
                to="/social/twitter"
                aria-label="X (Twitter)"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-primary-200 ring-1 ring-white/[0.08] transition-colors hover:bg-white hover:text-primary-900"
              >
                <span className="text-[11px] font-bold tracking-tight">𝕏</span>
              </Link>
              <Link
                to="/social/instagram"
                aria-label="Instagram"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-primary-200 ring-1 ring-white/[0.08] transition-colors hover:bg-white hover:text-primary-900"
              >
                <span className="text-[11px] font-semibold">IG</span>
              </Link>
              <Link
                to="/social/facebook"
                aria-label="Facebook"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/[0.06] text-primary-200 ring-1 ring-white/[0.08] transition-colors hover:bg-white hover:text-primary-900"
              >
                <span className="text-[11px] font-bold">f</span>
              </Link>
              <a
                href="tel:+2348001234567"
                className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-primary-300 transition-colors hover:text-white"
              >
                {t('topbar.contactPhone')} <ArrowUpRight className="h-3 w-3" />
              </a>
            </div>
          </div>

          {/* Explore — 3 links */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/90">Explore</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/marketplace" className="text-primary-200/70 transition-colors hover:text-white">
                  Marketplace
                </Link>
              </li>
              <li>
                <Link to="/#how-it-works" className="text-primary-200/70 transition-colors hover:text-white">
                  How it works
                </Link>
              </li>
              <li>
                <Link to="/help" className="text-primary-200/70 transition-colors hover:text-white">
                  Help center
                </Link>
              </li>
            </ul>
          </div>

          {/* Sell — 3 links */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/90">
              {t('footer.forFarmers')}
            </h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/signup" className="text-primary-200/70 transition-colors hover:text-white">
                  Start selling
                </Link>
              </li>
              <li>
                <Link to="/listings/new" className="text-primary-200/70 transition-colors hover:text-white">
                  List produce
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-200/70 transition-colors hover:text-white">
                  Farmer support
                </Link>
              </li>
            </ul>
          </div>

          {/* Company — 3 links, not 5 */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-white/90">Company</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="text-primary-200/70 transition-colors hover:text-white">
                  About us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-200/70 transition-colors hover:text-white">
                  Contact
                </Link>
              </li>
              <li className="flex items-center gap-3">
                <Link to="/careers" className="text-primary-200/70 transition-colors hover:text-white">
                  Careers
                </Link>
                <span className="h-1 w-1 rounded-full bg-white/20" aria-hidden />
                <Link to="/partners" className="text-primary-200/70 transition-colors hover:text-white">
                  Partners
                </Link>
              </li>
            </ul>
            <p className="mt-6 max-w-xs text-xs leading-relaxed text-primary-300/50">
              Verified farmers · fair kg pricing · reliable delivery.
            </p>
          </div>
        </div>

        {/* bottom bar — legal links inline, not a 4th column */}
        <div className="flex flex-col gap-3 border-t border-white/[0.07] py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p className="order-2 text-primary-300/50 sm:order-1">
            © {new Date().getFullYear()} Farmers Market. All rights reserved.
          </p>

          <div className="order-1 flex flex-wrap items-center gap-x-4 gap-y-1 sm:order-2">
            <Link to="/legal/privacy" className="text-primary-300/60 transition-colors hover:text-white">
              Privacy
            </Link>
            <Link to="/legal/terms" className="text-primary-300/60 transition-colors hover:text-white">
              Terms
            </Link>
            <Link to="/legal/cookies" className="text-primary-300/60 transition-colors hover:text-white">
              Cookies
            </Link>
            <span className="hidden h-3 w-px bg-white/10 sm:block" aria-hidden />
            <span className="inline-flex items-center gap-1.5 text-primary-300/40">
              <Leaf className="h-3 w-3" />
              Grown with care
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

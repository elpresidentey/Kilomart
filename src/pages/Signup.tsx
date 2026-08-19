import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Card, Input } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import {
  Leaf,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Users,
  TrendingUp,
} from 'lucide-react'
import type { User as UserType } from '../types'
import { safeRedirectPath } from '../lib/redirect'
import { useI18n } from '../i18n/useI18n'
import { useToastStore } from '../stores/toastStore'

export function Signup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signUp } = useAuth()
  const { t } = useI18n()
  const toastSuccess = useToastStore((s) => s.success)
  const toastError = useToastStore((s) => s.error)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'buyer' as UserType['role'],
    location: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    const { data, error } = await signUp(formData.email, formData.password, {
      full_name: formData.fullName,
      phone: formData.phone,
      role: formData.role,
      location: formData.location,
    })
    if (error) {
      setError(error.message)
      toastError(error.message, 'Sign up failed')
      setIsLoading(false)
    } else if (data?.user?.identities?.length === 0) {
      setSuccessMessage(t('auth.signup.successEmailConfirm'))
      toastSuccess('Confirmation email sent.')
      setIsLoading(false)
    } else {
      toastSuccess('Account created successfully.')
      navigate(safeRedirectPath(searchParams.get('redirect')))
    }
  }

  return (
    <div className="relative min-h-screen bg-stone-50 overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-[42rem] rounded-full bg-primary-200/40 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[-4rem] h-80 w-80 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="absolute -bottom-24 left-[-4rem] h-72 w-72 rounded-full bg-leaf-200/40 blur-3xl" />
      </div>
      <div className="grid min-h-screen lg:grid-cols-2">
        {/* Brand panel */}
        <div className="relative flex flex-col justify-between gap-8 overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 px-10 py-12 text-white lg:pt-8 lg:pb-12 xl:px-14">
          <div aria-hidden className="absolute inset-0">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-96 w-[42rem] rounded-full bg-primary-600/20 blur-3xl" />
            <div className="absolute bottom-[-5rem] right-[-4rem] h-80 w-80 rounded-full bg-leaf-600/15 blur-3xl" />
          </div>

          <Link to="/" className="-mt-2 inline-flex items-center gap-3 tap-highlight-none">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-400 to-primary-500 shadow-lg ring-1 ring-inset ring-white/20">
              <Leaf className="h-6 w-6 text-white" />
            </span>
            <span className="text-xl font-semibold text-white">Fresh from the Farm</span>
          </Link>

          <div className="relative">
            <p className="eyebrow mb-4 justify-start before:opacity-100 text-primary-200/90">
              Start selling
            </p>
            <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
              Join the farm-to-table movement.{' '}
              <span className="block">Sell directly to buyers who value freshness.</span>
            </h1>
            <p className="mt-6 max-w-md text-lg text-primary-200/85">
              List your produce by weight, set fair prices, and reach thousands of
              buyers across Nigeria — no middlemen.
            </p>
            <ul className="mt-10 grid gap-5 max-w-sm">
              <li className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/15 text-primary-100">
                  <Users className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Reach buyers directly</p>
                  <p className="mt-0.5 text-sm text-primary-200/80">
                    No middlemen — sell at fair per-kilo prices.
                  </p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/15 text-primary-100">
                  <TrendingUp className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Grow your business</p>
                  <p className="mt-0.5 text-sm text-primary-200/80">
                    Track orders, payments, and delivery in one dashboard.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <Card className="w-full max-w-md border border-stone-100 bg-white/95 shadow-overlay" padding="lg">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-bold text-stone-900">
                {t('auth.signup.title')}
              </h2>
              <p className="mt-1 text-stone-500">{t('auth.signup.subtitle')}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label={t('auth.fullNameLabel')}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder={t('auth.signup.fullNamePlaceholder')}
                required
                icon={<User className="h-4 w-4" />}
              />
              <Input
                label={t('auth.emailLabel')}
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t('auth.signup.emailPlaceholder')}
                required
                icon={<Mail className="h-4 w-4" />}
              />
              <Input
                label={t('auth.phoneLabel')}
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={t('auth.signup.phonePlaceholder')}
                required
                icon={<Phone className="h-4 w-4" />}
              />
              <Input
                label={t('auth.locationLabel')}
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder={t('auth.signup.locationPlaceholder')}
                required
                icon={<MapPin className="h-4 w-4" />}
              />

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1.5">
                  {t('auth.signup.accountTypeLabel')}
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value as UserType['role'] })
                  }
                  className="select block w-full py-2.5 pl-3.5 pr-8 border border-stone-300 rounded-xl bg-white shadow-soft text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/70 focus:border-transparent"
                >
                  <option value="buyer">{t('auth.signup.buyerOption')}</option>
                  <option value="farmer">{t('auth.signup.farmerOption')}</option>
                  <option value="logistics">{t('auth.signup.logisticsOption')}</option>
                </select>
              </div>

              <Input
                label={t('auth.passwordLabel')}
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={t('auth.signup.passwordPlaceholder')}
                minLength={6}
                required
                icon={<Lock className="h-4 w-4" />}
              />

              {successMessage && (
                <div className="bg-primary-50 border border-primary-200/70 text-primary-800 p-4 rounded-xl">
                  <p className="font-medium">{successMessage}</p>
                  <div className="mt-3 rounded-xl bg-white/80 border border-primary-200 p-3 text-sm shadow-soft">
                    <p className="font-semibold mb-1">{t('auth.signup.confirmStepsTitle')}</p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>{t('auth.signup.confirmStep1')}</li>
                      <li>{t('auth.signup.confirmStep2')}</li>
                      <li>{t('auth.signup.confirmStep3')}</li>
                    </ol>
                  </div>
                  <p className="text-sm mt-2">
                    <Link to="/login" className="text-primary-700 font-medium hover:underline">
                      {t('auth.signup.signInLink')}
                    </Link>{' '}
                    {t('auth.signup.signInAfterConfirm')}
                  </p>
                </div>
              )}

              {error && (
                <p className="rounded-xl bg-red-50 p-3.5 text-sm text-red-600">{error}</p>
              )}

              <Button type="submit" className="w-full" isLoading={isLoading}>
                {t('auth.signup.submit')}
              </Button>
            </form>

            <p className="text-center text-sm text-stone-500 mt-6">
              {t('auth.signup.haveAccount')}{' '}
              <Link to="/login" className="text-primary-700 font-medium hover:underline">
                {t('auth.signup.signIn')}
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}

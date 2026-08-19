import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Card, Input } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { Leaf, Lock, Mail } from 'lucide-react'
import { safeRedirectPath } from '../lib/redirect'
import { useI18n } from '../i18n/useI18n'
import { useToastStore } from '../stores/toastStore'

const TRUST = [
  { label: 'Verified farmers', desc: 'Every grower is vetted and certified' },
  { label: 'Secure checkout', desc: 'Pay with Paystack, bank transfer, or cash on delivery' },
  { label: 'Fast delivery', desc: 'Fresh produce arrived in 24–48h across Nigeria' },
]

export function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signIn } = useAuth()
  const { t } = useI18n()
  const toastSuccess = useToastStore((s) => s.success)
  const toastError = useToastStore((s) => s.error)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fromUrl =
      searchParams.get('error_description') ||
      searchParams.get('error_code') ||
      searchParams.get('error')
    if (fromUrl) setError(decodeURIComponent(fromUrl.replace(/\+/g, ' ')))
  }, [searchParams])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
      toastError(error.message, 'Sign in failed')
      setIsLoading(false)
    } else {
      toastSuccess('Signed in successfully.')
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
            <span className="text-xl font-semibold text-white">Farmers Market</span>
          </Link>
          <div className="relative">
            <p className="eyebrow mb-4 justify-start before:opacity-100 text-primary-100">Welcome back</p>
            <h1 className="font-display text-3xl font-semibold leading-tight tracking-tight sm:text-4xl text-white [text-shadow:0_1px_3px_rgba(5,41,31,0.35)]">
              Good to see you again. <span className="block">Sign in to your fresh finds.</span>
            </h1>
            <p className="mt-5 max-w-md text-base text-primary-100/90">
              Pick up where you left off — your saved produce, orders, and preferences await.
            </p>
            <ul className="mt-10 grid gap-5 max-w-sm">
              {TRUST.map((item) => (
                <li key={item.label} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-inset ring-white/15 text-primary-100">
                    <Leaf className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.label}</p>
                    <p className="mt-0.5 text-sm text-primary-100/80">{item.desc}</p>
                  </div>
                </li>
              ))}
                        </ul>
          </div>

          <p className="relative text-xs text-primary-200/80">
            © {new Date().getFullYear()} Farmers Market.
          </p>
        </div>
        {/* Form panel */}
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <Card className="w-full max-w-md border border-stone-100 bg-white/95 shadow-overlay" padding="lg">
            <div className="text-center mb-8">
              <h2 className="font-display text-xl font-bold text-stone-900">
                {t('auth.login.title')}
              </h2>
              <p className="mt-1 text-stone-500">{t('auth.login.subtitle')}</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label={t('auth.emailLabel')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.login.emailPlaceholder')}
                required
                icon={<Mail className="h-4 w-4" />}
              />
              <Input
                label={t('auth.passwordLabel')}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.login.passwordPlaceholder')}
                required
                icon={<Lock className="h-4 w-4" />}
              />
              {error && (
                <p className="rounded-xl bg-red-50 p-3.5 text-sm text-red-600">{error}</p>
              )}
              <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                {t('auth.login.submit')}
              </Button>
            </form>
            <p className="text-center text-sm text-stone-500 mt-6">
              {t('auth.login.noAccount')}{' '}
              <Link
                to={
                  searchParams.get('redirect')
                    ? `/signup?redirect=${encodeURIComponent(searchParams.get('redirect')!)}`
                    : '/signup'
                }
                className="text-primary-700 font-medium hover:underline"
              >
                {t('auth.login.signUp')}
              </Link>
            </p>
          </Card>
        </div>
      </div>
    </div>
    )
}


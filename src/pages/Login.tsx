import { useState, useEffect, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Card, Input } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { Leaf } from 'lucide-react'
import { safeRedirectPath } from '../lib/redirect'
import { useI18n } from '../i18n/useI18n'
import { useToastStore } from '../stores/toastStore'

export function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signIn } = useAuth()
  const { t } = useI18n()
  const toastSuccess = useToastStore((state) => state.success)
  const toastError = useToastStore((state) => state.error)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fromUrl =
      searchParams.get('error_description') ||
      searchParams.get('error_code') ||
      searchParams.get('error')
    if (fromUrl) {
      setError(decodeURIComponent(fromUrl.replace(/\+/g, ' ')))
    }
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
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <Card className="w-full max-w-md" padding="lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 text-primary-700 mb-4">
            <Leaf className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">{t('auth.login.title')}</h1>
          <p className="text-stone-500 mt-1">{t('auth.login.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('auth.emailLabel')}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.login.emailPlaceholder')}
            required
          />
          
          <Input
            label={t('auth.passwordLabel')}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('auth.login.passwordPlaceholder')}
            required
          />

          {error && (
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
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
  )
}

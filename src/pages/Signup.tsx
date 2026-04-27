import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Card, Input } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { Leaf } from 'lucide-react'
import type { User } from '../types'
import { safeRedirectPath } from '../lib/redirect'
import { useI18n } from '../i18n/useI18n'
import { useToastStore } from '../stores/toastStore'

export function Signup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signUp } = useAuth()
  const { t } = useI18n()
  const toastSuccess = useToastStore((state) => state.success)
  const toastError = useToastStore((state) => state.error)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
    role: 'buyer' as User['role'],
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
      // Email confirmation required
      setSuccessMessage(t('auth.signup.successEmailConfirm'))
      toastSuccess('Confirmation email sent.')
      setIsLoading(false)
    } else {
      // Auto-confirmed (or user already exists)
      toastSuccess('Account created successfully.')
      navigate(safeRedirectPath(searchParams.get('redirect')))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4 py-8">
      <Card className="w-full max-w-md" padding="lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100 text-primary-700 mb-4">
            <Leaf className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-stone-900">{t('auth.signup.title')}</h1>
          <p className="text-stone-500 mt-1">{t('auth.signup.subtitle')}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label={t('auth.fullNameLabel')}
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder={t('auth.signup.fullNamePlaceholder')}
            required
          />
          
          <Input
            label={t('auth.emailLabel')}
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder={t('auth.signup.emailPlaceholder')}
            required
          />
          
          <Input
            label={t('auth.phoneLabel')}
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder={t('auth.signup.phonePlaceholder')}
            required
          />
          
          <Input
            label={t('auth.locationLabel')}
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder={t('auth.signup.locationPlaceholder')}
            required
          />

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              {t('auth.signup.accountTypeLabel')}
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
              className="block w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
          />

          {successMessage && (
            <div className="bg-primary-50 border border-primary-200 text-primary-700 p-4 rounded-lg">
              <p className="font-medium">{successMessage}</p>
              <div className="mt-3 rounded-md bg-white/70 border border-primary-200 p-3 text-sm">
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
            <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            isLoading={isLoading}
          >
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
  )
}

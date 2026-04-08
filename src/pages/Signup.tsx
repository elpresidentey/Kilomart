import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, Card, Input } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { Leaf } from 'lucide-react'
import type { User } from '../types'
import { safeRedirectPath } from '../lib/redirect'

export function Signup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { signUp } = useAuth()
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
      setIsLoading(false)
    } else if (data?.user?.identities?.length === 0) {
      // Email confirmation required
      setSuccessMessage('Account created! Please check your email to confirm your account before signing in.')
      setIsLoading(false)
    } else {
      // Auto-confirmed (or user already exists)
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
          <h1 className="text-2xl font-bold text-stone-900">Create account</h1>
          <p className="text-stone-500 mt-1">Join KiloMarket today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="Enter your full name"
            required
          />
          
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter your email"
            required
          />
          
          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="Enter your phone number"
            required
          />
          
          <Input
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="e.g., Lagos, Nigeria"
            required
          />

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1.5">
              Account Type
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as User['role'] })}
              className="block w-full px-3 py-2.5 border border-stone-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="buyer">Buyer (I want to purchase produce)</option>
              <option value="farmer">Farmer (I want to sell produce)</option>
            </select>
          </div>
          
          <Input
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Create a password (min 6 characters)"
            minLength={6}
            required
          />

          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-lg">
              <p className="font-medium">{successMessage}</p>
              <div className="mt-3 rounded-md bg-white/70 border border-emerald-200 p-3 text-sm">
                <p className="font-semibold mb-1">Confirmation email steps:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Open the email from KiloMarket/Supabase.</li>
                  <li>Click the "Confirm your email" button.</li>
                  <li>You will be redirected back to KiloMarket onboarding.</li>
                </ol>
              </div>
              <p className="text-sm mt-2">
                <Link to="/login" className="text-primary-700 font-medium hover:underline">
                  Click here to sign in
                </Link>{' '}
                once you've confirmed your email.
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
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-stone-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-primary-700 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  )
}

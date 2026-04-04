import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Layout } from '../components/Layout'
import { User, Mail, Phone, MapPin, Calendar, LogOut, Edit2, Check, X, Store, ShieldCheck } from 'lucide-react'
import type { User as UserType } from '../types'
import { fallbackOnImageError, sanitizeImageUrl, FALLBACK_IMAGE_SRC } from '../lib/image'

export function Profile() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<UserType>>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData(user)
    }
  }, [user])

  async function handleSave() {
    if (!user) return
    
    setSaving(true)
    const { error } = await supabase
      .from('users')
      .update({
        full_name: formData.full_name,
        phone: formData.phone,
        location: formData.location,
        bio: formData.bio,
      })
      .eq('id', user.id)

    if (error) {
      console.error('Error updating profile:', error)
    } else {
      setIsEditing(false)
    }
    setSaving(false)
  }

  async function handleLogout() {
    await signOut()
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Card className="w-full max-w-md" padding="lg">
            <p className="text-center text-stone-600">Please log in to view your profile</p>
            <Button className="w-full mt-4" onClick={() => navigate('/login')}>
              Go to Login
            </Button>
          </Card>
        </div>
      </Layout>
    )
  }

  const roleLabels: Record<string, string> = {
    farmer: 'Farmer / Seller',
    buyer: 'Buyer',
    warehouse_manager: 'Warehouse Manager',
    logistics: 'Logistics Partner',
  }

  const roleColors: Record<string, string> = {
    farmer: 'bg-emerald-100 text-emerald-700',
    buyer: 'bg-blue-100 text-blue-700',
    warehouse_manager: 'bg-amber-100 text-amber-700',
    logistics: 'bg-purple-100 text-purple-700',
  }

  return (
    <Layout>
      <div className="py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">My Profile</h1>
            <p className="text-stone-500">Manage your account settings</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to Home
            </Button>
            <Button variant="danger" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Profile Overview */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary-600 to-emerald-600" />
          <div className="relative pt-16 px-6 pb-6">
            <div className="flex items-end gap-6">
              <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg border-4 border-white">
                {user.avatar_url ? (
                  <img
                    src={sanitizeImageUrl(user.avatar_url) ?? FALLBACK_IMAGE_SRC}
                    alt={user.full_name}
                    onError={fallbackOnImageError}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-stone-400" />
                )}
              </div>
              <div className="flex-1 mb-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-stone-900">{user.full_name}</h2>
                  {user.is_verified && (
                    <ShieldCheck className="w-6 h-6 text-primary-600" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${roleColors[user.role]}`}>
                    {user.role === 'farmer' && <Store className="w-3 h-3" />}
                    {roleLabels[user.role] || user.role}
                  </span>
                  <span className="text-stone-500">•</span>
                  <span className="text-stone-500">Member since {new Date(user.created_at || '').toLocaleDateString()}</span>
                </div>
              </div>
              <div className="mb-2">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      <X className="w-4 h-4 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave} isLoading={saving}>
                      <Check className="w-4 h-4 mr-1" />
                      Save
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-1" />
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">Contact Information</h3>
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <Input
                    label="Full Name"
                    value={formData.full_name || ''}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={user.email}
                    disabled
                  />
                  <Input
                    label="Phone"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Add your phone number"
                  />
                  <Input
                    label="Location"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Add your location"
                  />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-stone-500" />
                    </div>
                    <div>
                      <p className="text-sm text-stone-500">Full Name</p>
                      <p className="font-medium text-stone-900">{user.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-stone-500" />
                    </div>
                    <div>
                      <p className="text-sm text-stone-500">Email</p>
                      <p className="font-medium text-stone-900">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-stone-500" />
                    </div>
                    <div>
                      <p className="text-sm text-stone-500">Phone</p>
                      <p className="font-medium text-stone-900">{user.phone || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-stone-500" />
                    </div>
                    <div>
                      <p className="text-sm text-stone-500">Location</p>
                      <p className="font-medium text-stone-900">{user.location || 'Not provided'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-stone-500" />
                    </div>
                    <div>
                      <p className="text-sm text-stone-500">Joined</p>
                      <p className="font-medium text-stone-900">{new Date(user.created_at || '').toLocaleDateString()}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">About</h3>
            {isEditing ? (
              <textarea
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                className="w-full h-48 p-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            ) : (
              <p className="text-stone-600 leading-relaxed">
                {user.bio || 'No bio provided. Click "Edit Profile" to add one.'}
              </p>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-stone-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            {user.role === 'farmer' && (
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                Go to Dashboard
              </Button>
            )}
            {user.role === 'buyer' && (
              <Button onClick={() => navigate('/orders')} variant="outline">
                My Orders
              </Button>
            )}
            <Button onClick={() => navigate('/marketplace')} variant="outline">
              Browse Marketplace
            </Button>
          </div>
        </Card>
        </div>
      </div>
    </Layout>
  )
}

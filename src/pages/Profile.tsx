import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Input } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Layout } from '../components/Layout'
import { User, Mail, Phone, MapPin, Calendar, LogOut, Edit2, Check, X, Store, ShieldCheck } from 'lucide-react'
import type { User as UserType } from '../types'
import { fallbackOnImageError, sanitizeImageUrl, FALLBACK_IMAGE_SRC } from '../lib/image'
import { useI18n } from '../i18n/useI18n'

export function Profile() {
  const navigate = useNavigate()
  const { user, signOut } = useAuth()
  const { t } = useI18n()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<UserType>>({})
  const [saving, setSaving] = useState(false)
  const copy =
    t('nav.home') === 'Gida'
      ? {
          title: 'Bayanan martaba',
          subtitle: 'Sarrafa saitunan asusunka',
          backHome: 'Komawa gida',
          logout: 'Fita',
          memberSince: 'Mamba tun',
          cancel: 'Soke',
          save: 'Ajiye',
          editProfile: 'Gyara bayanan martaba',
          contactInfo: 'Bayanan tuntuɓa',
          fullName: 'Cikakken suna',
          email: 'Imel',
          phone: 'Waya',
          location: 'Wuri',
          joined: 'Ranar shiga',
          notProvided: 'Ba a bayar ba',
          about: 'Game da kai',
          noBio: 'Babu takaitaccen bayani. Danna "Gyara bayanan martaba" don ƙara.',
          quickActions: 'Ayyuka masu sauri',
          goDashboard: 'Je zuwa dashboard',
          myOrders: 'Umarnina',
          browseMarketplace: 'Bude kasuwa',
          farmerRole: 'Manomi / Mai sayarwa',
          buyerRole: 'Mai siya',
          warehouseRole: 'Manajan ma’ajiya',
          logisticsRole: 'Abokin jigila',
        }
      : t('nav.home') === 'Ilé'
        ? {
            title: 'Profaili mi',
            subtitle: 'Ṣakoso awọn eto akọọlẹ rẹ',
            backHome: 'Pada si ile',
            logout: 'Jade',
            memberSince: 'Ọmọ ẹgbẹ lati',
            cancel: 'Fagilee',
            save: 'Fipamọ',
            editProfile: 'Ṣatunkọ profaili',
            contactInfo: 'Alaye ibaraẹnisọrọ',
            fullName: 'Orukọ kikun',
            email: 'Imeeli',
            phone: 'Foonu',
            location: 'Ibi',
            joined: 'Darapọ',
            notProvided: 'Ko pese',
            about: 'Nipa',
            noBio: 'Ko si bio. Tẹ "Ṣatunkọ profaili" lati fi kun.',
            quickActions: 'Igbese yarayara',
            goDashboard: 'Lọ si dashboard',
            myOrders: 'Awọn aṣẹ mi',
            browseMarketplace: 'Bude ọja',
            farmerRole: 'Agbe / Olutaja',
            buyerRole: 'Onira',
            warehouseRole: 'Oluṣakoso ile-itaja',
            logisticsRole: 'Alabaṣepọ eekaderi',
          }
        : t('nav.home') === 'Ụlọ'
          ? {
              title: 'Profaịlụ m',
              subtitle: 'Jikwaa ntọala akaụntụ gị',
              backHome: 'Laghachi n’ụlọ',
              logout: 'Pụọ',
              memberSince: 'Onye otu kemgbe',
              cancel: 'Kagbuo',
              save: 'Chekwaa',
              editProfile: 'Dezie profaịlụ',
              contactInfo: 'Ozi kọntaktị',
              fullName: 'Aha zuru ezu',
              email: 'Email',
              phone: 'Ekwentị',
              location: 'Ebe',
              joined: 'Soro na',
              notProvided: 'Enyebeghị',
              about: 'Banyere',
              noBio: 'Enweghị bio. Pịa "Dezie profaịlụ" iji tinye otu.',
              quickActions: 'Ihe omume ọsọ ọsọ',
              goDashboard: 'Gaa dashboard',
              myOrders: 'Orders m',
              browseMarketplace: 'Gaa ahịa',
              farmerRole: 'Onye ọrụ ugbo / Onye na-ere',
              buyerRole: 'Onye na-azụ',
              warehouseRole: 'Onye njikwa ụlọ nkwakọba',
              logisticsRole: 'Onye mmekọ logistic',
            }
          : {
              title: 'My Profile',
              subtitle: 'Manage your account settings',
              backHome: 'Back to Home',
              logout: 'Logout',
              memberSince: 'Member since',
              cancel: 'Cancel',
              save: 'Save',
              editProfile: 'Edit Profile',
              contactInfo: 'Contact Information',
              fullName: 'Full Name',
              email: 'Email',
              phone: 'Phone',
              location: 'Location',
              joined: 'Joined',
              notProvided: 'Not provided',
              about: 'About',
              noBio: 'No bio provided. Click "Edit Profile" to add one.',
              quickActions: 'Quick Actions',
              goDashboard: 'Go to Dashboard',
              myOrders: 'My Orders',
              browseMarketplace: 'Browse Marketplace',
              farmerRole: 'Farmer / Seller',
              buyerRole: 'Buyer',
              warehouseRole: 'Warehouse Manager',
              logisticsRole: 'Logistics Partner',
            }

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
            <p className="text-center text-stone-600">{t('profile.loginRequired')}</p>
            <Button className="w-full mt-4" onClick={() => navigate('/login')}>
              {t('profile.goToLogin')}
            </Button>
          </Card>
        </div>
      </Layout>
    )
  }

  const roleLabels: Record<string, string> = {
    farmer: copy.farmerRole,
    buyer: copy.buyerRole,
    warehouse_manager: copy.warehouseRole,
    logistics: copy.logisticsRole,
  }

  const roleColors: Record<string, string> = {
    farmer: 'bg-primary-100 text-primary-700',
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
            <h1 className="text-2xl font-bold text-stone-900">{copy.title}</h1>
            <p className="text-stone-500">{copy.subtitle}</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/')}>
              {copy.backHome}
            </Button>
            <Button variant="danger" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              {copy.logout}
            </Button>
          </div>
        </div>

        {/* Profile Overview */}
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-primary-600 to-primary-600" />
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
                  <span className="text-stone-500">{copy.memberSince} {new Date(user.created_at || '').toLocaleDateString()}</span>
                </div>
              </div>
              <div className="mb-2">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                      <X className="w-4 h-4 mr-1" />
                      {copy.cancel}
                    </Button>
                    <Button size="sm" onClick={handleSave} isLoading={saving}>
                      <Check className="w-4 h-4 mr-1" />
                      {copy.save}
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-1" />
                    {copy.editProfile}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Profile Details */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card padding="lg">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">{copy.contactInfo}</h3>
            <div className="space-y-4">
              {isEditing ? (
                <>
                  <Input
                    label={copy.fullName}
                    value={formData.full_name || ''}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  />
                  <Input
                    label={copy.email}
                    type="email"
                    value={user.email}
                    disabled
                  />
                  <Input
                    label={copy.phone}
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={t('profile.phonePlaceholder')}
                  />
                  <Input
                    label={copy.location}
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder={t('profile.locationPlaceholder')}
                  />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-stone-500" />
                    </div>
                    <div>
                      <p className="text-sm text-stone-500">{copy.fullName}</p>
                      <p className="font-medium text-stone-900">{user.full_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-stone-500" />
                    </div>
                    <div>
                      <p className="text-sm text-stone-500">{copy.email}</p>
                      <p className="font-medium text-stone-900">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-stone-500" />
                    </div>
                    <div>
                      <p className="text-sm text-stone-500">{copy.phone}</p>
                      <p className="font-medium text-stone-900">{user.phone || copy.notProvided}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-stone-500" />
                    </div>
                    <div>
                      <p className="text-sm text-stone-500">{copy.location}</p>
                      <p className="font-medium text-stone-900">{user.location || copy.notProvided}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-stone-500" />
                    </div>
                    <div>
                      <p className="text-sm text-stone-500">{copy.joined}</p>
                      <p className="font-medium text-stone-900">{new Date(user.created_at || '').toLocaleDateString()}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Card>

          <Card padding="lg">
            <h3 className="text-lg font-semibold text-stone-900 mb-4">{copy.about}</h3>
            {isEditing ? (
              <textarea
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder={t('profile.bioPlaceholder')}
                className="w-full h-48 p-3 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            ) : (
              <p className="text-stone-600 leading-relaxed">
                {user.bio || copy.noBio}
              </p>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <Card padding="lg">
          <h3 className="text-lg font-semibold text-stone-900 mb-4">{copy.quickActions}</h3>
          <div className="flex flex-wrap gap-3">
            {user.role === 'farmer' && (
              <Button onClick={() => navigate('/dashboard')} variant="outline">
                {copy.goDashboard}
              </Button>
            )}
            {(user.role === 'warehouse_manager' || user.role === 'logistics') && (
              <Button
                onClick={() => navigate(user.role === 'logistics' ? '/operations?view=logistics' : '/operations')}
                variant="outline"
              >
                {t('nav.operations')}
              </Button>
            )}
            {user.role === 'buyer' && (
              <Button onClick={() => navigate('/orders')} variant="outline">
                {copy.myOrders}
              </Button>
            )}
            <Button onClick={() => navigate('/marketplace')} variant="outline">
              {copy.browseMarketplace}
            </Button>
          </div>
        </Card>
        </div>
      </div>
    </Layout>
  )
}

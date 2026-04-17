import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Card } from '../components/ui'
import { ArrowLeft, BookOpen, ShoppingCart, Truck, Shield, MessageCircle } from 'lucide-react'
import { useI18n } from '../i18n/useI18n'

const LINKS = [
  {
    title: 'How buying works',
    description: 'Browse, cart by weight, checkout, and delivery — step by step.',
    to: '/#how-it-works',
    icon: ShoppingCart,
  },
  {
    title: 'Why Farmers Market?',
    description: 'Farm-fresh quality, fair kg pricing, and verified farmers.',
    to: '/#features',
    icon: Shield,
  },
  {
    title: 'Delivery & logistics',
    description: 'How we get produce from farm to your door.',
    to: '/#features',
    icon: Truck,
  },
  {
    title: 'For farmers',
    description: 'Sell directly, fair pricing, and grow your customer base.',
    to: '/#for-farmers',
    icon: BookOpen,
  },
] as const

export function HelpCenter() {
  const { t } = useI18n()
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-8 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('static.backHome')}
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary-100 rounded-xl text-primary-800">
            <MessageCircle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-stone-900">{t('help.title')}</h1>
            <p className="text-stone-600">{t('help.subtitle')}</p>
          </div>
        </div>

        <div className="space-y-4 mb-10">
          {LINKS.map((item) => (
            <Link key={item.title} to={item.to}>
              <Card
                padding="lg"
                className="flex gap-4 items-start hover:border-primary-200 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="p-2 bg-stone-100 rounded-lg text-stone-700">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-stone-900 mb-1">{item.title}</h2>
                  <p className="text-sm text-stone-600">{item.description}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <Card padding="lg" className="bg-stone-50 border-stone-200">
          <p className="text-sm text-stone-700 mb-3">{t('help.stillStuck')}</p>
          <Link to="/contact" className="text-primary-700 font-semibold hover:underline">
            {t('help.contactSupport')} →
          </Link>
        </Card>
      </div>
    </Layout>
  )
}

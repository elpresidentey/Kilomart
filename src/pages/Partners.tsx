import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Button, Card } from '../components/ui'
import { ArrowLeft, Handshake, Truck, Store } from 'lucide-react'
import { useI18n } from '../i18n/useI18n'

export function Partners() {
  const { t } = useI18n()
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-10 px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-8 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('static.backHome')}
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-primary-100 rounded-xl text-primary-800">
            <Handshake className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-stone-900">{t('partners.title')}</h1>
            <p className="text-stone-600">{t('partners.subtitle')}</p>
          </div>
        </div>

        <p className="text-stone-600 text-sm leading-relaxed mb-8">
          {t('partners.p1')}
        </p>

        <div className="space-y-4 mb-10">
          <Card padding="lg" className="flex gap-4">
            <Store className="w-6 h-6 text-primary-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-stone-900 mb-1">{t('partners.farmers')}</h2>
              <p className="text-sm text-stone-600">
                {t('partners.farmersText')}
              </p>
            </div>
          </Card>
          <Card padding="lg" className="flex gap-4">
            <Truck className="w-6 h-6 text-primary-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-stone-900 mb-1">{t('partners.logistics')}</h2>
              <p className="text-sm text-stone-600">
                {t('partners.logisticsText')}
              </p>
            </div>
          </Card>
        </div>

        <Card padding="lg" className="bg-stone-50 border-stone-200 mb-8">
          <p className="text-sm text-stone-700 mb-3">{t('partners.startConversation')}</p>
          <a
            href="mailto:partners@kilomarket.ng?subject=Partnership%20%E2%80%94%20Farmers Market"
            className="text-primary-700 font-semibold hover:underline"
          >
            partners@kilomarket.ng
          </a>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Link to="/contact?topic=partners">
            <Button>{t('partners.contactPartnerships')}</Button>
          </Link>
          <Link to="/marketplace">
            <Button variant="outline">{t('partners.seeMarketplace')}</Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}

import { useSearchParams, Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Card, Button } from '../components/ui'
import { Mail, MapPin, Phone, ArrowLeft } from 'lucide-react'
import { useI18n } from '../i18n/useI18n'

const TOPIC_LABEL: Record<string, string> = {
  general: 'General enquiry',
  press: 'Press & media',
  partners: 'Partnerships',
  careers: 'Careers',
  hiring: 'Careers / hiring',
}

export function Contact() {
  const [searchParams] = useSearchParams()
  const { t } = useI18n()
  const topic = searchParams.get('topic') || 'general'
  const subjectHint = TOPIC_LABEL[topic] ?? TOPIC_LABEL.general

  return (
    <Layout>
      <div className="max-w-2xl mx-auto py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-8 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('static.backHome')}
        </Link>

        <h1 className="text-3xl font-bold text-stone-900 mb-2">{t('contact.title')}</h1>
        <p className="text-stone-600 mb-8">
          {t('contact.subtitle')}
          {topic !== 'general' && (
            <span className="block mt-2 text-sm text-primary-800 bg-primary-50 rounded-lg px-3 py-2">
              {t('contact.topic')}: {subjectHint}
            </span>
          )}
        </p>

        <Card padding="lg" className="space-y-6 mb-8">
          <div className="flex gap-4">
            <div className="p-3 bg-primary-50 rounded-xl text-primary-700">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">{t('contact.phone')}</p>
              <a href="tel:+2348001234567" className="text-lg font-semibold text-stone-900 hover:text-primary-700">
                +234 800 123 4567
              </a>
              <p className="text-sm text-stone-500 mt-1">{t('contact.phoneHours')}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="p-3 bg-primary-50 rounded-xl text-primary-700">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">{t('contact.email')}</p>
              <a
                href={`mailto:support@kilomarket.ng?subject=${encodeURIComponent(`[${subjectHint}] Farmers Market enquiry`)}`}
                className="text-lg font-semibold text-stone-900 hover:text-primary-700 break-all"
              >
                support@kilomarket.ng
              </a>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="p-3 bg-primary-50 rounded-xl text-primary-700">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">{t('contact.office')}</p>
              <p className="text-stone-900">{t('topbar.location')}</p>
            </div>
          </div>
        </Card>

        <p className="text-sm text-stone-500 text-center">
          {t('contact.orderIssues')}{' '}
          <Link to="/orders" className="text-primary-700 font-medium hover:underline">
            {t('contact.myOrders')}
          </Link>
          .
        </p>

        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <Link to="/marketplace">
            <Button variant="secondary">{t('contact.browseMarketplace')}</Button>
          </Link>
          <Link to="/help">
            <Button variant="outline">{t('contact.helpCenter')}</Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}

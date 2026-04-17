import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Button, Card } from '../components/ui'
import { ArrowLeft, Briefcase, Heart, Sparkles } from 'lucide-react'
import { useI18n } from '../i18n/useI18n'

export function Careers() {
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
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-stone-900">{t('careers.title')}</h1>
            <p className="text-stone-600">{t('careers.subtitle')}</p>
          </div>
        </div>

        <p className="text-stone-600 text-sm leading-relaxed mb-8">
          {t('careers.p1')}
        </p>

        <div className="space-y-4 mb-10">
          <Card padding="lg" className="flex gap-4">
            <Sparkles className="w-6 h-6 text-primary-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-stone-900 mb-1">{t('careers.openRoles')}</h2>
              <p className="text-sm text-stone-600">
                {t('careers.openRolesText')}
              </p>
            </div>
          </Card>
          <Card padding="lg" className="flex gap-4">
            <Heart className="w-6 h-6 text-primary-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-stone-900 mb-1">{t('careers.howWeWork')}</h2>
              <p className="text-sm text-stone-600">
                {t('careers.howWeWorkText')}
              </p>
            </div>
          </Card>
        </div>

        <Card padding="lg" className="bg-stone-50 border-stone-200 mb-8">
          <p className="text-sm text-stone-700 mb-3">{t('careers.interested')}</p>
          <a
            href="mailto:careers@kilomarket.ng?subject=Careers%20inquiry%20-%20Farmers Market"
            className="text-primary-700 font-semibold hover:underline"
          >
            careers@kilomarket.ng
          </a>
          <p className="text-xs text-stone-500 mt-2">{t('careers.orContact')}</p>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Link to="/contact?topic=careers">
            <Button>{t('careers.contactCareers')}</Button>
          </Link>
          <Link to="/">
            <Button variant="outline">{t('static.backHome')}</Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}

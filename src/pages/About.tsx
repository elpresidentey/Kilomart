import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Button, Card } from '../components/ui'
import { ArrowLeft, Leaf, Target, Users } from 'lucide-react'
import { useI18n } from '../i18n/useI18n'

export function About() {
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
          <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-stone-900">{t('about.title')}</h1>
            <p className="text-stone-600">{t('about.subtitle')}</p>
          </div>
        </div>

        <div className="prose prose-stone max-w-none space-y-4 text-stone-600 text-sm leading-relaxed mb-10">
          <p>
            {t('about.p1')}
          </p>
          <p>
            {t('about.p2')}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <Card padding="lg" className="flex gap-4">
            <div className="p-2 bg-primary-50 rounded-lg text-primary-700">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold text-stone-900 mb-1">{t('about.mission')}</h2>
              <p className="text-sm text-stone-600">
                {t('about.missionText')}
              </p>
            </div>
          </Card>
          <Card padding="lg" className="flex gap-4">
            <div className="p-2 bg-primary-50 rounded-lg text-primary-700">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold text-stone-900 mb-1">{t('about.community')}</h2>
              <p className="text-sm text-stone-600">
                {t('about.communityText')}
              </p>
            </div>
          </Card>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/marketplace">
            <Button>{t('about.browseMarketplace')}</Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline">{t('about.contactUs')}</Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}

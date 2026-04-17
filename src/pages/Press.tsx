import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Button, Card } from '../components/ui'
import { ArrowLeft, Newspaper, ImageIcon } from 'lucide-react'
import { useI18n } from '../i18n/useI18n'

export function Press() {
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
            <Newspaper className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-stone-900">{t('press.title')}</h1>
            <p className="text-stone-600">{t('press.subtitle')}</p>
          </div>
        </div>

        <p className="text-stone-600 text-sm leading-relaxed mb-8">
          {t('press.p1')}
        </p>

        <div className="space-y-4 mb-10">
          <Card padding="lg">
            <h2 className="font-semibold text-stone-900 mb-2">{t('press.boilerplate')}</h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              {t('press.boilerplateText')}
            </p>
          </Card>
          <Card padding="lg" className="flex gap-4">
            <ImageIcon className="w-6 h-6 text-primary-600 shrink-0" />
            <div>
              <h2 className="font-semibold text-stone-900 mb-1">{t('press.logos')}</h2>
              <p className="text-sm text-stone-600">
                {t('press.logosText')}
              </p>
            </div>
          </Card>
        </div>

        <Card padding="lg" className="bg-stone-50 border-stone-200 mb-8">
          <p className="text-sm text-stone-700 mb-3">{t('press.contact')}</p>
          <a
            href="mailto:press@kilomarket.ng?subject=Press%20inquiry%20-%20Farmers Market"
            className="text-primary-700 font-semibold hover:underline"
          >
            press@kilomarket.ng
          </a>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Link to="/contact?topic=press">
            <Button>{t('press.contactPress')}</Button>
          </Link>
          <Link to="/about">
            <Button variant="outline">{t('about.title')}</Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}

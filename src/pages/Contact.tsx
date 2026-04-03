import { useSearchParams, Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Card, Button } from '../components/ui'
import { Mail, MapPin, Phone, ArrowLeft } from 'lucide-react'

const TOPIC_LABEL: Record<string, string> = {
  general: 'General enquiry',
  press: 'Press & media',
  partners: 'Partnerships',
  careers: 'Careers',
  hiring: 'Careers / hiring',
}

export function Contact() {
  const [searchParams] = useSearchParams()
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
          Back to home
        </Link>

        <h1 className="text-3xl font-bold text-stone-900 mb-2">Contact us</h1>
        <p className="text-stone-600 mb-8">
          Reach the KiloMarket team for support, partnerships, or press enquiries.
          {topic !== 'general' && (
            <span className="block mt-2 text-sm text-emerald-800 bg-emerald-50 rounded-lg px-3 py-2">
              Topic: {subjectHint}
            </span>
          )}
        </p>

        <Card padding="lg" className="space-y-6 mb-8">
          <div className="flex gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
              <Phone className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Phone</p>
              <a href="tel:+2348001234567" className="text-lg font-semibold text-stone-900 hover:text-emerald-700">
                +234 800 123 4567
              </a>
              <p className="text-sm text-stone-500 mt-1">Mon–Sat, 9:00–18:00 WAT</p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Email</p>
              <a
                href={`mailto:support@kilomarket.ng?subject=${encodeURIComponent(`[${subjectHint}] KiloMarket enquiry`)}`}
                className="text-lg font-semibold text-stone-900 hover:text-emerald-700 break-all"
              >
                support@kilomarket.ng
              </a>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Office</p>
              <p className="text-stone-900">Lagos, Nigeria</p>
            </div>
          </div>
        </Card>

        <p className="text-sm text-stone-500 text-center">
          For order issues, sign in and visit{' '}
          <Link to="/orders" className="text-emerald-700 font-medium hover:underline">
            My orders
          </Link>
          .
        </p>

        <div className="mt-10 flex flex-wrap gap-3 justify-center">
          <Link to="/marketplace">
            <Button variant="secondary">Browse marketplace</Button>
          </Link>
          <Link to="/help">
            <Button variant="outline">Help center</Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}

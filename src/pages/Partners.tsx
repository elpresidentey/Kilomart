import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Button, Card } from '../components/ui'
import { ArrowLeft, Handshake, Truck, Store } from 'lucide-react'

export function Partners() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-10 px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-8 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-100 rounded-xl text-emerald-800">
            <Handshake className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Partners</h1>
            <p className="text-stone-600">Work with KiloMarket across the supply chain.</p>
          </div>
        </div>

        <p className="text-stone-600 text-sm leading-relaxed mb-8">
          We partner with cooperatives, logistics providers, retailers, and organisations that want to improve access
          to fresh produce. Tell us what you do — we&apos;ll explore pilots, integrations, or commercial terms
          together.
        </p>

        <div className="space-y-4 mb-10">
          <Card padding="lg" className="flex gap-4">
            <Store className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-stone-900 mb-1">Farmers & cooperatives</h2>
              <p className="text-sm text-stone-600">
                List at scale, shared standards, and coordinated fulfilment for your members.
              </p>
            </div>
          </Card>
          <Card padding="lg" className="flex gap-4">
            <Truck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-stone-900 mb-1">Logistics & cold chain</h2>
              <p className="text-sm text-stone-600">
                Last-mile and regional delivery partners that meet our quality bar.
              </p>
            </div>
          </Card>
        </div>

        <Card padding="lg" className="bg-stone-50 border-stone-200 mb-8">
          <p className="text-sm text-stone-700 mb-3">Start a conversation</p>
          <a
            href="mailto:partners@kilomarket.ng?subject=Partnership%20%E2%80%94%20KiloMarket"
            className="text-emerald-700 font-semibold hover:underline"
          >
            partners@kilomarket.ng
          </a>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Link to="/contact?topic=partners">
            <Button>Contact (partnerships)</Button>
          </Link>
          <Link to="/marketplace">
            <Button variant="outline">See marketplace</Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}

import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Button, Card } from '../components/ui'
import { ArrowLeft, Leaf, Target, Users } from 'lucide-react'

export function About() {
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
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-stone-900">About KiloMarket</h1>
            <p className="text-stone-600">Nigeria&apos;s marketplace for farm-fresh produce.</p>
          </div>
        </div>

        <div className="prose prose-stone max-w-none space-y-4 text-stone-600 text-sm leading-relaxed mb-10">
          <p>
            KiloMarket connects verified farmers with buyers who want fair, transparent pricing by the kilogram.
            We focus on quality, traceability, and logistics that work for Nigerian farms and urban kitchens alike.
          </p>
          <p>
            Whether you&apos;re stocking a restaurant, feeding a household, or scaling a farm business, our goal is
            the same: fresher food, clearer prices, and trust on both sides of the transaction.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <Card padding="lg" className="flex gap-4">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold text-stone-900 mb-1">Mission</h2>
              <p className="text-sm text-stone-600">
                Make it simple to buy and sell agricultural produce with confidence — from listing to delivery.
              </p>
            </div>
          </Card>
          <Card padding="lg" className="flex gap-4">
            <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-semibold text-stone-900 mb-1">Community</h2>
              <p className="text-sm text-stone-600">
                Farmers and buyers grow together through reviews, support, and tools built for real-world logistics.
              </p>
            </div>
          </Card>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link to="/marketplace">
            <Button>Browse marketplace</Button>
          </Link>
          <Link to="/contact">
            <Button variant="outline">Contact us</Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}

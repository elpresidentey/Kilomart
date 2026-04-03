import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Button, Card } from '../components/ui'
import { ArrowLeft, Newspaper, ImageIcon } from 'lucide-react'

export function Press() {
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
            <Newspaper className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Press</h1>
            <p className="text-stone-600">Media resources and enquiries for KiloMarket.</p>
          </div>
        </div>

        <p className="text-stone-600 text-sm leading-relaxed mb-8">
          Journalists and content creators can use the facts below for stories about food tech, agriculture, and
          e-commerce in Nigeria. For interviews, data, or brand assets, email our press line.
        </p>

        <div className="space-y-4 mb-10">
          <Card padding="lg">
            <h2 className="font-semibold text-stone-900 mb-2">Boilerplate</h2>
            <p className="text-sm text-stone-600 leading-relaxed">
              KiloMarket is a digital marketplace connecting buyers with verified farmers for agricultural produce,
              with transparent kg-based pricing and logistics focused on the Nigerian market.
            </p>
          </Card>
          <Card padding="lg" className="flex gap-4">
            <ImageIcon className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h2 className="font-semibold text-stone-900 mb-1">Logos and screenshots</h2>
              <p className="text-sm text-stone-600">
                Request a simple media kit (logo PNG/SVG and product screenshots) by email. We will send a link.
              </p>
            </div>
          </Card>
        </div>

        <Card padding="lg" className="bg-stone-50 border-stone-200 mb-8">
          <p className="text-sm text-stone-700 mb-3">Press contact</p>
          <a
            href="mailto:press@kilomarket.ng?subject=Press%20inquiry%20-%20KiloMarket"
            className="text-emerald-700 font-semibold hover:underline"
          >
            press@kilomarket.ng
          </a>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Link to="/contact?topic=press">
            <Button>Contact (press)</Button>
          </Link>
          <Link to="/about">
            <Button variant="outline">About KiloMarket</Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}

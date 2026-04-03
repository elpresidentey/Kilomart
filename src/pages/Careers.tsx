import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Button, Card } from '../components/ui'
import { ArrowLeft, Briefcase, Heart, Sparkles } from 'lucide-react'

export function Careers() {
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
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-stone-900">Careers</h1>
            <p className="text-stone-600">Help us build the future of food commerce in Nigeria.</p>
          </div>
        </div>

        <p className="text-stone-600 text-sm leading-relaxed mb-8">
          We are a small team focused on farmers, buyers, and strong product experiences. When roles open up,
          we post them here and share across our channels. Until then, we still welcome people who care about
          agri-tech and marketplaces.
        </p>

        <div className="space-y-4 mb-10">
          <Card padding="lg" className="flex gap-4">
            <Sparkles className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-stone-900 mb-1">Open roles</h2>
              <p className="text-sm text-stone-600">
                No specific vacancies listed right now. Check back soon or send us your profile. We keep a shortlist
                for engineering, operations, and growth.
              </p>
            </div>
          </Card>
          <Card padding="lg" className="flex gap-4">
            <Heart className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h2 className="font-semibold text-stone-900 mb-1">How we work</h2>
              <p className="text-sm text-stone-600">
                Remote-friendly where it makes sense, Lagos-rooted for ops and partnerships. We value ownership,
                clarity, and respect for everyone who moves food every day.
              </p>
            </div>
          </Card>
        </div>

        <Card padding="lg" className="bg-stone-50 border-stone-200 mb-8">
          <p className="text-sm text-stone-700 mb-3">Interested in working with us?</p>
          <a
            href="mailto:careers@kilomarket.ng?subject=Careers%20inquiry%20-%20KiloMarket"
            className="text-emerald-700 font-semibold hover:underline"
          >
            careers@kilomarket.ng
          </a>
          <p className="text-xs text-stone-500 mt-2">Or use general contact with your CV attached.</p>
        </Card>

        <div className="flex flex-wrap gap-3">
          <Link to="/contact?topic=careers">
            <Button>Contact (careers)</Button>
          </Link>
          <Link to="/">
            <Button variant="outline">Back to home</Button>
          </Link>
        </div>
      </div>
    </Layout>
  )
}

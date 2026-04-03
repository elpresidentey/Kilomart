import { Link, useParams, Navigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { ArrowLeft } from 'lucide-react'

type DocKind = 'terms' | 'privacy' | 'cookies' | 'safety'

const TITLES: Record<DocKind, string> = {
  terms: 'Terms of service',
  privacy: 'Privacy policy',
  cookies: 'Cookie policy',
  safety: 'Safety & trust',
}

export function LegalDocument() {
  const { kind } = useParams<{ kind: string }>()
  const isDocKind = (k: string): k is DocKind => k === 'terms' || k === 'privacy' || k === 'cookies' || k === 'safety'
  if (!kind || !isDocKind(kind)) {
    return <Navigate to="/" replace />
  }
  const doc = kind
  const title = TITLES[doc]

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

        <article className="prose prose-stone max-w-none">
          <h1 className="text-3xl font-bold text-stone-900 mb-6">{title}</h1>

          {doc === 'terms' && (
            <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
              <p>
                By using KiloMarket you agree to use the platform lawfully, provide accurate information, and
                complete payment obligations for orders you place. Sellers agree to list accurate products,
                weights, and fulfil orders in good faith.
              </p>
              <p>
                KiloMarket may update these terms; continued use after changes constitutes acceptance. For
                disputes, contact us first at{' '}
                <a href="mailto:support@kilomarket.ng" className="text-emerald-700 hover:underline">
                  support@kilomarket.ng
                </a>
                .
              </p>
            </div>
          )}

          {doc === 'privacy' && (
            <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
              <p>
                We collect account and order data needed to run the marketplace (e.g. name, contact, delivery
                address). We do not sell your personal data. Data may be processed by infrastructure providers
                (e.g. hosting, email) under appropriate agreements.
              </p>
              <p>
                You may request access or correction of your profile data via{' '}
                <a href="mailto:support@kilomarket.ng" className="text-emerald-700 hover:underline">
                  support@kilomarket.ng
                </a>
                .
              </p>
            </div>
          )}

          {doc === 'cookies' && (
            <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
              <p>
                We use essential cookies and local storage to keep you signed in and to remember your cart.
                Analytics or marketing cookies may be added later; we will ask consent where required.
              </p>
              <p>You can clear site data in your browser settings at any time.</p>
            </div>
          )}

          {doc === 'safety' && (
            <div className="space-y-4 text-stone-600 text-sm leading-relaxed">
              <p>
                Meet in safe locations for cash-on-delivery where applicable, verify order details before
                payment, and report suspicious listings or messages to{' '}
                <a href="mailto:support@kilomarket.ng" className="text-emerald-700 hover:underline">
                  support@kilomarket.ng
                </a>
                . We aim to verify farmers and promote transparent listings.
              </p>
            </div>
          )}
        </article>
      </div>
    </Layout>
  )
}

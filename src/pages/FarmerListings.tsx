import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Card, Button, Badge } from '../components/ui'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import type { ProduceListing } from '../types'
import { Plus, Package, MapPin, ExternalLink, PencilLine } from 'lucide-react'
import { fallbackOnImageError, getProductImageSrc } from '../lib/image'
import { useI18n } from '../i18n/useI18n'

export function FarmerListings() {
  const { language } = useI18n()
  const { user } = useAuth()
  const [listings, setListings] = useState<ProduceListing[]>([])
  const [loading, setLoading] = useState(true)

  const copy =
    language === 'ha'
      ? {
          title: 'Jerin kayana',
          subtitle: 'Sarrafa kayan da kake sayarwa a kasuwa',
          newListing: 'Sabon jeri',
          emptyTitle: 'Babu jeri tukuna',
          emptyBody: 'Kirkiri jeri domin masu siya su ga kayanka a kasuwa.',
          createListing: 'Kirkiri jeri',
          pricePerKg: 'Farashi / kg',
          viewPublic: 'Duba shafin jama’a',
          editListing: 'Gyara jeri',
        }
      : language === 'yo'
        ? {
            title: 'Awon akojọ mi',
            subtitle: 'Ṣakoso ọja ti o n ta lori ọja',
            newListing: 'Akojọ tuntun',
            emptyTitle: 'Ko si akojọ sibẹsibẹ',
            emptyBody: 'Ṣẹda akojọ ki awon onira le ri ọja rẹ lori ọja.',
            createListing: 'Ṣẹda akojọ',
            pricePerKg: 'Iye / kg',
            viewPublic: 'Wo oju-iwe gbangba',
            editListing: 'Ṣatunkọ akojọ',
          }
        : language === 'ig'
          ? {
              title: 'Ndepụta m',
              subtitle: 'Jikwaa ngwaahịa ị na-ere n’ahịa',
              newListing: 'Ndepụta ọhụrụ',
              emptyTitle: 'Enweghị ndepụta ugbu a',
              emptyBody: 'Mepụta ndepụta ka ndị na-azụ ahịa hụ ngwaahịa gị n’ahịa.',
              createListing: 'Mepụta ndepụta',
              pricePerKg: 'Ọnụ / kg',
              viewPublic: 'Lee peeji ọha',
              editListing: 'Dezie ndepụta',
            }
          : {
              title: 'My listings',
              subtitle: 'Manage produce you sell on the marketplace',
              newListing: 'New listing',
              emptyTitle: 'No listings yet',
              emptyBody: 'Create a listing so buyers can find your produce on the marketplace.',
              createListing: 'Create listing',
              pricePerKg: 'Price / kg',
              viewPublic: 'View public page',
              editListing: 'Edit listing',
            }

  useEffect(() => {
    if (!user?.id) return

    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('produce_listings')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false })

        if (error) throw error
        if (!cancelled) setListings((data || []) as ProduceListing[])
      } catch (e) {
        console.error(e)
        if (!cancelled) setListings([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user?.id])

  const formatPrice = (n: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(n)

  const statusLabel = (status: string) => {
    const map: Record<string, string> =
      language === 'ha'
        ? {
            active: 'mai aiki',
            sold: 'an sayar',
            sold_out: 'an sayar duka',
            withdrawn: 'an janye',
            suspended: 'an dakatar',
          }
        : language === 'yo'
          ? {
              active: 'n ṣiṣe',
              sold: 'ti ta',
              sold_out: 'ti ta tan',
              withdrawn: 'ti yọ kuro',
              suspended: 'ti da duro',
            }
          : language === 'ig'
            ? {
                active: 'na-arụ ọrụ',
                sold: 'ereela',
                sold_out: 'erechala ha niile',
                withdrawn: 'ewepụla',
                suspended: 'akwụsịla',
              }
            : {
                active: 'active',
                sold: 'sold',
                sold_out: 'sold out',
                withdrawn: 'withdrawn',
                suspended: 'suspended',
              }
    return map[status] || status
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-stone-900">{copy.title}</h1>
            <p className="text-stone-500">{copy.subtitle}</p>
          </div>
          <Link to="/listings/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {copy.newListing}
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-stone-100 animate-pulse h-40 bg-stone-100" />
            ))}
          </div>
        ) : listings.length === 0 ? (
          <Card className="text-center py-14" padding="lg">
            <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-stone-900 mb-2">{copy.emptyTitle}</h2>
            <p className="text-stone-500 mb-6 max-w-md mx-auto">{copy.emptyBody}</p>
            <Link to="/listings/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                {copy.createListing}
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <Card key={listing.id} padding="lg" className="flex flex-col">
                <div className="flex gap-3 mb-3">
                  <div className="w-16 h-16 rounded-lg bg-stone-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <img
                      src={getProductImageSrc(listing.images?.[0], listing.product_name)}
                      alt=""
                      onError={fallbackOnImageError}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link
                      to={`/listing/${listing.id}`}
                      className="font-semibold text-stone-900 hover:text-primary-700 line-clamp-2"
                    >
                      {listing.product_name}
                    </Link>
                    <div className="flex items-center gap-1 text-sm text-stone-500 mt-1">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{listing.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-stone-100">
                  <div>
                    <p className="text-sm text-stone-500">{copy.pricePerKg}</p>
                    <p className="font-bold text-primary-700">{formatPrice(listing.price_per_kg)}</p>
                  </div>
                  <Badge
                    variant={
                      listing.status === 'active'
                        ? 'success'
                        : listing.status === 'sold' || listing.status === 'sold_out'
                          ? 'default'
                          : 'warning'
                    }
                  >
                    {statusLabel(listing.status)}
                  </Badge>
                </div>

                <div className="mt-3 flex items-center gap-3">
                  <Link
                    to={`/listings/${listing.id}/edit`}
                    className="inline-flex items-center justify-center gap-1 text-sm text-stone-700 font-medium hover:underline"
                  >
                    {copy.editListing}
                    <PencilLine className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to={`/listing/${listing.id}`}
                    className="inline-flex items-center justify-center gap-1 text-sm text-primary-700 font-medium hover:underline"
                  >
                    {copy.viewPublic}
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

import { Link, useParams, Navigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Button } from '../components/ui'
import { ArrowLeft, ExternalLink } from 'lucide-react'

type Channel = 'facebook' | 'x' | 'instagram'

const CHANNELS: Record<
  Channel,
  { title: string; description: string; url: string; cta: string }
> = {
  facebook: {
    title: 'Facebook',
    description: 'Follow Farmers Market on Facebook for deals, farmer stories, and marketplace updates.',
    url: 'https://www.facebook.com',
    cta: 'Open Facebook',
  },
  x: {
    title: 'X (Twitter)',
    description: 'Get quick updates, tips, and announcements from Farmers Market on X.',
    url: 'https://twitter.com',
    cta: 'Open X',
  },
  instagram: {
    title: 'Instagram',
    description: 'See fresh produce, behind-the-scenes logistics, and community highlights on Instagram.',
    url: 'https://www.instagram.com',
    cta: 'Open Instagram',
  },
}

function isChannel(s: string): s is Channel {
  return s === 'facebook' || s === 'x' || s === 'instagram'
}

export function SocialChannel() {
  const { channel } = useParams<{ channel: string }>()
  if (!channel || !isChannel(channel)) {
    return <Navigate to="/" replace />
  }
  const info = CHANNELS[channel]

  return (
    <Layout>
      <div className="max-w-lg mx-auto py-10 px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 mb-8 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>

        <h1 className="text-3xl font-bold text-stone-900 mb-2">Farmers Market on {info.title}</h1>
        <p className="text-stone-600 text-sm leading-relaxed mb-8">{info.description}</p>

        <a href={info.url} target="_blank" rel="noopener noreferrer" className="inline-flex">
          <Button className="gap-2">
            {info.cta}
            <ExternalLink className="w-4 h-4" />
          </Button>
        </a>
      </div>
    </Layout>
  )
}

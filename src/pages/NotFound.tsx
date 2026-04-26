import { Link } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Seo } from '../components/Seo'
import { Button } from '../components/ui'
import { Home, ArrowLeft } from 'lucide-react'

export function NotFound() {
  return (
    <Layout>
      <Seo
        title="Page not found"
        description="The page you are looking for could not be found."
        canonicalPath="/"
        noindex
      />
      <div className="min-h-[60vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <span className="text-[120px] leading-none font-bold text-stone-200">404</span>
          </div>
          <h1 className="text-2xl font-bold text-stone-900 mb-3">Page Not Found</h1>
          <p className="text-stone-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => window.history.back()} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Link to="/">
              <Button>
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}

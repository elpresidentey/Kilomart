import { Link, useNavigate } from 'react-router-dom'
import { Layout } from '../components/Layout'
import { Seo } from '../components/Seo'
import { Button, Input } from '../components/ui'
import { Home, ArrowLeft, Search } from 'lucide-react'

export function NotFound() {
  const navigate = useNavigate()

  function goBack() {
    if (window.history.length > 1) navigate(-1)
    else navigate('/')
  }

  return (
    <Layout>
      <Seo
        title="Page not found"
        description="The page you are looking for could not be found. Return home or search the marketplace."
        canonicalPath="/"
        noindex
      />
      <div className="min-h-[64vh] flex items-center justify-center py-16 px-4">
        <div className="max-w-lg w-full text-center">
          <div className="relative mb-10">
            <span className="text-[120px] leading-none font-bold text-stone-100 select-none">
              404
            </span>
            <span className="absolute inset-0 flex items-center justify-center text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-primary-600 to-primary-800 select-none">
              404
            </span>
          </div>

          <h1 className="text-3xl font-display font-bold text-stone-900 mb-3">
            Page Not Found
          </h1>
          <p className="text-stone-600 mb-8">
            The page you're looking for doesn't exist or has been moved. It might
            have been removed, renamed, or you may have mistyped the address.
          </p>

          <div className="max-w-md mx-auto mb-8">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const q = ((e.currentTarget.elements.namedItem('query') as HTMLInputElement | null)?.value ?? '').trim()
                if (q) navigate(`/marketplace?search=${encodeURIComponent(q)}`)
              }}
              className="flex gap-2"
            >
              <Input
                name="query"
                type="search"
                placeholder="Search produce, categories, farmers..."
                className="flex-1"
              />
              <Button type="submit" size="md" className="px-4">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white px-5 py-2.5 text-sm font-medium text-stone-700 shadow-soft transition-colors hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </button>
            <Link to="/">
              <Button className="w-full sm:w-auto" size="md">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}

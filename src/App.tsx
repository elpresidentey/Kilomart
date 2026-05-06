import { Suspense, lazy, type ReactNode } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ToastViewport } from './components/ToastViewport'
import { I18nProvider } from './i18n/I18nProvider'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { useCart } from './hooks/useCart'
import { LandingPage } from './pages/LandingPage'
import type { User } from './types'

const loadingFallback = (
  <div className="min-h-screen flex items-center justify-center bg-stone-50">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700" />
  </div>
)

const Marketplace = lazy(() => import('./pages/Marketplace').then((mod) => ({ default: mod.Marketplace })))
const Login = lazy(() => import('./pages/Login').then((mod) => ({ default: mod.Login })))
const AuthCallback = lazy(() => import('./pages/AuthCallback').then((mod) => ({ default: mod.AuthCallback })))
const Signup = lazy(() => import('./pages/Signup').then((mod) => ({ default: mod.Signup })))
const FarmerDashboard = lazy(() => import('./pages/FarmerDashboard').then((mod) => ({ default: mod.FarmerDashboard })))
const FarmerListings = lazy(() => import('./pages/FarmerListings').then((mod) => ({ default: mod.FarmerListings })))
const FarmerOrders = lazy(() => import('./pages/FarmerOrders').then((mod) => ({ default: mod.FarmerOrders })))
const BuyerDashboard = lazy(() => import('./pages/BuyerDashboard').then((mod) => ({ default: mod.BuyerDashboard })))
const BuyerOrders = lazy(() => import('./pages/BuyerOrders').then((mod) => ({ default: mod.BuyerOrders })))
const ListingDetail = lazy(() => import('./pages/ListingDetail').then((mod) => ({ default: mod.ListingDetail })))
const CreateListing = lazy(() => import('./pages/CreateListing').then((mod) => ({ default: mod.CreateListing })))
const EditListing = lazy(() => import('./pages/EditListing').then((mod) => ({ default: mod.EditListing })))
const Profile = lazy(() => import('./pages/Profile').then((mod) => ({ default: mod.Profile })))
const Checkout = lazy(() => import('./pages/Checkout').then((mod) => ({ default: mod.Checkout })))
const NotFound = lazy(() => import('./pages/NotFound').then((mod) => ({ default: mod.NotFound })))
const Cart = lazy(() => import('./pages/Cart').then((mod) => ({ default: mod.Cart })))
const Contact = lazy(() => import('./pages/Contact').then((mod) => ({ default: mod.Contact })))
const HelpCenter = lazy(() => import('./pages/HelpCenter').then((mod) => ({ default: mod.HelpCenter })))
const LegalDocument = lazy(() => import('./pages/LegalDocument').then((mod) => ({ default: mod.LegalDocument })))
const About = lazy(() => import('./pages/About').then((mod) => ({ default: mod.About })))
const Careers = lazy(() => import('./pages/Careers').then((mod) => ({ default: mod.Careers })))
const Press = lazy(() => import('./pages/Press').then((mod) => ({ default: mod.Press })))
const Partners = lazy(() => import('./pages/Partners').then((mod) => ({ default: mod.Partners })))
const SocialChannel = lazy(() => import('./pages/SocialChannel').then((mod) => ({ default: mod.SocialChannel })))
const Operations = lazy(() => import('./pages/Operations').then((mod) => ({ default: mod.Operations })))

function ProtectedRoute({
  children,
  allowedRoles,
  denyRoles,
}: {
  children: ReactNode
  allowedRoles?: User['role'][]
  /** If set, users with one of these roles are sent home (e.g. farmers must not use buyer /orders). */
  denyRoles?: User['role'][]
}) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return loadingFallback
  }

  if (!user) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search || ''}`)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }

  if (denyRoles?.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  const { addToCart, getCartItemCount } = useCart()
  const cartItemCount = getCartItemCount()

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/marketplace" element={<Marketplace />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/help" element={<HelpCenter />} />
      <Route path="/legal/:kind" element={<LegalDocument />} />
      <Route path="/about" element={<About />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/press" element={<Press />} />
      <Route path="/partners" element={<Partners />} />
      <Route path="/social/:channel" element={<SocialChannel />} />
      <Route
        path="/operations"
        element={
          <ProtectedRoute>
            <Operations />
          </ProtectedRoute>
        }
      />
      <Route
        path="/listing/:id"
        element={<ListingDetail onAddToCart={addToCart} cartItemCount={cartItemCount} />}
      />

      {/* Protected Routes */}
      <Route
        path="/orders"
        element={
          <ProtectedRoute denyRoles={['farmer']}>
            <BuyerOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/buyer"
        element={
          <ProtectedRoute allowedRoles={['buyer']}>
            <BuyerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />

      {/* Protected Farmer Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/listings/new"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <CreateListing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/listings/:id/edit"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <EditListing />
          </ProtectedRoute>
        }
      />
      <Route
        path="/listings"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerListings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/farmer/orders"
        element={
          <ProtectedRoute allowedRoles={['farmer']}>
            <FarmerOrders />
          </ProtectedRoute>
        }
      />

      {/* Protected Profile Route - All authenticated users */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <I18nProvider>
        <AuthProvider>
          <ErrorBoundary>
            <ToastViewport />
            <Suspense fallback={loadingFallback}>
              <AppRoutes />
            </Suspense>
          </ErrorBoundary>
        </AuthProvider>
      </I18nProvider>
    </BrowserRouter>
  )
}

export default App

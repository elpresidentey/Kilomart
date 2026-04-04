import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { LandingPage } from './pages/LandingPage'
import { Marketplace } from './pages/Marketplace'
import { Login } from './pages/Login'
import { AuthCallback } from './pages/AuthCallback'
import { Signup } from './pages/Signup'
import { FarmerDashboard } from './pages/FarmerDashboard'
import { FarmerListings } from './pages/FarmerListings'
import { FarmerOrders } from './pages/FarmerOrders'
import { BuyerDashboard } from './pages/BuyerDashboard'
import { BuyerOrders } from './pages/BuyerOrders'
import { ListingDetail } from './pages/ListingDetail'
import { CreateListing } from './pages/CreateListing'
import { Profile } from './pages/Profile'
import { Checkout } from './pages/Checkout'
import { useCart } from './hooks/useCart'
import { Cart } from './pages/Cart'
import { Contact } from './pages/Contact'
import { HelpCenter } from './pages/HelpCenter'
import { LegalDocument } from './pages/LegalDocument'
import { About } from './pages/About'
import { Careers } from './pages/Careers'
import { Press } from './pages/Press'
import { Partners } from './pages/Partners'
import { SocialChannel } from './pages/SocialChannel'
import type { User } from './types'

function ProtectedRoute({
  children,
  allowedRoles,
  denyRoles,
}: {
  children: React.ReactNode
  allowedRoles?: User['role'][]
  /** If set, users with one of these roles are sent home (e.g. farmers must not use buyer /orders). */
  denyRoles?: User['role'][]
}) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700" />
      </div>
    )
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
  const { loading } = useAuth()
  const { addToCart, getCartItemCount } = useCart()

  const cartItemCount = getCartItemCount()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700" />
      </div>
    )
  }

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
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App

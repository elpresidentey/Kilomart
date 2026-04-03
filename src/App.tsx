import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { LandingPage } from './pages/LandingPage'
import { Marketplace } from './pages/Marketplace'
import { Login } from './pages/Login'
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

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: User['role'][] }) {
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

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

function App() {
  const { loading } = useAuth()
  const { cart, addToCart, clearCart, getCartItemCount } = useCart()

  const cartItemCount = getCartItemCount()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-700" />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage onClearCart={clearCart} cartItemCount={cartItemCount} />} />
        <Route path="/marketplace" element={<Marketplace cart={cart} onAddToCart={addToCart} />} />
        <Route path="/cart" element={<Cart cartItemCount={cartItemCount} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
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
            <ProtectedRoute>
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
              <Checkout cart={cart} onClearCart={clearCart} cartItemCount={cartItemCount} />
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
    </BrowserRouter>
  )
}

export default App

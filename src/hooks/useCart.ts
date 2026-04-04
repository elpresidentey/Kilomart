import { useCallback } from 'react'
import { useCartStore, cartLineTotal, cartUnitsCount } from '../stores/cartStore'

/**
 * Backwards-compatible hook: all callers share the same Zustand cart store
 * (fixes multiple `useState` instances that desynced between App and Cart).
 */
export function useCart() {
  const cart = useCartStore((s) => s.cart)
  const addToCart = useCartStore((s) => s.addToCart)
  const removeFromCart = useCartStore((s) => s.removeFromCart)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const clearCart = useCartStore((s) => s.clearCart)

  const getCartTotal = useCallback(() => cartLineTotal(cart), [cart])
  const getCartItemCount = useCallback(() => cartUnitsCount(cart), [cart])

  return {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartItemCount,
  }
}

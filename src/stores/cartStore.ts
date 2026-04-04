import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem } from '../types'

/** Legacy key: raw `JSON.stringify(CartItem[])` from the old useCart hook */
const LEGACY_STORAGE_KEY = 'kilomarket_cart'
const PERSIST_NAME = 'kilomarket-cart-store'

function deduplicateCart(items: CartItem[]): CartItem[] {
  const grouped = items.reduce(
    (acc, item) => {
      if (acc[item.id]) acc[item.id].quantity += item.quantity
      else acc[item.id] = { ...item }
      return acc
    },
    {} as Record<string, CartItem>
  )
  return Object.values(grouped)
}

function mergeLine(prev: CartItem[], item: CartItem): CartItem[] {
  const existing = prev.find((i) => i.id === item.id)
  if (existing) {
    return prev.map((i) =>
      i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
    )
  }
  return [...prev, item]
}

export type CartStore = {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
}

export function cartLineTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function cartUnitsCount(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0)
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      addToCart: (item) =>
        set((state) => ({ cart: mergeLine(state.cart, item) })),
      removeFromCart: (itemId) =>
        set((state) => ({ cart: state.cart.filter((i) => i.id !== itemId) })),
      updateQuantity: (itemId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(itemId)
          return
        }
        set((state) => ({
          cart: state.cart.map((i) => (i.id === itemId ? { ...i, quantity } : i)),
        }))
      },
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: PERSIST_NAME,
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const stored = localStorage.getItem(name)
          if (stored) return stored
          const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
          if (!legacy) return null
          try {
            const parsed = JSON.parse(legacy) as unknown
            if (Array.isArray(parsed)) {
              const cart = deduplicateCart(parsed as CartItem[])
              localStorage.removeItem(LEGACY_STORAGE_KEY)
              return JSON.stringify({ state: { cart }, version: 0 })
            }
          } catch {
            /* ignore corrupt legacy */
          }
          return null
        },
        setItem: (name, value) => localStorage.setItem(name, value),
        removeItem: (name) => localStorage.removeItem(name),
      })),
      partialize: (state) => ({ cart: state.cart }),
    }
  )
)

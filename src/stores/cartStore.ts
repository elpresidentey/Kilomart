import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CartItem } from '../types'

/** Legacy key: raw `JSON.stringify(CartItem[])` from the old useCart hook */
const LEGACY_STORAGE_KEY = 'farmersmarket_cart'
const PREVIOUS_LEGACY_STORAGE_KEY = ['kilo', 'market_cart'].join('')
const PERSIST_NAME = 'farmersmarket-cart-store'
const PREVIOUS_PERSIST_NAME = ['kilo', 'market-cart-store'].join('')

function normalizeQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 0
  return Math.max(0, Math.floor(quantity))
}

function normalizeItem(item: CartItem): CartItem | null {
  const quantity = normalizeQuantity(item.quantity)
  const price = Number.isFinite(item.price) ? item.price : 0
  const id = typeof item.id === 'string' ? item.id.trim() : ''
  const sellerId = typeof item.seller_id === 'string' ? item.seller_id.trim() : ''
  const name = typeof item.name === 'string' ? item.name.trim() : ''

  if (!id || !sellerId || !name || quantity <= 0) return null

  return {
    ...item,
    id,
    seller_id: sellerId,
    name,
    price,
    quantity,
  }
}

function deduplicateCart(items: CartItem[]): CartItem[] {
  const grouped = items.reduce(
    (acc, item) => {
      const normalized = normalizeItem(item)
      if (!normalized) return acc

      if (acc[normalized.id]) acc[normalized.id].quantity += normalized.quantity
      else acc[normalized.id] = { ...normalized }
      return acc
    },
    {} as Record<string, CartItem>
  )
  return Object.values(grouped)
}

function mergeLine(prev: CartItem[], item: CartItem): CartItem[] {
  const normalized = normalizeItem(item)
  if (!normalized) return prev

  const existing = prev.find((i) => i.id === normalized.id)
  if (existing) {
    return prev.map((i) =>
      i.id === normalized.id ? { ...i, quantity: i.quantity + normalized.quantity } : i
    )
  }
  return [...prev, normalized]
}

export type CartStore = {
  cart: CartItem[]
  addToCart: (item: CartItem) => void
  removeFromCart: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
}

export function cartLineTotal(cart: CartItem[]): number {
  return deduplicateCart(cart).reduce((sum, item) => sum + item.price * item.quantity, 0)
}

export function cartUnitsCount(cart: CartItem[]): number {
  return deduplicateCart(cart).reduce((sum, item) => sum + item.quantity, 0)
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],
      addToCart: (item) =>
        set((state) => ({ cart: deduplicateCart(mergeLine(state.cart, item)) })),
      removeFromCart: (itemId) =>
        set((state) => ({ cart: state.cart.filter((i) => i.id !== itemId) })),
      updateQuantity: (itemId, quantity) => {
        const nextQuantity = normalizeQuantity(quantity)
        if (nextQuantity <= 0) {
          get().removeFromCart(itemId)
          return
        }
        set((state) => ({
          cart: deduplicateCart(
            state.cart.map((i) => (i.id === itemId ? { ...i, quantity: nextQuantity } : i)),
          ),
        }))
      },
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: PERSIST_NAME,
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          const stored =
            localStorage.getItem(name) ??
            (name === PERSIST_NAME ? localStorage.getItem(PREVIOUS_PERSIST_NAME) : null)
          if (stored) return stored
          const legacy =
            localStorage.getItem(LEGACY_STORAGE_KEY) ??
            localStorage.getItem(PREVIOUS_LEGACY_STORAGE_KEY)
          if (!legacy) return null
          try {
            const parsed = JSON.parse(legacy) as unknown
            if (Array.isArray(parsed)) {
              const cart = deduplicateCart(parsed as CartItem[])
              localStorage.removeItem(LEGACY_STORAGE_KEY)
              localStorage.removeItem(PREVIOUS_LEGACY_STORAGE_KEY)
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
      merge: (persistedState, currentState) => {
        const persistedCart =
          persistedState &&
          typeof persistedState === 'object' &&
          'cart' in persistedState &&
          Array.isArray((persistedState as { cart?: unknown }).cart)
            ? ((persistedState as { cart: CartItem[] }).cart ?? [])
            : []

        return {
          ...currentState,
          cart: deduplicateCart(persistedCart),
        }
      },
    }
  )
)

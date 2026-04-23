import type { User } from '../types'

/** Farmers use seller flows (`/farmer/orders`, listings). Everyone else can use buyer marketplace orders. */
export function isFarmerRole(role: User['role'] | null | undefined): boolean {
  return role === 'farmer'
}

export function canAccessBuyerOrders(role: User['role'] | null | undefined): boolean {
  return !isFarmerRole(role)
}

export function canAccessOperations(role: User['role'] | null | undefined): boolean {
  return role === 'farmer' || role === 'warehouse_manager' || role === 'logistics'
}

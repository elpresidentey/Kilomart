import type { Order } from '../types'

export function formatDeliveryAddress(
  addr: Order['delivery_address'] | null | undefined
): string {
  if (addr == null) return '—'
  if (typeof addr === 'string') return addr || '—'
  const parts = [addr.contact_name, addr.address, addr.city, addr.state, addr.phone].filter(
    Boolean
  ) as string[]
  return parts.length ? parts.join(' · ') : '—'
}

/** Prefer `total_amount` from DB; tolerate legacy `total_price` if ever present. */
export function orderLineTotal(order: {
  total_amount?: number | string | null
  total_price?: number | string | null
}): number {
  const raw = order.total_amount ?? order.total_price
  const n = typeof raw === 'number' ? raw : Number(raw)
  return Number.isFinite(n) ? n : 0
}

export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  role: 'farmer' | 'buyer' | 'warehouse_manager' | 'logistics'
  location?: string
  avatar_url?: string
  bio?: string
  is_verified?: boolean
  verification_documents?: string[]
  created_at?: string
  updated_at?: string
}

export interface ProduceListing {
  id: string
  seller_id: string
  category_id?: string
  category?: { name: string; slug: string }
  product_name: string
  price_per_kg: number
  available_quantity: number
  min_order_kg?: number
  quality_grade: 'A' | 'B' | 'C' | 'D'
  location: string
  description?: string
  images?: string[]
  status: 'active' | 'sold' | 'sold_out' | 'withdrawn' | 'suspended'
  created_at: string
  updated_at: string
  seller?: User
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded'

export interface Order {
  id: string
  order_number: string
  buyer_id: string
  seller_id: string
  listing_id: string | null
  quantity_kg: number
  price_per_kg: number
  subtotal: number
  delivery_fee?: number
  service_fee?: number
  total_amount: number
  status: OrderStatus
  /** Stored as JSON from checkout; legacy rows may be a plain string. */
  delivery_address:
    | string
    | {
        address?: string
        city?: string
        state?: string
        phone?: string
        contact_name?: string
      }
  delivery_instructions?: string | null
  created_at: string
  updated_at?: string
  listing?: ProduceListing
  buyer?: User
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  seller_id: string
  image?: string
}

export interface Warehouse {
  id: string
  name: string
  location: string
  capacity_kg: number
  manager_id: string
  status: 'active' | 'inactive'
  created_at: string
}

export interface Inventory {
  id: string
  warehouse_id: string
  farmer_id: string
  product_name: string
  quantity_kg: number
  quality_grade: 'A' | 'B' | 'C' | 'D'
  stored_at: string
  status: 'in_storage' | 'listed' | 'sold' | 'withdrawn'
  storage_fee_per_kg: number
  listing_id?: string
}

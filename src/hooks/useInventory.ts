import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export type InventoryItem = {
  id: string
  warehouse_id: string
  farmer_id: string
  product_name: string
  quantity_kg: number
  quality_grade: string
  status: string
  stored_at?: string
  warehouse?: {
    name?: string
    location?: string
  } | null
  created_at?: string
  updated_at?: string
}

export type InventoryFormData = {
  warehouse_id: string
  product_name: string
  quantity_kg: string
  quality_grade: string
  status: string
}

type UseInventoryReturn = {
  inventory: InventoryItem[]
  loading: boolean
  error: string | null
  fetchInventory: () => Promise<void>
  addInventory: (data: InventoryFormData, farmerId: string) => Promise<void>
  updateInventory: (id: string, data: InventoryFormData, farmerId: string) => Promise<void>
  deleteInventory: (id: string) => Promise<void>
}

export function useInventory(): UseInventoryReturn {
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('inventory')
        .select('id, warehouse_id, farmer_id, product_name, quantity_kg, quality_grade, status, stored_at, created_at, updated_at, warehouse:warehouses(name, location)')
        .order('created_at', { ascending: false })

      if (err) throw err
      setInventory(data || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch inventory'
      setError(message)
      console.error('Fetch inventory error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addInventory = useCallback(async (data: InventoryFormData, farmerId: string) => {
    try {
      setError(null)

      const payload = {
        warehouse_id: data.warehouse_id,
        farmer_id: farmerId,
        product_name: data.product_name.trim(),
        quantity_kg: parseFloat(data.quantity_kg),
        quality_grade: data.quality_grade,
        status: data.status,
        stored_at: new Date().toISOString(),
      }

      const { error: err } = await supabase.from('inventory').insert([payload])

      if (err) throw err
      await fetchInventory()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add inventory'
      setError(message)
      throw err
    }
  }, [fetchInventory])

  const updateInventory = useCallback(async (id: string, data: InventoryFormData, farmerId: string) => {
    try {
      setError(null)

      const payload = {
        warehouse_id: data.warehouse_id,
        farmer_id: farmerId,
        product_name: data.product_name.trim(),
        quantity_kg: parseFloat(data.quantity_kg),
        quality_grade: data.quality_grade,
        status: data.status,
      }

      const { error: err } = await supabase
        .from('inventory')
        .update(payload)
        .eq('id', id)

      if (err) throw err
      await fetchInventory()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update inventory'
      setError(message)
      throw err
    }
  }, [fetchInventory])

  const deleteInventory = useCallback(async (id: string) => {
    try {
      setError(null)

      const { error: err } = await supabase.from('inventory').delete().eq('id', id)

      if (err) throw err
      await fetchInventory()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete inventory'
      setError(message)
      throw err
    }
  }, [fetchInventory])

  return {
    inventory,
    loading,
    error,
    fetchInventory,
    addInventory,
    updateInventory,
    deleteInventory,
  }
}

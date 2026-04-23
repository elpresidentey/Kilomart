import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export type Warehouse = {
  id: string
  name: string
  location: string
  capacity_kg: number
  available_space_kg: number
  status: string
  contact_phone?: string | null
  created_at?: string
  updated_at?: string
}

export type WarehouseFormData = {
  name: string
  location: string
  capacity_kg: string
  available_space_kg: string
  status: string
  contact_phone: string
}

type UseWarehouseReturn = {
  warehouses: Warehouse[]
  loading: boolean
  error: string | null
  fetchWarehouses: () => Promise<void>
  addWarehouse: (data: WarehouseFormData) => Promise<void>
  updateWarehouse: (id: string, data: WarehouseFormData) => Promise<void>
  deleteWarehouse: (id: string) => Promise<void>
}

export function useWarehouse(): UseWarehouseReturn {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWarehouses = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: err } = await supabase
        .from('warehouses')
        .select('*')
        .order('created_at', { ascending: false })

      if (err) throw err
      setWarehouses(data || [])
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch warehouses'
      setError(message)
      console.error('Fetch warehouses error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const addWarehouse = useCallback(async (data: WarehouseFormData) => {
    try {
      setError(null)

      const payload = {
        name: data.name.trim(),
        location: data.location.trim(),
        capacity_kg: parseFloat(data.capacity_kg),
        available_space_kg: parseFloat(data.available_space_kg) || parseFloat(data.capacity_kg),
        status: data.status,
        contact_phone: data.contact_phone?.trim() || null,
      }

      const { error: err } = await supabase.from('warehouses').insert([payload])

      if (err) throw err
      await fetchWarehouses()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add warehouse'
      setError(message)
      throw err
    }
  }, [fetchWarehouses])

  const updateWarehouse = useCallback(async (id: string, data: WarehouseFormData) => {
    try {
      setError(null)

      const payload = {
        name: data.name.trim(),
        location: data.location.trim(),
        capacity_kg: parseFloat(data.capacity_kg),
        available_space_kg: parseFloat(data.available_space_kg) || parseFloat(data.capacity_kg),
        status: data.status,
        contact_phone: data.contact_phone?.trim() || null,
      }

      const { error: err } = await supabase
        .from('warehouses')
        .update(payload)
        .eq('id', id)

      if (err) throw err
      await fetchWarehouses()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update warehouse'
      setError(message)
      throw err
    }
  }, [fetchWarehouses])

  const deleteWarehouse = useCallback(async (id: string) => {
    try {
      setError(null)

      const { error: err } = await supabase.from('warehouses').delete().eq('id', id)

      if (err) throw err
      await fetchWarehouses()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete warehouse'
      setError(message)
      throw err
    }
  }, [fetchWarehouses])

  return {
    warehouses,
    loading,
    error,
    fetchWarehouses,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
  }
}

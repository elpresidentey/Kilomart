import { useCallback, useState } from 'react'
import { supabase } from '../lib/supabase'

export type LogisticsDriver = {
  id: string
  name: string
  truck: string
  destination: string
  route: string
  pickupArea: string
  capacityKg: number
  availability: 'available' | 'busy' | 'soon'
  rate: string
  providerName?: string | null
}

type BookDriverArgs = {
  driver: LogisticsDriver
}

export function useLogistics() {
  const [drivers, setDrivers] = useState<LogisticsDriver[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookingDriverId, setBookingDriverId] = useState<string | null>(null)

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('logistics_drivers')
        .select(
          'id, full_name, vehicle_name, pickup_area, destination, route, rate_from, capacity_kg, status'
        )
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError

      const nextDrivers = (data || []).map((item: any) => ({
        id: item.id,
        name: item.full_name,
        truck: item.vehicle_name || 'Logistics vehicle',
        destination: item.destination || 'Local delivery',
        route: item.route || 'Assigned on request',
        pickupArea: item.pickup_area || 'Pickup point',
        capacityKg: Number(item.capacity_kg || 0),
        availability: (item.status || 'available') as 'available' | 'busy' | 'soon',
        rate: item.rate_from || 'Custom rate',
        providerName: null,
      }))

      setDrivers(nextDrivers)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load logistics drivers'
      setError(message)
      setDrivers([])
      console.error('Fetch logistics drivers error:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const bookDriver = useCallback(async ({ driver }: BookDriverArgs) => {
    try {
      setBookingDriverId(driver.id)
      setError(null)

      const { error: rpcError } = await supabase.rpc('book_logistics_driver', {
        p_driver_id: driver.id,
        p_pickup_location: driver.pickupArea,
        p_dropoff_location: driver.destination,
        p_notes: `Booked from the app for ${driver.destination}.`,
      })

      if (rpcError) throw rpcError
      await fetchDrivers()
      return { success: true, driverId: driver.id }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to book driver'
      setError(message)
      throw err
    } finally {
      setBookingDriverId(null)
    }
  }, [fetchDrivers])

  return {
    drivers,
    loading,
    error,
    bookingDriverId,
    fetchDrivers,
    bookDriver,
  }
}

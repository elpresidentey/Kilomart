import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  CheckCircle,
  Truck,
  Warehouse as WarehouseIcon,
  Package,
  RefreshCw,
  X,
} from 'lucide-react'
import { Layout } from '../components/Layout'
import { Badge, Button, Card } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { useI18n } from '../i18n/useI18n'
import { useInventory } from '../hooks/useInventory'
import { useLogistics, type LogisticsDriver } from '../hooks/useLogistics'
import { useWarehouse } from '../hooks/useWarehouse'

type Toast = { id: string; type: 'success' | 'error'; message: string }

const sampleDrivers: LogisticsDriver[] = [
  {
    id: 'driver-1',
    name: 'A. Mohammed',
    truck: 'Toyota Hiace - FM 221 LG',
    destination: 'Lagos',
    route: 'Abuja to Lagos',
    pickupArea: 'Kuje warehouse',
    capacityKg: 500,
    availability: 'available',
    rate: 'From NGN 18,000',
  },
  {
    id: 'driver-2',
    name: 'S. Ibrahim',
    truck: 'Box truck - FM 078 TR',
    destination: 'Abuja',
    route: 'Kaduna to Abuja',
    pickupArea: 'Kaduna staging point',
    capacityKg: 1000,
    availability: 'soon',
    rate: 'From NGN 22,000',
  },
  {
    id: 'driver-3',
    name: 'C. Okafor',
    truck: 'Pickup - FM 154 DP',
    destination: 'Ibadan',
    route: 'Abeokuta to Ibadan',
    pickupArea: 'Abeokuta pack house',
    capacityKg: 350,
    availability: 'busy',
    rate: 'From NGN 12,500',
  },
  {
    id: 'driver-4',
    name: 'M. Bello',
    truck: 'Lorry - FM 406 AB',
    destination: 'Port Harcourt',
    route: 'Onitsha to Port Harcourt',
    pickupArea: 'Onitsha depot',
    capacityKg: 1200,
    availability: 'available',
    rate: 'From NGN 28,000',
  },
  {
    id: 'driver-5',
    name: 'F. Yusuf',
    truck: 'Van - FM 512 NG',
    destination: 'Enugu',
    route: 'Aba to Enugu',
    pickupArea: 'Aba logistics yard',
    capacityKg: 600,
    availability: 'available',
    rate: 'From NGN 16,000',
  },
  {
    id: 'driver-6',
    name: 'T. Ibekwe',
    truck: 'Box truck - FM 930 LS',
    destination: 'Ibadan',
    route: 'Lagos to Ibadan',
    pickupArea: 'Ikeja dispatch point',
    capacityKg: 900,
    availability: 'available',
    rate: 'From NGN 20,000',
  },
]

export function Operations() {
  const { user } = useAuth()
  const { t } = useI18n()
  const [searchParams] = useSearchParams()
  const logisticsHook = useLogistics()
  const warehouseHook = useWarehouse()
  const inventoryHook = useInventory()
  const [toasts, setToasts] = useState<Toast[]>([])
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(sampleDrivers[0]?.id ?? null)

  const canManageStorage =
    user?.role === 'farmer' || user?.role === 'warehouse_manager' || user?.role === 'logistics'

  const drivers = logisticsHook.drivers.length > 0 ? logisticsHook.drivers : sampleDrivers
  const availableDrivers = drivers.filter((driver) => driver.availability === 'available').length
  const nearbyDrivers = drivers.filter((driver) => driver.availability !== 'busy').length
  const loading = logisticsHook.loading || (canManageStorage && (warehouseHook.loading || inventoryHook.loading))

  const totalWarehouses = warehouseHook.warehouses.length
  const totalInventoryBatches = inventoryHook.inventory.length
  const totalCapacity = useMemo(
    () => warehouseHook.warehouses.reduce((sum, warehouse) => sum + (warehouse.capacity_kg || 0), 0),
    [warehouseHook.warehouses]
  )
  const totalAvailableSpace = useMemo(
    () => warehouseHook.warehouses.reduce((sum, warehouse) => sum + (warehouse.available_space_kg || 0), 0),
    [warehouseHook.warehouses]
  )
  const storageUtilization = totalCapacity > 0 ? Math.round(((totalCapacity - totalAvailableSpace) / totalCapacity) * 100) : 0

  useEffect(() => {
    void logisticsHook.fetchDrivers()
  }, [logisticsHook.fetchDrivers])

  useEffect(() => {
    if (!canManageStorage || !user) return
    void warehouseHook.fetchWarehouses()
    void inventoryHook.fetchInventory()
  }, [canManageStorage, inventoryHook.fetchInventory, user, warehouseHook.fetchWarehouses])

  useEffect(() => {
    if (searchParams.get('view') !== 'logistics') return
    window.setTimeout(() => document.getElementById('logistics')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }, [searchParams])

  useEffect(() => {
    if (!drivers.some((driver) => driver.id === selectedDriverId)) {
      setSelectedDriverId(drivers[0]?.id ?? null)
    }
  }, [drivers, selectedDriverId])

  const roleLabel =
    user?.role === 'warehouse_manager'
      ? 'Warehouse manager'
      : user?.role === 'logistics'
        ? 'Logistics partner'
        : user?.role === 'farmer'
          ? 'Farmer operations'
          : 'Operations access'

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, type, message }])
    window.setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 5000)
  }

  const selectedDriver = drivers.find((driver) => driver.id === selectedDriverId) || null

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary-700">{roleLabel}</p>
            <h1 className="text-2xl font-bold text-stone-900">Storage & Logistics</h1>
            <p className="text-stone-500">A simple place to check storage status and book available drivers.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await Promise.all([
                logisticsHook.fetchDrivers(),
                canManageStorage ? warehouseHook.fetchWarehouses() : Promise.resolve(),
                canManageStorage ? inventoryHook.fetchInventory() : Promise.resolve(),
              ])
            }}
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('common.refresh')}
          </Button>
        </div>

        <div className="fixed right-4 top-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${
                toast.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}
            >
              {toast.type === 'success' ? (
                <CheckCircle className="h-5 w-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
              )}
              <p className="text-sm font-medium">{toast.message}</p>
              <button
                type="button"
                onClick={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))}
                className="ml-2"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        {canManageStorage ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Card padding="lg" interactive>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary-50 p-3">
                  <WarehouseIcon className="h-5 w-5 text-primary-700" />
                </div>
                <div>
                  <p className="text-sm text-stone-500">Warehouses</p>
                  <p className="text-2xl font-bold text-stone-900">{totalWarehouses}</p>
                </div>
              </div>
            </Card>
            <Card padding="lg" interactive>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-50 p-3">
                  <Package className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm text-stone-500">Inventory batches</p>
                  <p className="text-2xl font-bold text-stone-900">{totalInventoryBatches}</p>
                </div>
              </div>
            </Card>
            <Card padding="lg" interactive>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-stone-100 p-3">
                  <Truck className="h-5 w-5 text-stone-700" />
                </div>
                <div>
                  <p className="text-sm text-stone-500">Storage utilization</p>
                  <p className="text-base font-semibold text-stone-900">{storageUtilization}% full</p>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <Card padding="lg" className="border-stone-200 bg-stone-50/70">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-stone-500">Workspace access</p>
                <h2 className="text-lg font-semibold text-stone-900">Logistics stays visible for test users</h2>
                <p className="mt-1 text-sm text-stone-600">You can book a driver here even if you do not manage storage records.</p>
              </div>
              <Badge variant="warning">Limited access</Badge>
            </div>
          </Card>
        )}

        {canManageStorage && (
          <Card padding="md" interactive className="border-stone-200 bg-stone-50/60">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm text-stone-500">Total capacity</p>
                <p className="text-lg font-semibold text-stone-900">{totalCapacity.toLocaleString()} kg</p>
              </div>
              <div>
                <p className="text-sm text-stone-500">Stored goods</p>
                <p className="text-lg font-semibold text-stone-900">{(totalCapacity - totalAvailableSpace).toLocaleString()} kg</p>
              </div>
              <div>
                <p className="text-sm text-stone-500">Available space</p>
                <p className="text-lg font-semibold text-stone-900">{totalAvailableSpace.toLocaleString()} kg</p>
              </div>
            </div>
          </Card>
        )}

        <div id="logistics" className="scroll-mt-24">
          <Card padding="lg" interactive className="border-amber-100 bg-gradient-to-br from-amber-50/80 via-white to-stone-50">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl space-y-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-amber-700" />
                  <h2 className="text-lg font-semibold text-stone-900">Available drivers</h2>
                </div>
                <p className="text-sm text-stone-600">
                  Pick a driver who is already heading toward your destination, then book them in one step.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Lagos', 'Abuja', 'Ibadan', 'Port Harcourt'].map((destination) => (
                    <span key={destination} className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700 shadow-sm ring-1 ring-amber-100">
                      {destination}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid min-w-[220px] gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Ready now</p>
                  <p className="mt-2 text-2xl font-bold text-stone-900">{availableDrivers}</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Near you</p>
                  <p className="mt-2 text-2xl font-bold text-stone-900">{nearbyDrivers}</p>
                </div>
                <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Selected</p>
                  <p className="mt-2 text-base font-semibold text-stone-900">{selectedDriver?.name || 'None'}</p>
                </div>
              </div>
            </div>

            {logisticsHook.error && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                {logisticsHook.error}
              </div>
            )}

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
              <div className="space-y-4">
                {drivers.map((driver) => {
                  const isSelected = driver.id === selectedDriverId
                  return (
                    <div
                      key={driver.id}
                      className={[
                        'rounded-3xl border bg-white p-4 shadow-sm transition-all',
                        isSelected ? 'border-amber-300 ring-1 ring-amber-100' : 'border-stone-200',
                      ].join(' ')}
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="min-w-0 space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-semibold text-stone-900">{driver.name}</p>
                            <Badge
                              variant={
                                driver.availability === 'available'
                                  ? 'success'
                                  : driver.availability === 'soon'
                                    ? 'warning'
                                    : 'default'
                              }
                            >
                              {driver.availability === 'available'
                                ? 'Available'
                                : driver.availability === 'soon'
                                  ? 'Available soon'
                                  : 'Busy'}
                            </Badge>
                            {isSelected && <Badge variant="info">Selected</Badge>}
                          </div>
                          <p className="text-sm text-stone-600">
                            {driver.route} - pickup at {driver.pickupArea}
                          </p>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-stone-50 px-3 py-1.5 font-medium text-stone-700">{driver.destination}</span>
                            <span className="rounded-full bg-stone-50 px-3 py-1.5 font-medium text-stone-700">{driver.truck}</span>
                            <span className="rounded-full bg-stone-50 px-3 py-1.5 font-medium text-stone-700">{driver.capacityKg.toLocaleString()} kg</span>
                          </div>
                        </div>

                        <div className="flex shrink-0 flex-col gap-2 md:items-end">
                          <p className="text-sm font-medium text-stone-900">{driver.rate}</p>
                          <Button
                            variant={isSelected ? 'secondary' : 'outline'}
                            size="sm"
                            isLoading={logisticsHook.bookingDriverId === driver.id}
                            onClick={async () => {
                              if (!user) return
                              try {
                                await logisticsHook.bookDriver({ driver })
                                setSelectedDriverId(driver.id)
                                addToast('success', `${driver.name} booked for ${driver.destination}`)
                              } catch (err) {
                                addToast('error', err instanceof Error ? err.message : 'Could not book driver')
                              }
                            }}
                            disabled={driver.availability !== 'available' || logisticsHook.loading || !user}
                          >
                            {driver.availability === 'available'
                              ? isSelected
                                ? 'Booked'
                                : 'Book driver'
                              : 'Unavailable'}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="rounded-3xl border border-amber-100 bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">How it works</p>
                <div className="mt-3 space-y-3 text-sm text-stone-600">
                  <p>1. Check each driver&apos;s destination and pickup point.</p>
                  <p>2. Pick the driver who is already headed your way.</p>
                  <p>3. Book the driver if they are available.</p>
                </div>
                <div className="mt-4 rounded-2xl bg-amber-50/70 p-4">
                  <p className="text-sm font-medium text-stone-900">Current selection</p>
                  <p className="mt-1 text-sm text-stone-600">
                    {selectedDriver?.destination || 'Choose a driver to see the destination here.'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  )
}

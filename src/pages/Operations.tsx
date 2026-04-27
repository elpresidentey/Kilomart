import { useEffect, useMemo, useState } from 'react'
import { Layout } from '../components/Layout'
import { useSearchParams } from 'react-router-dom'
import { Badge, Button, Card, Modal } from '../components/ui'
import { useAuth } from '../hooks/useAuth'
import { useLogistics, type LogisticsDriver } from '../hooks/useLogistics'
import { useI18n } from '../i18n/useI18n'
import { useWarehouse, type Warehouse, type WarehouseFormData } from '../hooks/useWarehouse'
import { useInventory, type InventoryFormData, type InventoryItem } from '../hooks/useInventory'
import { AlertCircle, Building2, CheckCircle, Package, Pencil, Plus, RefreshCw, Trash2, Truck, Warehouse as WarehouseIcon, X } from 'lucide-react'

type Toast = { id: string; type: 'success' | 'error'; message: string }
type FieldErrors = Record<string, string>

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
    rate: 'From ₦18,000',
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
    rate: 'From ₦22,000',
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
    rate: 'From ₦12,500',
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
    rate: 'From ₦28,000',
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
    rate: 'From ₦16,000',
  },
  {
    id: 'driver-6',
    name: 'K. Adisa',
    truck: 'Pickup - FM 188 LG',
    destination: 'Kano',
    route: 'Kaduna to Kano',
    pickupArea: 'Kaduna inland depot',
    capacityKg: 400,
    availability: 'soon',
    rate: 'From ₦14,000',
  },
  {
    id: 'driver-7',
    name: 'T. Ibekwe',
    truck: 'Box truck - FM 930 LS',
    destination: 'Ibadan',
    route: 'Lagos to Ibadan',
    pickupArea: 'Ikeja dispatch point',
    capacityKg: 900,
    availability: 'available',
    rate: 'From ₦20,000',
  },
  {
    id: 'driver-8',
    name: 'J. Danladi',
    truck: 'Truck - FM 771 KD',
    destination: 'Benin City',
    route: 'Warri to Benin City',
    pickupArea: 'Warri market hub',
    capacityKg: 800,
    availability: 'busy',
    rate: 'From ₦19,500',
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
  const [warehouseModalOpen, setWarehouseModalOpen] = useState(false)
  const [warehouseSaving, setWarehouseSaving] = useState(false)
  const [warehouseErrors, setWarehouseErrors] = useState<FieldErrors>({})
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
  const [warehouseForm, setWarehouseForm] = useState<WarehouseFormData>({ name: '', location: '', capacity_kg: '', available_space_kg: '', status: 'active', contact_phone: '' })
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false)
  const [inventorySaving, setInventorySaving] = useState(false)
  const [inventoryErrors, setInventoryErrors] = useState<FieldErrors>({})
  const [selectedInventory, setSelectedInventory] = useState<InventoryItem | null>(null)
  const [inventoryForm, setInventoryForm] = useState<InventoryFormData>({ warehouse_id: '', product_name: '', quantity_kg: '', quality_grade: 'A', status: 'in_storage' })

  const addToast = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString()
    setToasts((prev) => [...prev, { id, type, message }])
    window.setTimeout(() => setToasts((prev) => prev.filter((toast) => toast.id !== id)), 5000)
  }

  useEffect(() => {
    if (!user) return
    void warehouseHook.fetchWarehouses()
    void inventoryHook.fetchInventory()
  }, [user, warehouseHook.fetchWarehouses, inventoryHook.fetchInventory])

  useEffect(() => {
    void logisticsHook.fetchDrivers()
  }, [logisticsHook.fetchDrivers])

  useEffect(() => {
    if (searchParams.get('view') !== 'logistics') return
    window.setTimeout(() => {
      document.getElementById('logistics')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }, [searchParams])

  const roleLabel =
    user?.role === 'warehouse_manager'
      ? 'Warehouse manager'
      : user?.role === 'logistics'
        ? 'Logistics partner'
        : 'Farmer operations'
  const totalCapacity = useMemo(() => warehouseHook.warehouses.reduce((sum, warehouse) => sum + (warehouse.capacity_kg || 0), 0), [warehouseHook.warehouses])
  const totalAvailableSpace = useMemo(() => warehouseHook.warehouses.reduce((sum, warehouse) => sum + (warehouse.available_space_kg || 0), 0), [warehouseHook.warehouses])
  const totalStored = Math.max(totalCapacity - totalAvailableSpace, 0)
  const storageUtilization = totalCapacity > 0 ? Math.round((totalStored / totalCapacity) * 100) : 0
  const activeWarehouses = warehouseHook.warehouses.filter((warehouse) => warehouse.status === 'active').length
  const storedBatches = inventoryHook.inventory.filter((item) => item.status === 'in_storage').length
  const logisticsDrivers = logisticsHook.drivers.length > 0 ? logisticsHook.drivers : sampleDrivers
  const availableDrivers = logisticsDrivers.filter((driver) => driver.availability === 'available').length
  const nearbyDrivers = logisticsDrivers.filter((driver) => driver.availability !== 'busy').length
  const loading = warehouseHook.loading || inventoryHook.loading || logisticsHook.loading

  useEffect(() => {
    if (logisticsDrivers.length === 0) return
    if (!logisticsDrivers.some((driver) => driver.id === selectedDriverId)) {
      setSelectedDriverId(logisticsDrivers[0].id)
    }
  }, [logisticsDrivers, selectedDriverId])

  const validateWarehouse = () => {
    const errors: FieldErrors = {}
    if (!warehouseForm.name.trim()) errors.name = 'Warehouse name is required'
    if (!warehouseForm.location.trim()) errors.location = 'Location is required'
    const capacity = Number.parseFloat(warehouseForm.capacity_kg)
    if (!warehouseForm.capacity_kg || Number.isNaN(capacity) || capacity <= 0) errors.capacity_kg = 'Capacity must be a positive number'
    if (warehouseForm.available_space_kg) {
      const available = Number.parseFloat(warehouseForm.available_space_kg)
      if (Number.isNaN(available) || available < 0) errors.available_space_kg = 'Available space must be zero or greater'
    }
    setWarehouseErrors(errors)
    return Object.keys(errors).length === 0
  }

  const validateInventory = () => {
    const errors: FieldErrors = {}
    if (!inventoryForm.warehouse_id) errors.warehouse_id = 'Please select a warehouse'
    if (!inventoryForm.product_name.trim()) errors.product_name = 'Product name is required'
    const quantity = Number.parseFloat(inventoryForm.quantity_kg)
    if (!inventoryForm.quantity_kg || Number.isNaN(quantity) || quantity <= 0) errors.quantity_kg = 'Quantity must be a positive number'
    setInventoryErrors(errors)
    return Object.keys(errors).length === 0
  }

  const resetWarehouseForm = () => {
    setSelectedWarehouse(null)
    setWarehouseForm({ name: '', location: '', capacity_kg: '', available_space_kg: '', status: 'active', contact_phone: '' })
    setWarehouseErrors({})
  }

  const resetInventoryForm = () => {
    setSelectedInventory(null)
    setInventoryForm({ warehouse_id: warehouseHook.warehouses[0]?.id || '', product_name: '', quantity_kg: '', quality_grade: 'A', status: 'in_storage' })
    setInventoryErrors({})
  }

  const openWarehouseModal = (warehouse?: Warehouse) => {
    if (warehouse) {
      setSelectedWarehouse(warehouse)
      setWarehouseForm({ name: warehouse.name, location: warehouse.location, capacity_kg: String(warehouse.capacity_kg), available_space_kg: String(warehouse.available_space_kg), status: warehouse.status, contact_phone: warehouse.contact_phone || '' })
    } else {
      resetWarehouseForm()
    }
    setWarehouseModalOpen(true)
  }

  const closeWarehouseModal = () => { setWarehouseModalOpen(false); resetWarehouseForm() }
  const openInventoryModal = (item?: InventoryItem) => {
    if (item) {
      setSelectedInventory(item)
      setInventoryForm({ warehouse_id: item.warehouse_id, product_name: item.product_name, quantity_kg: String(item.quantity_kg), quality_grade: item.quality_grade, status: item.status })
    } else {
      resetInventoryForm()
    }
    setInventoryModalOpen(true)
  }
  const closeInventoryModal = () => { setInventoryModalOpen(false); resetInventoryForm() }
  const handleSaveWarehouse = async () => {
    if (!validateWarehouse()) return
    setWarehouseSaving(true)
    try {
      if (selectedWarehouse) {
        await warehouseHook.updateWarehouse(selectedWarehouse.id, warehouseForm)
        addToast('success', 'Warehouse updated successfully')
      } else {
        await warehouseHook.addWarehouse(warehouseForm)
        addToast('success', 'Warehouse created successfully')
      }
      closeWarehouseModal()
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to save warehouse')
    } finally {
      setWarehouseSaving(false)
    }
  }

  const handleDeleteWarehouse = async (id: string) => {
    if (!confirm('Are you sure you want to delete this warehouse?')) return
    try {
      await warehouseHook.deleteWarehouse(id)
      addToast('success', 'Warehouse deleted successfully')
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to delete warehouse')
    }
  }

  const handleSaveInventory = async () => {
    if (!validateInventory() || !user?.id) return
    setInventorySaving(true)
    try {
      if (selectedInventory) {
        await inventoryHook.updateInventory(selectedInventory.id, inventoryForm, user.id)
        addToast('success', 'Inventory updated successfully')
      } else {
        await inventoryHook.addInventory(inventoryForm, user.id)
        addToast('success', 'Inventory added successfully')
      }
      closeInventoryModal()
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to save inventory')
    } finally {
      setInventorySaving(false)
    }
  }

  const handleDeleteInventory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this inventory item?')) return
    try {
      await inventoryHook.deleteInventory(id)
      addToast('success', 'Inventory deleted successfully')
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Failed to delete inventory')
    }
  }

  const statusBadge = (status: string) => (status === 'active' || status === 'in_storage' ? 'success' : status === 'full' || status === 'maintenance' ? 'warning' : 'default')

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-primary-700">{roleLabel}</p>
            <h1 className="text-2xl font-bold text-stone-900">Storage & Logistics</h1>
            <p className="text-stone-500">Manage warehouses, inventory, and logistics handoff.</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await Promise.all([
                warehouseHook.fetchWarehouses(),
                inventoryHook.fetchInventory(),
                logisticsHook.fetchDrivers(),
              ])
            }}
            disabled={loading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t('common.refresh')}
          </Button>
        </div>

        {(warehouseHook.error || inventoryHook.error) && (
          <Card padding="md" className="border-red-200 bg-red-50/60">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
              <div className="space-y-1">
                {warehouseHook.error && <p className="text-sm text-red-800">{warehouseHook.error}</p>}
                {inventoryHook.error && <p className="text-sm text-red-800">{inventoryHook.error}</p>}
              </div>
            </div>
          </Card>
        )}

        <div className="fixed right-4 top-4 z-50 space-y-2">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 shadow-lg ${toast.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}
            >
              {toast.type === 'success' ? <CheckCircle className="h-5 w-5 flex-shrink-0" /> : <AlertCircle className="h-5 w-5 flex-shrink-0" />}
              <p className="text-sm font-medium">{toast.message}</p>
              <button type="button" onClick={() => setToasts((prev) => prev.filter((item) => item.id !== toast.id))} className="ml-2">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card padding="lg" interactive><div className="flex items-center gap-3"><div className="rounded-xl bg-primary-50 p-3 transition-transform duration-200 group-hover:scale-105"><WarehouseIcon className="h-5 w-5 text-primary-700" /></div><div><p className="text-sm text-stone-500">Active warehouses</p><p className="text-2xl font-bold text-stone-900">{activeWarehouses}</p></div></div></Card>
          <Card padding="lg" interactive><div className="flex items-center gap-3"><div className="rounded-xl bg-amber-50 p-3 transition-transform duration-200 group-hover:scale-105"><Package className="h-5 w-5 text-amber-700" /></div><div><p className="text-sm text-stone-500">Inventory batches</p><p className="text-2xl font-bold text-stone-900">{storedBatches}</p></div></div></Card>
          <Card padding="lg" interactive><div className="flex items-center gap-3"><div className="rounded-xl bg-stone-100 p-3 transition-transform duration-200 group-hover:scale-105"><Truck className="h-5 w-5 text-stone-700" /></div><div><p className="text-sm text-stone-500">Utilization</p><p className="text-base font-semibold text-stone-900">{storageUtilization}% full</p></div></div></Card>
        </div>

        <Card padding="md" interactive className="border-stone-200 bg-stone-50/60"><div className="grid gap-4 md:grid-cols-3"><div><p className="text-sm text-stone-500">Total capacity</p><p className="text-lg font-semibold text-stone-900">{totalCapacity.toLocaleString()} kg</p></div><div><p className="text-sm text-stone-500">Stored goods</p><p className="text-lg font-semibold text-stone-900">{totalStored.toLocaleString()} kg</p></div><div><p className="text-sm text-stone-500">Available space</p><p className="text-lg font-semibold text-stone-900">{totalAvailableSpace.toLocaleString()} kg</p></div></div></Card>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card padding="lg" interactive>
            <div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Building2 className="h-5 w-5 text-primary-700" /><h2 className="text-lg font-semibold text-stone-900">Warehouses</h2></div><Button size="sm" variant="outline" onClick={() => openWarehouseModal()}><Plus className="mr-1 h-4 w-4" /> Add</Button></div>
            {loading ? <div className="space-y-3">{[1, 2].map((value) => <div key={value} className="h-24 animate-pulse rounded-lg bg-stone-100" />)}</div> : warehouseHook.warehouses.length === 0 ? <p className="text-sm text-stone-500">No warehouses yet. Click &quot;Add&quot; to create one.</p> : <div className="space-y-3">{warehouseHook.warehouses.map((warehouse) => (<div key={warehouse.id} className="group rounded-lg border border-stone-200 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div className="min-w-0 flex-1"><p className="truncate font-semibold text-stone-900">{warehouse.name}</p><p className="truncate text-sm text-stone-500">{warehouse.location}</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => openWarehouseModal(warehouse)} className="rounded-lg p-1.5 text-stone-500 transition-transform duration-200 hover:bg-primary-50 hover:text-primary-600 group-hover:scale-105" title="Edit warehouse"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => handleDeleteWarehouse(warehouse.id)} className="rounded-lg p-1.5 text-stone-500 transition-transform duration-200 hover:bg-red-50 hover:text-red-600 group-hover:scale-105" title="Delete warehouse"><Trash2 className="h-4 w-4" /></button><Badge variant={statusBadge(warehouse.status) as 'default' | 'success' | 'warning'}>{warehouse.status}</Badge></div></div><div className="mt-3 grid grid-cols-2 gap-3 text-sm"><div><p className="text-stone-500">Capacity</p><p className="font-medium text-stone-900">{warehouse.capacity_kg.toLocaleString()} kg</p></div><div><p className="text-stone-500">Available space</p><p className="font-medium text-stone-900">{warehouse.available_space_kg.toLocaleString()} kg</p></div></div>{warehouse.contact_phone && <p className="mt-2 text-xs text-stone-600">{warehouse.contact_phone}</p>}</div>))}</div>}
          </Card>

          <Card padding="lg" interactive>
            <div className="mb-4 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Package className="h-5 w-5 text-primary-700" /><h2 className="text-lg font-semibold text-stone-900">Inventory</h2></div>{warehouseHook.warehouses.length > 0 && <Button size="sm" variant="outline" onClick={() => openInventoryModal()}><Plus className="mr-1 h-4 w-4" /> Add</Button>}</div>
            {loading ? <div className="space-y-3">{[1, 2].map((value) => <div key={value} className="h-24 animate-pulse rounded-lg bg-stone-100" />)}</div> : inventoryHook.inventory.length === 0 ? <p className="text-sm text-stone-500">{warehouseHook.warehouses.length === 0 ? 'Add a warehouse first.' : 'No inventory yet. Click "Add" to add inventory.'}</p> : <div className="space-y-3">{inventoryHook.inventory.map((item) => (<div key={item.id} className="group rounded-lg border border-stone-200 p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-stone-300 hover:shadow-md"><div className="flex items-start justify-between gap-3"><div className="min-w-0 flex-1"><p className="truncate font-semibold text-stone-900">{item.product_name}</p><p className="truncate text-sm text-stone-500">{item.warehouse?.name || 'Warehouse'}{item.warehouse?.location ? ` - ${item.warehouse.location}` : ''}</p></div><div className="flex items-center gap-2"><button type="button" onClick={() => openInventoryModal(item)} className="rounded-lg p-1.5 text-stone-500 transition-transform duration-200 hover:bg-primary-50 hover:text-primary-600 group-hover:scale-105" title="Edit inventory"><Pencil className="h-4 w-4" /></button><button type="button" onClick={() => handleDeleteInventory(item.id)} className="rounded-lg p-1.5 text-stone-500 transition-transform duration-200 hover:bg-red-50 hover:text-red-600 group-hover:scale-105" title="Delete inventory"><Trash2 className="h-4 w-4" /></button><Badge variant="default">{item.quality_grade}</Badge></div></div><div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-stone-600"><span className="font-medium text-stone-900">{item.quantity_kg.toLocaleString()} kg</span><Badge variant={statusBadge(item.status) as 'default' | 'success' | 'warning'}>{item.status}</Badge></div></div>))}</div>}
          </Card>
        </div>

        <div id="logistics" className="scroll-mt-24">
          <Card padding="lg" interactive className="border-amber-100 bg-gradient-to-br from-amber-50/80 via-white to-stone-50">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-amber-700" />
                  <h2 className="text-lg font-semibold text-stone-900">Available drivers</h2>
                </div>
                <p className="mt-2 text-sm text-stone-600">
                  Pick a driver based on the destination they are already heading toward.
                </p>
              </div>
              <Badge variant="warning">{availableDrivers} ready now</Badge>
            </div>

            {logisticsHook.error && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                {logisticsHook.error}
              </div>
            )}

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-stone-500">Available drivers</p>
                <p className="mt-2 text-2xl font-bold text-stone-900">{availableDrivers}</p>
              </div>
              <div className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-stone-500">Near you</p>
                <p className="mt-2 text-2xl font-bold text-stone-900">{nearbyDrivers}</p>
              </div>
              <div className="rounded-xl border border-amber-100 bg-white p-4 shadow-sm">
                <p className="text-sm font-medium text-stone-500">Selected driver</p>
                <p className="mt-2 text-base font-semibold text-stone-900">
                  {logisticsDrivers.find((driver) => driver.id === selectedDriverId)?.name || 'None'}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {logisticsDrivers.map((driver) => {
                const isSelected = driver.id === selectedDriverId
                return (
                  <div
                    key={driver.id}
                    className={[
                      'rounded-2xl border bg-white p-4 shadow-sm transition-all',
                      isSelected ? 'border-primary-300 ring-1 ring-primary-100' : 'border-stone-200',
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
                          Going to <span className="font-medium text-stone-900">{driver.destination}</span>{' '}
                          from <span className="font-medium text-stone-900">{driver.pickupArea}</span>
                        </p>
                        <div className="grid gap-2 sm:grid-cols-3">
                          <div className="rounded-xl bg-stone-50 px-3 py-2">
                            <p className="text-xs uppercase tracking-wide text-stone-500">Route</p>
                            <p className="text-sm font-medium text-stone-900">{driver.route}</p>
                          </div>
                          <div className="rounded-xl bg-stone-50 px-3 py-2">
                            <p className="text-xs uppercase tracking-wide text-stone-500">Truck</p>
                            <p className="text-sm font-medium text-stone-900">{driver.truck}</p>
                          </div>
                          <div className="rounded-xl bg-stone-50 px-3 py-2">
                            <p className="text-xs uppercase tracking-wide text-stone-500">Capacity</p>
                            <p className="text-sm font-medium text-stone-900">{driver.capacityKg.toLocaleString()} kg</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col gap-2 md:items-end">
                        <p className="text-sm font-medium text-stone-900">{driver.rate}</p>
                        <Button
                          variant={isSelected ? 'secondary' : 'outline'}
                          size="sm"
                          isLoading={logisticsHook.bookingDriverId === driver.id}
                          onClick={async () => {
                            if (!user) {
                              addToast('error', 'Please sign in to book a driver')
                              return
                            }
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
                              : user
                                ? 'Book driver'
                                : 'Sign in to book'
                            : 'Unavailable'}
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>
        </div>
      </div>
      <Modal open={warehouseModalOpen} onClose={closeWarehouseModal} title={selectedWarehouse ? 'Edit Warehouse' : 'Add Warehouse'} footer={<div className="flex gap-2"><Button variant="outline" onClick={closeWarehouseModal} disabled={warehouseSaving} className="flex-1">Cancel</Button><Button onClick={handleSaveWarehouse} disabled={warehouseSaving} className="flex-1">{warehouseSaving ? 'Saving...' : selectedWarehouse ? 'Update' : 'Create'}</Button></div>}>
        <div className="space-y-4">
          {Object.keys(warehouseErrors).length > 0 && <div className="rounded-lg border border-red-200 bg-red-50 p-3"><div className="space-y-1">{Object.entries(warehouseErrors).map(([field, message]) => <p key={field} className="text-sm text-red-700">{message}</p>)}</div></div>}
          <div><label htmlFor="warehouse-name" className="mb-1.5 block text-sm font-medium text-stone-700">Warehouse Name</label><input id="warehouse-name" type="text" className={`block w-full rounded-lg border px-3 py-2.5 text-sm ${warehouseErrors.name ? 'border-red-300' : 'border-stone-300'} focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`} value={warehouseForm.name} onChange={(e) => setWarehouseForm({ ...warehouseForm, name: e.target.value })} placeholder="Central Storage Hub" disabled={warehouseSaving} /></div>
          <div><label htmlFor="warehouse-location" className="mb-1.5 block text-sm font-medium text-stone-700">Location</label><input id="warehouse-location" type="text" className={`block w-full rounded-lg border px-3 py-2.5 text-sm ${warehouseErrors.location ? 'border-red-300' : 'border-stone-300'} focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`} value={warehouseForm.location} onChange={(e) => setWarehouseForm({ ...warehouseForm, location: e.target.value })} placeholder="Kano, Kano State" disabled={warehouseSaving} /></div>
          <div><label htmlFor="warehouse-capacity" className="mb-1.5 block text-sm font-medium text-stone-700">Capacity (kg)</label><input id="warehouse-capacity" type="number" step="0.01" min="0" className={`block w-full rounded-lg border px-3 py-2.5 text-sm ${warehouseErrors.capacity_kg ? 'border-red-300' : 'border-stone-300'} focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`} value={warehouseForm.capacity_kg} onChange={(e) => setWarehouseForm({ ...warehouseForm, capacity_kg: e.target.value })} placeholder="50000" disabled={warehouseSaving} /></div>
          <div><label htmlFor="warehouse-available-space" className="mb-1.5 block text-sm font-medium text-stone-700">Available Space (kg)</label><input id="warehouse-available-space" type="number" step="0.01" min="0" className={`block w-full rounded-lg border px-3 py-2.5 text-sm ${warehouseErrors.available_space_kg ? 'border-red-300' : 'border-stone-300'} focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`} value={warehouseForm.available_space_kg} onChange={(e) => setWarehouseForm({ ...warehouseForm, available_space_kg: e.target.value })} placeholder="25000" disabled={warehouseSaving} /></div>
          <div><label htmlFor="warehouse-status" className="mb-1.5 block text-sm font-medium text-stone-700">Status</label><select id="warehouse-status" value={warehouseForm.status} onChange={(e) => setWarehouseForm({ ...warehouseForm, status: e.target.value as WarehouseFormData['status'] })} className="block w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" disabled={warehouseSaving}><option value="active">Active</option><option value="inactive">Inactive</option><option value="maintenance">Maintenance</option><option value="full">Full</option></select></div>
          <div><label htmlFor="warehouse-contact-phone" className="mb-1.5 block text-sm font-medium text-stone-700">Contact Phone</label><input id="warehouse-contact-phone" type="tel" className="block w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" value={warehouseForm.contact_phone} onChange={(e) => setWarehouseForm({ ...warehouseForm, contact_phone: e.target.value })} placeholder="+234 80 123 4567" disabled={warehouseSaving} /></div>
        </div>
      </Modal>

      <Modal open={inventoryModalOpen} onClose={closeInventoryModal} title={selectedInventory ? 'Edit Inventory' : 'Add Inventory'} footer={<div className="flex gap-2"><Button variant="outline" onClick={closeInventoryModal} disabled={inventorySaving} className="flex-1">Cancel</Button><Button onClick={handleSaveInventory} disabled={inventorySaving} className="flex-1">{inventorySaving ? 'Saving...' : selectedInventory ? 'Update' : 'Create'}</Button></div>}>
        <div className="space-y-4">
          {Object.keys(inventoryErrors).length > 0 && <div className="rounded-lg border border-red-200 bg-red-50 p-3"><div className="space-y-1">{Object.entries(inventoryErrors).map(([field, message]) => <p key={field} className="text-sm text-red-700">{message}</p>)}</div></div>}
          <div><label htmlFor="inventory-warehouse" className="mb-1.5 block text-sm font-medium text-stone-700">Warehouse</label><select id="inventory-warehouse" value={inventoryForm.warehouse_id} onChange={(e) => setInventoryForm({ ...inventoryForm, warehouse_id: e.target.value })} className={`block w-full rounded-lg border px-3 py-2.5 text-sm ${inventoryErrors.warehouse_id ? 'border-red-300' : 'border-stone-300'} focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`} disabled={inventorySaving || warehouseHook.warehouses.length === 0}><option value="">Select a warehouse</option>{warehouseHook.warehouses.map((warehouse) => <option key={warehouse.id} value={warehouse.id}>{warehouse.name} - {warehouse.location}</option>)}</select></div>
          <div><label htmlFor="inventory-product" className="mb-1.5 block text-sm font-medium text-stone-700">Product Name</label><input id="inventory-product" type="text" className={`block w-full rounded-lg border px-3 py-2.5 text-sm ${inventoryErrors.product_name ? 'border-red-300' : 'border-stone-300'} focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`} value={inventoryForm.product_name} onChange={(e) => setInventoryForm({ ...inventoryForm, product_name: e.target.value })} placeholder="Plantains" disabled={inventorySaving} /></div>
          <div><label htmlFor="inventory-quantity" className="mb-1.5 block text-sm font-medium text-stone-700">Quantity (kg)</label><input id="inventory-quantity" type="number" step="0.01" min="0" className={`block w-full rounded-lg border px-3 py-2.5 text-sm ${inventoryErrors.quantity_kg ? 'border-red-300' : 'border-stone-300'} focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500`} value={inventoryForm.quantity_kg} onChange={(e) => setInventoryForm({ ...inventoryForm, quantity_kg: e.target.value })} placeholder="500" disabled={inventorySaving} /></div>
          <div><label htmlFor="inventory-quality" className="mb-1.5 block text-sm font-medium text-stone-700">Quality Grade</label><select id="inventory-quality" value={inventoryForm.quality_grade} onChange={(e) => setInventoryForm({ ...inventoryForm, quality_grade: e.target.value as InventoryFormData['quality_grade'] })} className="block w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" disabled={inventorySaving}><option value="A">Grade A - Premium</option><option value="B">Grade B - Good</option><option value="C">Grade C - Fair</option><option value="D">Grade D - Poor</option></select></div>
          <div><label htmlFor="inventory-status" className="mb-1.5 block text-sm font-medium text-stone-700">Status</label><select id="inventory-status" value={inventoryForm.status} onChange={(e) => setInventoryForm({ ...inventoryForm, status: e.target.value as InventoryFormData['status'] })} className="block w-full rounded-lg border border-stone-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500" disabled={inventorySaving}><option value="in_storage">In Storage</option><option value="listed">Listed</option><option value="sold">Sold</option><option value="withdrawn">Withdrawn</option></select></div>
        </div>
      </Modal>
    </Layout>
  )
}

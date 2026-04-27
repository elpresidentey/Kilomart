type OrderItem = {
  listing_id: string
  quantity_kg: number
}

type DeliveryInfo = {
  fullName: string
  phone: string
  address: string
  city: string
  state: string
}

type Body = {
  items: OrderItem[]
  deliveryInfo: DeliveryInfo
  paymentMethod: 'cash_on_delivery' | 'bank_transfer' | 'paystack'
  providerReference?: string
}

type ListingRow = {
  id: string
  seller_id: string
  price_per_kg: number
  available_quantity: number
}

type PaymentRow = {
  order_id: string
}

type CreatedOrderRow = {
  id: string
  order_number: string
}

function parseBody(input: unknown): Body | null {
  if (!input) return null
  if (typeof input === 'string') {
    try {
      return JSON.parse(input) as Body
    } catch {
      return null
    }
  }
  return input as Body
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function isValidPaymentMethod(value: unknown): value is Body['paymentMethod'] {
  return value === 'cash_on_delivery' || value === 'bank_transfer' || value === 'paystack'
}

function isValidOrderItem(item: unknown): item is OrderItem {
  if (!item || typeof item !== 'object') return false
  const row = item as Partial<OrderItem>
  return (
    isNonEmptyString(row.listing_id) &&
    typeof row.quantity_kg === 'number' &&
    Number.isFinite(row.quantity_kg) &&
    row.quantity_kg > 0
  )
}

function isValidDeliveryInfo(value: unknown): value is DeliveryInfo {
  if (!value || typeof value !== 'object') return false
  const row = value as Partial<DeliveryInfo>
  return (
    isNonEmptyString(row.fullName) &&
    isNonEmptyString(row.phone) &&
    isNonEmptyString(row.address) &&
    isNonEmptyString(row.city) &&
    isNonEmptyString(row.state)
  )
}

function getEnv(env: Record<string, string | undefined>, ...keys: string[]): string {
  for (const key of keys) {
    const value = env[key]?.trim()
    if (value) return value
  }
  return ''
}

function generateFallbackOrderNumber() {
  return `KM-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0')}`
}

async function safeJson(response: Response): Promise<any> {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

async function postJson(
  url: string,
  headers: Record<string, string>,
  body: unknown,
  options?: { returnRepresentation?: boolean }
) {
  return fetch(url, {
    method: 'POST',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
      ...(options?.returnRepresentation ? { Prefer: 'return=representation' } : {}),
    },
    body: JSON.stringify(body),
  })
}

async function patchJson(url: string, headers: Record<string, string>, body: unknown) {
  return fetch(url, {
    method: 'PATCH',
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
}

async function createOrderViaRest(
  supabaseUrl: string,
  authToken: string,
  apiKey: string,
  buyerId: string,
  listing: ListingRow,
  item: OrderItem,
  deliveryInfo: DeliveryInfo,
  paymentMethod: Body['paymentMethod'],
  providerReference: string | undefined,
  deliveryFeePerItem: number,
  mutationKey?: string
) {
  const orderNumber = generateFallbackOrderNumber()
  const subtotal = Number((listing.price_per_kg * item.quantity_kg).toFixed(2))
  const totalAmount = Number((subtotal + deliveryFeePerItem).toFixed(2))
  const authHeaders = {
    Authorization: `Bearer ${authToken}`,
    Apikey: apiKey,
  }

  const orderRes = await postJson(
    `${supabaseUrl}/rest/v1/orders?select=id,order_number`,
    authHeaders,
    {
      order_number: orderNumber,
      buyer_id: buyerId,
      seller_id: listing.seller_id,
      listing_id: item.listing_id,
      quantity_kg: item.quantity_kg,
      price_per_kg: listing.price_per_kg,
      subtotal,
      delivery_fee: deliveryFeePerItem,
      total_amount: totalAmount,
      delivery_address: {
        address: deliveryInfo.address,
        city: deliveryInfo.city,
        state: deliveryInfo.state,
        phone: deliveryInfo.phone,
        contact_name: deliveryInfo.fullName,
      },
      status: paymentMethod === 'paystack' ? 'paid' : 'pending',
    },
    { returnRepresentation: true }
  )

  if (!orderRes.ok) {
    const err = await safeJson(orderRes)
    throw new Error(err?.message || err?.error || `Failed to create order for ${item.listing_id}`)
  }

  const createdOrders = (await orderRes.json()) as CreatedOrderRow[]
  const createdOrder = createdOrders?.[0]
  if (!createdOrder?.id || !createdOrder.order_number) {
    throw new Error('Failed to create order')
  }

  if (mutationKey) {
    const nextAvailableQuantity = Number((listing.available_quantity - item.quantity_kg).toFixed(2))
    const listingRes = await patchJson(
      `${supabaseUrl}/rest/v1/produce_listings?id=eq.${item.listing_id}`,
      {
        Authorization: `Bearer ${mutationKey}`,
        Apikey: mutationKey,
      },
      {
        available_quantity: nextAvailableQuantity,
        status: nextAvailableQuantity <= 0 ? 'sold_out' : 'active',
      }
    )

    if (!listingRes.ok) {
      const err = await safeJson(listingRes)
      throw new Error(err?.message || err?.error || `Failed to update stock for ${item.listing_id}`)
    }
  }

  const paymentRes = await postJson(
    `${supabaseUrl}/rest/v1/payments?select=id`,
    authHeaders,
    {
      order_id: createdOrder.id,
      payer_id: buyerId,
      payee_id: listing.seller_id,
      amount: totalAmount,
      currency: 'NGN',
      payment_method: paymentMethod,
      provider: paymentMethod === 'paystack' ? 'paystack' : null,
      provider_reference: providerReference || null,
      status: paymentMethod === 'paystack' ? 'completed' : 'pending',
    }
  )

  if (!paymentRes.ok) {
    const err = await safeJson(paymentRes)
    throw new Error(err?.message || err?.error || `Failed to create payment for ${item.listing_id}`)
  }

  return {
    orderId: createdOrder.id,
    orderNumber: createdOrder.order_number,
  }
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const env = (globalThis as any)?.process?.env ?? {}
  const supabaseUrl = getEnv(env, 'SUPABASE_URL', 'VITE_SUPABASE_URL')
  const supabaseKey = getEnv(env, 'SUPABASE_ANON_KEY', 'VITE_SUPABASE_ANON_KEY')
  const serviceRoleKey = getEnv(env, 'SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !supabaseKey) {
    res.status(500).json({ error: 'Supabase not configured' })
    return
  }

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }

  const token = authHeader.replace('Bearer ', '')
  const body = parseBody(req.body)

  if (
    !body ||
    !Array.isArray(body.items) ||
    body.items.length === 0 ||
    !body.items.every(isValidOrderItem) ||
    !isValidDeliveryInfo(body.deliveryInfo) ||
    !isValidPaymentMethod(body.paymentMethod) ||
    (body.providerReference != null && !isNonEmptyString(body.providerReference))
  ) {
    res.status(400).json({ error: 'Invalid request body' })
    return
  }

  const { items, deliveryInfo, paymentMethod } = body
  const providerReference = body.providerReference?.trim() || undefined
  const deliveryFee = 1500
  const deliveryFeePerItem = deliveryFee / items.length

  try {
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Apikey: supabaseKey,
      },
    })

    if (!userRes.ok) {
      res.status(401).json({ error: 'Invalid token' })
      return
    }

    const userData = await userRes.json()
    const buyerId = userData.id

    if (providerReference) {
      const existingPaymentsRes = await fetch(
        `${supabaseUrl}/rest/v1/payments?payer_id=eq.${buyerId}&provider_reference=eq.${encodeURIComponent(providerReference)}&select=order_id`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Apikey: supabaseKey,
          },
        }
      )

      if (!existingPaymentsRes.ok) {
        throw new Error('Could not check for existing payments')
      }

      const existingPayments = (await existingPaymentsRes.json()) as PaymentRow[]
      const existingOrderIds = [...new Set(existingPayments.map((payment) => payment.order_id).filter(Boolean))]

      if (existingOrderIds.length > 0) {
        const orderNumbersRes = await fetch(
          `${supabaseUrl}/rest/v1/orders?id=in.(${existingOrderIds.join(',')})&select=id,order_number`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Apikey: supabaseKey,
            },
          }
        )

        if (!orderNumbersRes.ok) {
          throw new Error('Could not load existing orders')
        }

        const existingOrders = await orderNumbersRes.json()
        res.status(200).json({
          success: true,
          orderIds: existingOrderIds,
          orderNumbers: (existingOrders || []).map((order: { order_number: string }) => order.order_number),
          alreadyProcessed: true,
        })
        return
      }
    }

    const listingIds = items.map((item) => item.listing_id)
    const listingsRes = await fetch(
      `${supabaseUrl}/rest/v1/produce_listings?id=in.(${listingIds.join(',')})&select=id,price_per_kg,seller_id,available_quantity`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Apikey: supabaseKey,
        },
      }
    )

    if (!listingsRes.ok) {
      const err = await listingsRes.text()
      throw new Error(`Could not load listings: ${err}`)
    }

    const listings = (await listingsRes.json()) as ListingRow[]
    if (!listings?.length) {
      res.status(400).json({ error: 'Listings not found' })
      return
    }

    const listingMap = new Map(listings.map((listing) => [listing.id, listing] as const))
    const orderNumbers: string[] = []
    const orderIds: string[] = []
    const mutationKey = serviceRoleKey || supabaseKey

    for (const item of items) {
      const listing = listingMap.get(item.listing_id)

      if (!listing) {
        res.status(400).json({ error: `Listing ${item.listing_id} not found` })
        return
      }

      if (listing.available_quantity < item.quantity_kg) {
        res.status(400).json({ error: `Insufficient stock for listing ${item.listing_id}` })
        return
      }

      const rpcResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/create_order_with_stock`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          Apikey: mutationKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          p_listing_id: item.listing_id,
          p_quantity_kg: item.quantity_kg,
          p_buyer_id: buyerId,
          p_seller_id: listing.seller_id,
          p_price_per_kg: listing.price_per_kg,
          p_delivery_fee: deliveryFeePerItem,
          p_delivery_address: {
            address: deliveryInfo.address,
            city: deliveryInfo.city,
            state: deliveryInfo.state,
            phone: deliveryInfo.phone,
            contact_name: deliveryInfo.fullName,
          },
          p_payment_method: paymentMethod,
          p_status: paymentMethod === 'paystack' ? 'paid' : 'pending',
          p_provider_reference: providerReference || null,
        }),
      })

      const rpcData = await safeJson(rpcResponse)
      if (!rpcResponse.ok) {
        const rpcMessage = rpcData?.message || rpcData?.error || ''
        const missingRpc =
          rpcResponse.status === 404 ||
          /could not find the function/i.test(rpcMessage) ||
          /schema cache/i.test(rpcMessage)

        if (!missingRpc) {
          throw new Error(rpcMessage || `Failed to create order for ${item.listing_id}`)
        }

        if (!serviceRoleKey) {
          throw new Error(
            'The checkout RPC is missing from Supabase and SUPABASE_SERVICE_ROLE_KEY is not configured for fallback.'
          )
        }

        const fallback = await createOrderViaRest(
          supabaseUrl,
          token,
          supabaseKey,
          buyerId,
          listing,
          item,
          deliveryInfo,
          paymentMethod,
          providerReference,
          deliveryFeePerItem,
          serviceRoleKey || undefined
        )
        orderIds.push(fallback.orderId)
        orderNumbers.push(fallback.orderNumber)
        continue
      }

      const orderId = String(rpcData ?? '')
      if (!orderId) {
        throw new Error('Failed to create order')
      }

      const orderRes = await fetch(
        `${supabaseUrl}/rest/v1/orders?id=eq.${orderId}&select=id,order_number`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Apikey: supabaseKey,
          },
        }
      )

      if (!orderRes.ok) {
        const err = await orderRes.text()
        throw new Error(`Could not load created order: ${err}`)
      }

      const createdOrders = await orderRes.json()
      const orderNumber = createdOrders?.[0]?.order_number

      if (!orderNumber) {
        throw new Error('Failed to get order number')
      }

      orderIds.push(orderId)
      orderNumbers.push(orderNumber)
    }

    res.status(200).json({
      success: true,
      orderNumbers,
      orderIds,
    })
  } catch (e: any) {
    console.error('Order creation error:', e)
    res.status(500).json({ error: e?.message || 'Failed to create order' })
  }
}

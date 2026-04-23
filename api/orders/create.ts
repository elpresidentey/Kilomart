type OrderItem = {
  listing_id: string
  quantity_kg: number
}

type Body = {
  items: OrderItem[]
  deliveryInfo: {
    fullName: string
    phone: string
    address: string
    city: string
    state: string
  }
  paymentMethod: 'cash_on_delivery' | 'bank_transfer' | 'paystack'
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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const env = (globalThis as any)?.process?.env ?? {}
  const supabaseUrl = env.SUPABASE_URL
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY

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

  // Verify user and get their ID
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

  const body = parseBody(req.body)
  if (!body?.items?.length || !body.deliveryInfo) {
    res.status(400).json({ error: 'Invalid request body' })
    return
  }

  const { items, deliveryInfo, paymentMethod } = body

  try {
    // Fetch listings with their current prices and seller IDs from DB
    const listingIds = items.map((i) => i.listing_id)
    const listingsRes = await fetch(
      `${supabaseUrl}/rest/v1/produce_listings?id=in.(${listingIds.join(',')})&select=id,price_per_kg,seller_id,quantity_kg`,
      {
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          Apikey: supabaseKey,
        },
      }
    )

    const listings = await listingsRes.json()
    if (!listings?.length) {
      res.status(400).json({ error: 'Listings not found' })
      return
    }

    // Create a map for quick lookup
    const listingMap = new Map(listings.map((l: any) => [l.id, l]))

    const deliveryFee = 1500
    const deliveryFeePerItem = deliveryFee / items.length
    const orderNumbers: string[] = []
    const orderIds: string[] = []

    for (const item of items) {
      const listing = listingMap.get(item.listing_id)
      if (!listing) {
        res.status(400).json({ error: `Listing ${item.listing_id} not found` })
        return
      }

      // Check stock
      if (listing.quantity_kg < item.quantity_kg) {
        res.status(400).json({ error: `Insufficient stock for listing ${item.listing_id}` })
        return
      }

      const pricePerKg = listing.price_per_kg
      const subtotal = pricePerKg * item.quantity_kg
      const totalAmount = subtotal + deliveryFeePerItem

      const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8).toUpperCase()

      // Create order
      const orderRes = await fetch(`${supabaseUrl}/rest/v1/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          Apikey: supabaseKey,
          'Content-Type': 'application/json',
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          order_number: orderNumber,
          buyer_id: buyerId,
          seller_id: listing.seller_id,
          listing_id: listing.id,
          quantity_kg: item.quantity_kg,
          price_per_kg: pricePerKg,
          subtotal: subtotal,
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
        }),
      })

      if (!orderRes.ok) {
        const err = await orderRes.text()
        throw new Error(`Failed to create order: ${err}`)
      }

      const orderData = await orderRes.json()
      const orderId = Array.isArray(orderData) ? orderData[0]?.id : orderData?.id

      if (!orderId) {
        throw new Error('Failed to get order ID')
      }

      // Create payment record
      const paymentRes = await fetch(`${supabaseUrl}/rest/v1/payments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${supabaseKey}`,
          Apikey: supabaseKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: orderId,
          payer_id: buyerId,
          payee_id: listing.seller_id,
          amount: totalAmount,
          currency: 'NGN',
          payment_method: paymentMethod,
          provider: paymentMethod === 'paystack' ? 'paystack' : null,
          status: paymentMethod === 'paystack' ? 'completed' : 'pending',
        }),
      })

      if (!paymentRes.ok) {
        console.warn('Failed to create payment record')
      }

      // Decrement stock
      const updateRes = await fetch(
        `${supabaseUrl}/rest/v1/produce_listings?id=eq.${listing.id}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${supabaseKey}`,
            Apikey: supabaseKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quantity_kg: listing.quantity_kg - item.quantity_kg,
          }),
        }
      )

      if (!updateRes.ok) {
        console.warn('Failed to update stock')
      }

      orderNumbers.push(orderNumber)
      orderIds.push(orderId)
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

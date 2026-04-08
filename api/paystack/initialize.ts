type Body = {
  email?: string
  amountKobo?: number
  callbackUrl?: string
  metadata?: Record<string, unknown>
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const secret = process.env.PAYSTACK_SECRET_KEY
  if (!secret) {
    res.status(500).json({ error: 'PAYSTACK_SECRET_KEY is not configured' })
    return
  }

  const body = (req.body || {}) as Body
  if (!body.email || !body.amountKobo || body.amountKobo < 100) {
    res.status(400).json({ error: 'Invalid email or amount' })
    return
  }

  try {
    const r = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secret}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: body.email,
        amount: body.amountKobo,
        callback_url: body.callbackUrl,
        metadata: body.metadata || {},
      }),
    })

    const data = await r.json()
    if (!r.ok || !data?.status) {
      res.status(400).json({ error: data?.message || 'Failed to initialize payment' })
      return
    }

    res.status(200).json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Paystack initialize failed' })
  }
}


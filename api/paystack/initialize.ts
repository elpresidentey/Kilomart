type Body = {
  email?: string
  amountKobo?: number
  callbackUrl?: string
  metadata?: Record<string, unknown>
}

function parseBody(input: unknown): Body {
  if (!input) return {}
  if (typeof input === 'string') {
    try {
      return JSON.parse(input) as Body
    } catch {
      return {}
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
  const secret = env.PAYSTACK_SECRET_KEY
  if (!secret) {
    res.status(500).json({ error: 'PAYSTACK_SECRET_KEY is not configured' })
    return
  }

  const body = parseBody(req.body)
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

    const raw = await r.text()
    let data: any = null
    try {
      data = raw ? JSON.parse(raw) : null
    } catch {
      data = null
    }
    if (!r.ok || !data?.status) {
      res.status(r.status || 400).json({
        error: data?.message || `Failed to initialize payment (HTTP ${r.status})`,
      })
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

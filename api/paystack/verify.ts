export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const env = (globalThis as any)?.process?.env ?? {}
  const secret = env.PAYSTACK_SECRET_KEY
  if (!secret) {
    res.status(500).json({ error: 'PAYSTACK_SECRET_KEY is not configured' })
    return
  }

  const reference = req.query?.reference
  if (!reference || typeof reference !== 'string') {
    res.status(400).json({ error: 'Missing reference' })
    return
  }

  try {
    const r = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${secret}` },
    })
    const data = await r.json()
    if (!r.ok || !data?.status) {
      res.status(400).json({ error: data?.message || 'Verification failed' })
      return
    }

    const tx = data.data
    res.status(200).json({
      status: tx.status,
      reference: tx.reference,
      amount: tx.amount,
      paid_at: tx.paid_at,
      metadata: tx.metadata || {},
      gateway_response: tx.gateway_response,
    })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Paystack verify failed' })
  }
}


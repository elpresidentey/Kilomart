type ChatBody = {
  message?: string
  history?: Array<{ role: 'user' | 'assistant'; content: string }>
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const env = (globalThis as any)?.process?.env ?? {}
  const apiKey = env.DEEPSEEK_API_KEY
  if (!apiKey) {
    res.status(500).json({ error: 'DEEPSEEK_API_KEY is not configured' })
    return
  }

  const body = (req.body || {}) as ChatBody
  const message = (body.message || '').trim()
  if (!message) {
    res.status(400).json({ error: 'Message is required' })
    return
  }

  const systemPrompt = [
    'You are KiloMarket Assistant, a concise support bot for a Nigerian produce marketplace.',
    'Help users with: what KiloMarket does, onboarding, login/signup, email confirmation, browsing marketplace, cart/checkout, payments, order tracking, and seller listings.',
    'Keep answers short and practical with 1-4 clear steps.',
    'Do not invent account/order/payment status. If user needs account-specific help, tell them to check Orders/Profile or contact support via /contact.',
    'If user asks unrelated harmful or sensitive advice, decline briefly and redirect to app-related help.',
  ].join(' ')

  const clippedHistory = Array.isArray(body.history) ? body.history.slice(-6) : []
  const messages = [
    { role: 'system', content: systemPrompt },
    ...clippedHistory.map((h) => ({ role: h.role, content: h.content })),
    { role: 'user', content: message },
  ]

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.DEEPSEEK_MODEL || 'deepseek-chat',
        temperature: 0.3,
        max_tokens: 220,
        messages,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      const msg = data?.error?.message || 'Assistant request failed'
      res.status(500).json({ error: msg })
      return
    }

    const reply = data?.choices?.[0]?.message?.content?.trim()
    if (!reply) {
      res.status(500).json({ error: 'Assistant returned an empty response' })
      return
    }

    res.status(200).json({ reply })
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'Assistant request failed' })
  }
}


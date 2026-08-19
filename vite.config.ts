import { parse } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import type { Connect, UserConfig } from 'vite'
import createOrderHandler from './api/orders/create'
import initializePaystackHandler from './api/paystack/initialize'
import verifyPaystackHandler from './api/paystack/verify'

function jsonBodyParser(): Connect.NextHandleFunction {
  return (req, _res, next) => {
    if (req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'PATCH') {
      next()
      return
    }
    let chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8')
      if (raw) {
        try {
          ;(req as any).body = JSON.parse(raw)
        } catch {
          ;(req as any).body = raw
        }
      }
      next()
    })
    req.on('error', next)
  }
}

function vercelHandler(handler: (req: any, res: any) => any): Connect.NextHandleFunction {
  return (req, res, next) => {
    const url = parse(req.url || '', true)
    req.query = url.query
    req.path = url.pathname

    res.status = (code: number) => {
      res.statusCode = code
      return res
    }
    res.set = res.setHeader
    res.json = (body: unknown) => {
      if (!res.getHeader('Content-Type')) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8')
      }
      res.end(JSON.stringify(body))
      return res
    }

    Promise.resolve(handler(req, res)).catch((error) => {
      console.error('[api] handler error:', error)
      if (!res.writableEnded) {
        res.status(500).json({ error: error?.message || 'Internal server error' })
      } else {
        next(error)
      }
    })
  }
}

function apiRoutes(): UserConfig['plugins'][number] {
  return {
    name: 'vercel-api-routes',
    configureServer(server) {
      server.middlewares.use('/api', jsonBodyParser())
      server.middlewares.use('/api/orders/create', vercelHandler(createOrderHandler))
      server.middlewares.use('/api/paystack/initialize', vercelHandler(initializePaystackHandler))
      server.middlewares.use('/api/paystack/verify', vercelHandler(verifyPaystackHandler))
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] == null && value != null) {
      process.env[key] = value
    }
  }
  return {
    plugins: [apiRoutes()],
  }
})

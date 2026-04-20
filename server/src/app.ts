import cors from 'cors'
import express from 'express'
import type { Request, Response } from 'express'
import type { EarningsStore } from './storage/earnings-store.ts'

type CreateAppOptions = {
  store: EarningsStore
  corsOrigins: string[]
  apiSecret?: string
}

function resolveCorsOrigin(origins: string[]): cors.CorsOptions['origin'] {
  if (!origins.length) {
    return true
  }

  return origins
}

export function createApp(options: CreateAppOptions) {
  const app = express()

  app.use(
    cors({
      origin: resolveCorsOrigin(options.corsOrigins),
    }),
  )
  app.use(express.json())

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    })
  })

  app.get('/api/public/earnings/total', (_req: Request, res: Response) => {
    const snapshot = options.store.getTotalSnapshot()
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).json({
      total_usd: snapshot.totalUsd,
      reports_count: snapshot.reportsCount,
      updated_at: snapshot.updatedAt,
    })
  })

  if (options.apiSecret) {
    app.get('/api/private/earnings/entries', (req: Request, res: Response) => {
      const secret = req.header('x-api-secret')
      if (secret !== options.apiSecret) {
        res.status(401).json({ message: 'Unauthorized' })
        return
      }

      const limitInput = req.query.limit
      const limit = typeof limitInput === 'string' ? Number.parseInt(limitInput, 10) : 20
      const normalizedLimit =
        Number.isFinite(limit) && limit > 0 && limit <= 100 ? limit : 20

      res.status(200).json({
        items: options.store.getLastEntries(normalizedLimit),
      })
    })
  }

  return app
}

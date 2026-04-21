import { randomUUID, timingSafeEqual } from 'node:crypto'
import cors from 'cors'
import express from 'express'
import type { Request, Response } from 'express'
import { z } from 'zod'
import type { EarningsStore } from './storage/earnings-store.ts'

const PRIVATE_ENDPOINT_WINDOW_MS = 60_000
const PRIVATE_ENDPOINT_MAX_REQUESTS = 60
const LEAD_ENDPOINT_WINDOW_MS = 10 * 60_000
const LEAD_ENDPOINT_MAX_REQUESTS = 10

const leadRequestSchema = z.object({
  name: z.string().trim().min(2).max(80),
  contact: z.string().trim().min(3).max(100),
  goal: z.string().trim().max(300).optional(),
  selected_tariff: z.string().trim().max(120).optional(),
})

type EmailJsConfig = {
  serviceId: string
  templateId: string
  publicKey: string
}

type CreateAppOptions = {
  store: EarningsStore
  corsOrigins: string[]
  apiSecret?: string
  emailJs?: EmailJsConfig
}

function resolveCorsOrigin(origins: string[]): cors.CorsOptions['origin'] {
  const allowedOrigins = new Set(
    origins
      .map((origin) => origin.trim())
      .filter(Boolean),
  )

  return (origin, callback) => {
    if (!origin) {
      callback(null, true)
      return
    }

    callback(null, allowedOrigins.has(origin))
  }
}

type RateLimitCheckResult = {
  allowed: boolean
  retryAfterSec: number
}

type RateLimitOptions = {
  windowMs: number
  maxRequests: number
}

function createRateLimiter(options: RateLimitOptions) {
  const buckets = new Map<string, { count: number; resetAt: number }>()

  return (key: string): RateLimitCheckResult => {
    const now = Date.now()
    const existing = buckets.get(key)
    if (!existing || existing.resetAt <= now) {
      buckets.set(key, {
        count: 1,
        resetAt: now + options.windowMs,
      })

      return {
        allowed: true,
        retryAfterSec: Math.ceil(options.windowMs / 1000),
      }
    }

    existing.count += 1
    if (existing.count > options.maxRequests) {
      return {
        allowed: false,
        retryAfterSec: Math.ceil((existing.resetAt - now) / 1000),
      }
    }

    return {
      allowed: true,
      retryAfterSec: Math.ceil((existing.resetAt - now) / 1000),
    }
  }
}

function resolveClientKey(req: Request): string {
  return req.ip || req.socket.remoteAddress || 'unknown'
}

function secretsMatch(provided: string | undefined, expected: string): boolean {
  if (!provided) {
    return false
  }

  const providedBuffer = Buffer.from(provided)
  const expectedBuffer = Buffer.from(expected)
  if (providedBuffer.length !== expectedBuffer.length) {
    return false
  }

  return timingSafeEqual(providedBuffer, expectedBuffer)
}

function formatLeadTime(): string {
  return new Intl.DateTimeFormat('ru-KZ', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    hour12: false,
    timeZone: 'Asia/Almaty',
  }).format(new Date())
}

async function sendLeadToEmailJs(
  lead: z.infer<typeof leadRequestSchema>,
  emailJs: EmailJsConfig | undefined,
): Promise<void> {
  if (!emailJs) {
    return
  }

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      service_id: emailJs.serviceId,
      template_id: emailJs.templateId,
      user_id: emailJs.publicKey,
      template_params: {
        name: lead.name,
        contact: lead.contact,
        goal: lead.goal || 'Не указана',
        tariff: lead.selected_tariff || 'Не выбран',
        consent: 'Да',
        time: formatLeadTime(),
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`EmailJS request failed with status ${response.status}`)
  }
}

export function createApp(options: CreateAppOptions) {
  const app = express()
  const privateEntriesRateLimiter = createRateLimiter({
    windowMs: PRIVATE_ENDPOINT_WINDOW_MS,
    maxRequests: PRIVATE_ENDPOINT_MAX_REQUESTS,
  })
  const publicLeadsRateLimiter = createRateLimiter({
    windowMs: LEAD_ENDPOINT_WINDOW_MS,
    maxRequests: LEAD_ENDPOINT_MAX_REQUESTS,
  })

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

  app.post('/api/public/leads', async (req: Request, res: Response) => {
    const rateLimitCheck = publicLeadsRateLimiter(resolveClientKey(req))
    if (!rateLimitCheck.allowed) {
      res.setHeader('Retry-After', String(rateLimitCheck.retryAfterSec))
      res.status(429).json({ message: 'Too Many Requests' })
      return
    }

    const parsedBody = leadRequestSchema.safeParse(req.body)
    if (!parsedBody.success) {
      res.status(400).json({ message: 'Invalid request body' })
      return
    }

    try {
      await sendLeadToEmailJs(parsedBody.data, options.emailJs)
    } catch (error: unknown) {
      console.error('Lead notification send failed:', error)
    }

    res.status(202).json({
      id: randomUUID(),
      status: 'accepted',
    })
  })

  if (typeof options.apiSecret === 'string') {
    const privateApiSecret = options.apiSecret

    app.get('/api/private/earnings/entries', (req: Request, res: Response) => {
      const rateLimitCheck = privateEntriesRateLimiter(resolveClientKey(req))
      if (!rateLimitCheck.allowed) {
        res.setHeader('Retry-After', String(rateLimitCheck.retryAfterSec))
        res.status(429).json({ message: 'Too Many Requests' })
        return
      }

      const secret = req.header('x-api-secret')
      if (!secretsMatch(secret, privateApiSecret)) {
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

import path from 'node:path'
import { config as loadEnv } from 'dotenv'
import { z } from 'zod'

loadEnv({ path: '.env.server', override: false })
loadEnv({ override: false })

const envSchema = z.object({
  SERVER_PORT: z.coerce.number().int().positive().optional(),
  PORT: z.coerce.number().int().positive().optional(),
  APP_TIMEZONE: z.string().min(1).default('Asia/Almaty'),
  DATA_FILE_PATH: z.string().min(1).default('server/data/store.json'),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
  ADMIN_TELEGRAM_IDS: z.string().default(''),
  ALLOWED_TELEGRAM_IDS: z.string().default(''),
  API_SECRET: z.string().min(1).optional(),
  EMAILJS_SERVICE_ID: z.string().min(1).optional(),
  EMAILJS_TEMPLATE_ID: z.string().min(1).optional(),
  EMAILJS_PUBLIC_KEY: z.string().min(1).optional(),
})

const parsed = envSchema.parse(process.env)

function parseTelegramIds(value: string): number[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => Number.parseInt(item, 10))
    .filter((item) => Number.isFinite(item))
}

function parseCorsOrigins(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export const env = {
  serverPort: parsed.SERVER_PORT ?? parsed.PORT ?? 8787,
  appTimeZone: parsed.APP_TIMEZONE,
  dataFilePath: path.isAbsolute(parsed.DATA_FILE_PATH)
    ? parsed.DATA_FILE_PATH
    : path.resolve(process.cwd(), parsed.DATA_FILE_PATH),
  corsOrigins: parseCorsOrigins(parsed.CORS_ORIGINS),
  telegramBotToken: parsed.TELEGRAM_BOT_TOKEN,
  adminTelegramIds: parseTelegramIds(parsed.ADMIN_TELEGRAM_IDS),
  allowedTelegramIds: parseTelegramIds(parsed.ALLOWED_TELEGRAM_IDS),
  apiSecret: parsed.API_SECRET,
  emailJs:
    parsed.EMAILJS_SERVICE_ID && parsed.EMAILJS_TEMPLATE_ID && parsed.EMAILJS_PUBLIC_KEY
      ? {
          serviceId: parsed.EMAILJS_SERVICE_ID,
          templateId: parsed.EMAILJS_TEMPLATE_ID,
          publicKey: parsed.EMAILJS_PUBLIC_KEY,
        }
      : undefined,
} as const

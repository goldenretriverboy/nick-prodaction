import type { Context } from 'telegraf'
import type { Telegraf } from 'telegraf'
import { createApp } from './app.ts'
import { createTelegramBot } from './bot/create-telegram-bot.ts'
import { env } from './config/env.ts'
import { EarningsStore } from './storage/earnings-store.ts'

const store = new EarningsStore(env.dataFilePath, env.appTimeZone)

for (const adminId of env.adminTelegramIds) {
  store.setUserAdmin(adminId, true)
  store.setUserAccess(adminId, true)
}

for (const allowedId of env.allowedTelegramIds) {
  store.setUserAccess(allowedId, true)
}

const app = createApp({
  store,
  corsOrigins: env.corsOrigins,
  apiSecret: env.apiSecret,
})

const server = app.listen(env.serverPort, () => {
  console.log(`HTTP server started on :${env.serverPort}`)
})

let bot: Telegraf<Context> | null = null

if (env.telegramBotToken) {
  bot = createTelegramBot({
    token: env.telegramBotToken,
    store,
    timeZone: env.appTimeZone,
  })

  bot
    .launch()
    .then(() => {
      console.log('Telegram bot started in long polling mode')
    })
    .catch((error: unknown) => {
      console.error('Failed to start Telegram bot:', error)
    })
} else {
  console.warn('TELEGRAM_BOT_TOKEN is not set. Bot startup skipped.')
}

function shutdown(signal: string): void {
  console.log(`Received ${signal}. Shutting down...`)

  if (bot) {
    bot.stop(signal)
  }

  server.close((error) => {
    if (error) {
      console.error('HTTP server close error:', error)
      process.exit(1)
      return
    }

    process.exit(0)
  })
}

process.on('SIGINT', () => shutdown('SIGINT'))
process.on('SIGTERM', () => shutdown('SIGTERM'))

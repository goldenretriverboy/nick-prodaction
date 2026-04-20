import type { Context } from 'telegraf'
import { Telegraf } from 'telegraf'
import { message } from 'telegraf/filters'
import { formatUsdAmount, parseUsdAmount } from '../lib/amount.ts'
import { formatDateTimeInTimeZone } from '../lib/time.ts'
import type { EarningsStore } from '../storage/earnings-store.ts'

type CreateTelegramBotOptions = {
  token: string
  store: EarningsStore
  timeZone: string
}

type TelegramSender = {
  id: number
  username: string | null
}

function extractSender(ctx: Context): TelegramSender | null {
  const from = ctx.from
  if (!from) {
    return null
  }

  return {
    id: from.id,
    username: from.username ?? null,
  }
}

function extractCommandArgs(ctx: Context): string[] {
  const maybeMessage = ctx.message
  if (!maybeMessage || !('text' in maybeMessage)) {
    return []
  }

  const chunks = maybeMessage.text.trim().split(/\s+/)
  return chunks.slice(1)
}

async function requireAdmin(ctx: Context, store: EarningsStore): Promise<number | null> {
  const sender = extractSender(ctx)
  if (!sender) {
    return null
  }

  store.upsertUser({ telegramUserId: sender.id, username: sender.username })
  if (store.isAdmin(sender.id)) {
    return sender.id
  }

  await ctx.reply('Эта команда доступна только администратору.')
  return null
}

async function handleAddAmount(
  ctx: Context,
  store: EarningsStore,
  amountInput: string,
): Promise<void> {
  const sender = extractSender(ctx)
  if (!sender) {
    return
  }

  store.upsertUser({ telegramUserId: sender.id, username: sender.username })

  if (!store.canSubmitEarnings(sender.id)) {
    await ctx.reply(
      'У вас нет доступа к отправке суммы. Напишите администратору для включения в whitelist.',
    )
    return
  }

  const amountUsd = parseUsdAmount(amountInput)
  if (amountUsd === null) {
    await ctx.reply(
      'Неверный формат суммы. Отправьте число в USD, например: 150 или 150.75',
    )
    return
  }

  const entry = store.addEarningsEntry(sender.id, amountUsd)
  const totals = store.getTotalSnapshot()

  await ctx.reply(
    [
      `Сумма сохранена: ${formatUsdAmount(amountUsd)}`,
      `ID записи: ${entry.id}`,
      `Общий заработок: ${formatUsdAmount(totals.totalUsd)}`,
    ].join('\n'),
  )
}

export function createTelegramBot(options: CreateTelegramBotOptions): Telegraf<Context> {
  const bot = new Telegraf(options.token)

  bot.start(async (ctx) => {
    const sender = extractSender(ctx)
    if (sender) {
      options.store.upsertUser({
        telegramUserId: sender.id,
        username: sender.username,
      })
    }

    await ctx.reply(
      [
        'Бот для учета заработка в USD.',
        'Отправьте сумму сообщением (например: 120.50) или командой /add 120.50.',
        'Количество отправок не ограничено.',
      ].join('\n'),
    )
  })

  bot.help(async (ctx) => {
    await ctx.reply(
      [
        'Команды:',
        '/id - показать ваш Telegram user id',
        '/add <amount> - добавить сумму в USD',
        '/total - общая сумма (admin)',
        '/last [n] - последние записи (admin)',
        '/edit <entry_id> <amount> - редактировать запись (admin)',
        '/delete <entry_id> - удалить запись (admin)',
        '/grant <telegram_user_id> - дать доступ пользователю (admin)',
        '/revoke <telegram_user_id> - забрать доступ у пользователя (admin)',
      ].join('\n'),
    )
  })

  bot.command('id', async (ctx) => {
    const sender = extractSender(ctx)
    if (!sender) {
      return
    }

    const user = options.store.upsertUser({
      telegramUserId: sender.id,
      username: sender.username,
    })

    const accessStatus = user.isAllowed || user.isAdmin ? 'разрешен' : 'не разрешен'
    const roleStatus = user.isAdmin ? 'admin' : 'user'

    await ctx.reply(
      [
        `Ваш telegram_user_id: ${sender.id}`,
        `Username: ${sender.username ? `@${sender.username}` : 'не указан'}`,
        `Роль: ${roleStatus}`,
        `Доступ к отправке суммы: ${accessStatus}`,
      ].join('\n'),
    )
  })

  bot.command('add', async (ctx) => {
    const [amountInput] = extractCommandArgs(ctx)
    if (!amountInput) {
      await ctx.reply('Использование: /add 120.50')
      return
    }

    await handleAddAmount(ctx, options.store, amountInput)
  })

  bot.command('total', async (ctx) => {
    const adminId = await requireAdmin(ctx, options.store)
    if (!adminId) {
      return
    }

    const totals = options.store.getTotalSnapshot()
    options.store.appendAuditLog({
      adminTelegramUserId: adminId,
      action: 'total',
      payload: {},
    })

    await ctx.reply(
      [
        `Общая сумма: ${formatUsdAmount(totals.totalUsd)}`,
        `Количество записей: ${totals.reportsCount}`,
        `Обновлено: ${formatDateTimeInTimeZone(totals.updatedAt, options.timeZone)}`,
      ].join('\n'),
    )
  })

  bot.command('last', async (ctx) => {
    const adminId = await requireAdmin(ctx, options.store)
    if (!adminId) {
      return
    }

    const [limitInput] = extractCommandArgs(ctx)
    const limit = limitInput ? Number.parseInt(limitInput, 10) : 5

    if (!Number.isFinite(limit) || limit < 1 || limit > 20) {
      await ctx.reply('Использование: /last [1..20]')
      return
    }

    const entries = options.store.getLastEntries(limit)
    options.store.appendAuditLog({
      adminTelegramUserId: adminId,
      action: 'last',
      payload: { limit },
    })

    if (!entries.length) {
      await ctx.reply('Записей пока нет.')
      return
    }

    const lines = entries.map((entry, index) => {
      const label = options.store.getUserLabel(entry.telegramUserId)
      const createdAt = formatDateTimeInTimeZone(entry.createdAt, options.timeZone)
      return `${index + 1}. ${entry.id} | ${formatUsdAmount(entry.amountUsd)} | ${label} | ${createdAt}`
    })

    await ctx.reply(lines.join('\n'))
  })

  bot.command('edit', async (ctx) => {
    const adminId = await requireAdmin(ctx, options.store)
    if (!adminId) {
      return
    }

    const [entryId, amountInput] = extractCommandArgs(ctx)
    if (!entryId || !amountInput) {
      await ctx.reply('Использование: /edit <entry_id> <amount>')
      return
    }

    const amountUsd = parseUsdAmount(amountInput)
    if (amountUsd === null) {
      await ctx.reply('Неверный формат суммы. Пример: /edit <id> 125.75')
      return
    }

    const updated = options.store.editEarningsEntry(entryId, amountUsd, adminId)
    if (!updated) {
      await ctx.reply('Запись не найдена.')
      return
    }

    options.store.appendAuditLog({
      adminTelegramUserId: adminId,
      action: 'edit',
      payload: { entryId, amountUsd },
    })

    await ctx.reply(`Запись обновлена: ${entryId} -> ${formatUsdAmount(amountUsd)}`)
  })

  bot.command('delete', async (ctx) => {
    const adminId = await requireAdmin(ctx, options.store)
    if (!adminId) {
      return
    }

    const [entryId] = extractCommandArgs(ctx)
    if (!entryId) {
      await ctx.reply('Использование: /delete <entry_id>')
      return
    }

    const deleted = options.store.deleteEarningsEntry(entryId)
    if (!deleted) {
      await ctx.reply('Запись не найдена.')
      return
    }

    options.store.appendAuditLog({
      adminTelegramUserId: adminId,
      action: 'delete',
      payload: { entryId },
    })

    await ctx.reply(`Запись удалена: ${entryId}`)
  })

  bot.command('grant', async (ctx) => {
    const adminId = await requireAdmin(ctx, options.store)
    if (!adminId) {
      return
    }

    const [targetIdInput] = extractCommandArgs(ctx)
    const targetId = targetIdInput ? Number.parseInt(targetIdInput, 10) : Number.NaN
    if (!Number.isFinite(targetId)) {
      await ctx.reply('Использование: /grant <telegram_user_id>')
      return
    }

    options.store.setUserAccess(targetId, true)
    options.store.appendAuditLog({
      adminTelegramUserId: adminId,
      action: 'grant',
      payload: { targetId },
    })

    await ctx.reply(`Доступ открыт для пользователя ${targetId}.`)
  })

  bot.command('revoke', async (ctx) => {
    const adminId = await requireAdmin(ctx, options.store)
    if (!adminId) {
      return
    }

    const [targetIdInput] = extractCommandArgs(ctx)
    const targetId = targetIdInput ? Number.parseInt(targetIdInput, 10) : Number.NaN
    if (!Number.isFinite(targetId)) {
      await ctx.reply('Использование: /revoke <telegram_user_id>')
      return
    }

    options.store.setUserAccess(targetId, false)
    options.store.appendAuditLog({
      adminTelegramUserId: adminId,
      action: 'revoke',
      payload: { targetId },
    })

    await ctx.reply(`Доступ закрыт для пользователя ${targetId}.`)
  })

  bot.on(message('text'), async (ctx) => {
    const text = ctx.message.text.trim()
    if (!text || text.startsWith('/')) {
      return
    }

    if (parseUsdAmount(text) === null) {
      return
    }

    await handleAddAmount(ctx, options.store, text)
  })

  return bot
}

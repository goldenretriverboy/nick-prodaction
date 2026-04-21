import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import type {
  AdminAuditLog,
  EarningsEntry,
  StoredUser,
  StoreSnapshot,
} from '../domain/types.ts'
import { getDayKeyFromIso, getDayKeyInTimeZone } from '../lib/time.ts'

const EMPTY_SNAPSHOT: StoreSnapshot = {
  version: 1,
  users: [],
  entries: [],
  auditLogs: [],
  updatedAt: new Date().toISOString(),
}

type UpsertUserInput = {
  telegramUserId: number
  username: string | null
}

type AuditLogInput = {
  adminTelegramUserId: number
  action: string
  payload: Record<string, unknown>
}

export class EarningsStore {
  private data: StoreSnapshot
  private readonly filePath: string
  private readonly timeZone: string

  constructor(filePath: string, timeZone: string) {
    this.filePath = filePath
    this.timeZone = timeZone
    this.data = this.readSnapshot()
  }

  private readSnapshot(): StoreSnapshot {
    this.ensureDirectory()

    if (!fs.existsSync(this.filePath)) {
      this.writeSnapshot(EMPTY_SNAPSHOT)
      return structuredClone(EMPTY_SNAPSHOT)
    }

    try {
      const raw = fs.readFileSync(this.filePath, 'utf-8')
      const parsed = JSON.parse(raw) as StoreSnapshot
      if (!Array.isArray(parsed.users) || !Array.isArray(parsed.entries)) {
        throw new Error('Invalid store data shape')
      }

      return {
        version: 1,
        users: parsed.users,
        entries: parsed.entries,
        auditLogs: Array.isArray(parsed.auditLogs) ? parsed.auditLogs : [],
        updatedAt: parsed.updatedAt ?? new Date().toISOString(),
      }
    } catch {
      this.writeSnapshot(EMPTY_SNAPSHOT)
      return structuredClone(EMPTY_SNAPSHOT)
    }
  }

  private ensureDirectory(): void {
    const directory = path.dirname(this.filePath)
    fs.mkdirSync(directory, { recursive: true })
  }

  private writeSnapshot(snapshot: StoreSnapshot): void {
    const tempPath = `${this.filePath}.tmp`
    fs.writeFileSync(tempPath, JSON.stringify(snapshot, null, 2), 'utf-8')
    fs.renameSync(tempPath, this.filePath)
  }

  private persist(): void {
    this.data.updatedAt = new Date().toISOString()
    this.writeSnapshot(this.data)
  }

  private findUserIndex(telegramUserId: number): number {
    return this.data.users.findIndex((user) => user.telegramUserId === telegramUserId)
  }

  upsertUser(input: UpsertUserInput): StoredUser {
    const now = new Date().toISOString()
    const userIndex = this.findUserIndex(input.telegramUserId)

    if (userIndex === -1) {
      const nextUser: StoredUser = {
        telegramUserId: input.telegramUserId,
        username: input.username,
        isAllowed: false,
        isAdmin: false,
        createdAt: now,
        updatedAt: now,
      }
      this.data.users.push(nextUser)
      this.persist()
      return nextUser
    }

    const existing = this.data.users[userIndex]
    const shouldUpdateUsername =
      input.username !== null && input.username !== existing.username

    if (!shouldUpdateUsername) {
      return existing
    }

    const updated: StoredUser = {
      ...existing,
      username: input.username,
      updatedAt: now,
    }
    this.data.users[userIndex] = updated
    this.persist()
    return updated
  }

  setUserAccess(telegramUserId: number, isAllowed: boolean): StoredUser {
    const existing = this.getUser(telegramUserId)
    const user = existing ?? this.upsertUser({ telegramUserId, username: null })
    const updated: StoredUser = {
      ...user,
      isAllowed,
      updatedAt: new Date().toISOString(),
    }
    this.data.users[this.findUserIndex(telegramUserId)] = updated
    this.persist()
    return updated
  }

  setUserAdmin(telegramUserId: number, isAdmin: boolean): StoredUser {
    const existing = this.getUser(telegramUserId)
    const user = existing ?? this.upsertUser({ telegramUserId, username: null })
    const updated: StoredUser = {
      ...user,
      isAdmin,
      updatedAt: new Date().toISOString(),
    }
    this.data.users[this.findUserIndex(telegramUserId)] = updated
    this.persist()
    return updated
  }

  getUser(telegramUserId: number): StoredUser | null {
    return this.data.users.find((user) => user.telegramUserId === telegramUserId) ?? null
  }

  getUserLabel(telegramUserId: number): string {
    const user = this.getUser(telegramUserId)
    if (!user) {
      return String(telegramUserId)
    }

    if (user.username) {
      return `@${user.username}`
    }

    return String(user.telegramUserId)
  }

  isAdmin(telegramUserId: number): boolean {
    const user = this.getUser(telegramUserId)
    return Boolean(user?.isAdmin)
  }

  canSubmitEarnings(telegramUserId: number): boolean {
    const user = this.getUser(telegramUserId)
    if (!user) {
      return false
    }

    return user.isAllowed || user.isAdmin
  }

  getTodaysEntryCount(telegramUserId: number, now = new Date()): number {
    const todayKey = getDayKeyInTimeZone(now, this.timeZone)
    return this.data.entries.filter(
      (entry) =>
        entry.telegramUserId === telegramUserId &&
        getDayKeyFromIso(entry.createdAt, this.timeZone) === todayKey,
    ).length
  }

  addEarningsEntry(
    telegramUserId: number,
    amountUsd: number,
    createdAtIso?: string,
  ): EarningsEntry {
    const now = createdAtIso ?? new Date().toISOString()
    const entry: EarningsEntry = {
      id: randomUUID(),
      telegramUserId,
      amountUsd,
      createdAt: now,
      updatedAt: now,
      editedByAdminId: null,
    }
    this.data.entries.push(entry)
    this.persist()
    return entry
  }

  editEarningsEntry(
    id: string,
    amountUsd: number,
    adminTelegramUserId: number,
  ): EarningsEntry | null {
    const index = this.data.entries.findIndex((entry) => entry.id === id)
    if (index === -1) {
      return null
    }

    const updated: EarningsEntry = {
      ...this.data.entries[index],
      amountUsd,
      updatedAt: new Date().toISOString(),
      editedByAdminId: adminTelegramUserId,
    }
    this.data.entries[index] = updated
    this.persist()
    return updated
  }

  deleteEarningsEntry(id: string): EarningsEntry | null {
    const index = this.data.entries.findIndex((entry) => entry.id === id)
    if (index === -1) {
      return null
    }

    const [deleted] = this.data.entries.splice(index, 1)
    this.persist()
    return deleted
  }

  getAllEntries(): EarningsEntry[] {
    return [...this.data.entries].sort(
      (left, right) => right.createdAt.localeCompare(left.createdAt),
    )
  }

  getLastEntries(limit: number): EarningsEntry[] {
    return this.getAllEntries().slice(0, limit)
  }

  getTotalSnapshot(): {
    totalUsd: number
    reportsCount: number
    updatedAt: string
  } {
    const totalUsd = Number(
      this.data.entries
        .reduce((accumulator, entry) => accumulator + entry.amountUsd, 0)
        .toFixed(2),
    )
    const reportsCount = this.data.entries.length
    const updatedAt =
      this.data.entries.reduce((latest, entry) => {
        if (!latest) {
          return entry.updatedAt
        }

        return entry.updatedAt > latest ? entry.updatedAt : latest
      }, '') || this.data.updatedAt

    return {
      totalUsd,
      reportsCount,
      updatedAt,
    }
  }

  appendAuditLog(input: AuditLogInput): AdminAuditLog {
    const log: AdminAuditLog = {
      id: randomUUID(),
      adminTelegramUserId: input.adminTelegramUserId,
      action: input.action,
      payload: input.payload,
      createdAt: new Date().toISOString(),
    }
    this.data.auditLogs.push(log)
    this.persist()
    return log
  }
}

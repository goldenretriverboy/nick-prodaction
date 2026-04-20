export type StoredUser = {
  telegramUserId: number
  username: string | null
  isAllowed: boolean
  isAdmin: boolean
  createdAt: string
  updatedAt: string
}

export type EarningsEntry = {
  id: string
  telegramUserId: number
  amountUsd: number
  createdAt: string
  updatedAt: string
  editedByAdminId: number | null
}

export type AdminAuditLog = {
  id: string
  adminTelegramUserId: number
  action: string
  payload: Record<string, unknown>
  createdAt: string
}

export type StoreSnapshot = {
  version: 1
  users: StoredUser[]
  entries: EarningsEntry[]
  auditLogs: AdminAuditLog[]
  updatedAt: string
}

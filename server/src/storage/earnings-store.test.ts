import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { EarningsStore } from './earnings-store.ts'

const createdFiles: string[] = []

function makeStoreFilePath(): string {
  const nextPath = path.join(
    os.tmpdir(),
    `earnings-store-test-${Date.now()}-${Math.round(Math.random() * 1e6)}.json`,
  )
  createdFiles.push(nextPath)
  return nextPath
}

afterEach(() => {
  for (const filePath of createdFiles.splice(0)) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }
})

describe('EarningsStore', () => {
  it('counts entries per day in configured timezone', () => {
    const store = new EarningsStore(makeStoreFilePath(), 'Asia/Almaty')
    store.setUserAccess(1001, true)

    store.addEarningsEntry(1001, 10, '2026-04-20T00:00:00.000Z')
    store.addEarningsEntry(1001, 20, '2026-04-20T10:00:00.000Z')
    store.addEarningsEntry(1001, 30, '2026-04-21T10:00:00.000Z')

    const count = store.getTodaysEntryCount(1001, new Date('2026-04-20T12:00:00.000Z'))
    expect(count).toBe(2)
  })

  it('updates totals after edit and delete', () => {
    const store = new EarningsStore(makeStoreFilePath(), 'Asia/Almaty')
    store.setUserAccess(2002, true)

    const entry = store.addEarningsEntry(2002, 50)
    store.addEarningsEntry(2002, 20)

    let snapshot = store.getTotalSnapshot()
    expect(snapshot.totalUsd).toBe(70)
    expect(snapshot.reportsCount).toBe(2)

    store.editEarningsEntry(entry.id, 40, 9999)
    snapshot = store.getTotalSnapshot()
    expect(snapshot.totalUsd).toBe(60)

    store.deleteEarningsEntry(entry.id)
    snapshot = store.getTotalSnapshot()
    expect(snapshot.totalUsd).toBe(20)
    expect(snapshot.reportsCount).toBe(1)
  })
})

import { mockEarningsTotal } from '@/shared/config/content'
import { env } from '@/shared/config/env'
import { writeCachedEarningsTotal } from './earnings-total-cache'
import { requestJson } from './http-client'
import type { EarningsTotalResponseDto } from './types'

export async function getEarningsTotal(): Promise<EarningsTotalResponseDto> {
  if (!env.useLiveEarnings) {
    return mockEarningsTotal
  }

  const response = await requestJson<EarningsTotalResponseDto>(
    '/api/public/earnings/total',
  )
  writeCachedEarningsTotal(response)
  return response
}

import { mockEarningsTotal } from '@/shared/config/content'
import { env } from '@/shared/config/env'
import { requestJson } from './http-client'
import type { EarningsTotalResponseDto } from './types'

export async function getEarningsTotal(): Promise<EarningsTotalResponseDto> {
  if (!env.useLiveEarnings) {
    return mockEarningsTotal
  }

  return requestJson<EarningsTotalResponseDto>('/api/public/earnings/total')
}

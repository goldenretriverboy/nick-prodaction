import { mockTariffs } from '@/shared/config/content'
import { env } from '@/shared/config/env'
import { requestJson } from './http-client'
import type { ListTariffsResponseDto } from './types'

export async function listTariffs(): Promise<ListTariffsResponseDto> {
  if (env.useLocalMocks) {
    return {
      items: mockTariffs,
    }
  }

  return requestJson<ListTariffsResponseDto>('/api/public/tariffs')
}

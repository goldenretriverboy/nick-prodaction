import { mockCreateLeadResponse } from '@/shared/config/content'
import { env } from '@/shared/config/env'
import { requestJson } from './http-client'
import type { CreateLeadRequestDto, CreateLeadResponseDto } from './types'

export async function createLead(
  payload: CreateLeadRequestDto,
): Promise<CreateLeadResponseDto> {
  if (env.useLocalMocks) {
    await new Promise((resolve) => {
      setTimeout(resolve, 500)
    })

    return {
      ...mockCreateLeadResponse,
      id: `${mockCreateLeadResponse.id}-${Date.now()}`,
    }
  }

  return requestJson<CreateLeadResponseDto>('/api/public/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

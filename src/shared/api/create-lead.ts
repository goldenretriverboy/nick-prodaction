import { requestJson } from './http-client'
import type { CreateLeadRequestDto, CreateLeadResponseDto } from './types'

export async function createLead(
  payload: CreateLeadRequestDto,
): Promise<CreateLeadResponseDto> {
  return requestJson<CreateLeadResponseDto>('/api/public/leads', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}

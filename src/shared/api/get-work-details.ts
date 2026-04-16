import { mockWorkDetailsById } from '@/shared/config/content'
import { env } from '@/shared/config/env'
import { requestJson } from './http-client'
import type { WorkDetailsResponseDto } from './types'

export async function getWorkDetails(
  workId: string,
): Promise<WorkDetailsResponseDto> {
  if (env.useLocalMocks) {
    const work = mockWorkDetailsById[workId]

    if (!work) {
      throw new Error('Work not found')
    }

    return work
  }

  return requestJson<WorkDetailsResponseDto>(`/api/public/works/${workId}`)
}

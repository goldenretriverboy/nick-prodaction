import { mockWorks } from '@/shared/config/content'
import { env } from '@/shared/config/env'
import { requestJson } from './http-client'
import type { ListWorksParams, ListWorksResponseDto } from './types'

function buildWorksPath(params: ListWorksParams): string {
  const query = new URLSearchParams()

  if (params.page !== undefined) {
    query.set('page', String(params.page))
  }

  if (params.limit !== undefined) {
    query.set('limit', String(params.limit))
  }

  const serialized = query.toString()

  return serialized ? `/api/public/works?${serialized}` : '/api/public/works'
}

export async function listWorks(
  params: ListWorksParams = {},
): Promise<ListWorksResponseDto> {
  const page = params.page ?? 1
  const limit = params.limit ?? mockWorks.length

  if (env.useLocalMocks) {
    const start = (page - 1) * limit
    const items = mockWorks.slice(start, start + limit)

    return {
      items,
      page,
      limit,
      total: mockWorks.length,
    }
  }

  return requestJson<ListWorksResponseDto>(buildWorksPath(params))
}

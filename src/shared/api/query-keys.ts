import type { ListWorksParams } from './types'

export const queryKeys = {
  earningsTotal: ['earnings-total'] as const,
  worksList: (params: ListWorksParams) =>
    ['works-list', params.page ?? 1, params.limit ?? 0] as const,
  workDetails: (workId: string) => ['work-details', workId] as const,
  tariffsList: ['tariffs-list'] as const,
} as const

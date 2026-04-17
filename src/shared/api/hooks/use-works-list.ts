import { useQuery } from '@tanstack/react-query'
import { listWorks } from '../list-works'
import { queryKeys } from '../query-keys'
import type { ListWorksParams } from '../types'

export function useWorksList(params: ListWorksParams) {
  return useQuery({
    queryKey: queryKeys.worksList(params),
    queryFn: () => listWorks(params),
  })
}

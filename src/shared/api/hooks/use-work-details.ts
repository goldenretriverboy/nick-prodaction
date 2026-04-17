import { useQuery } from '@tanstack/react-query'
import { getWorkDetails } from '../get-work-details'
import { queryKeys } from '../query-keys'

export function useWorkDetails(workId: string) {
  return useQuery({
    queryKey: queryKeys.workDetails(workId),
    queryFn: () => getWorkDetails(workId),
    enabled: Boolean(workId),
  })
}

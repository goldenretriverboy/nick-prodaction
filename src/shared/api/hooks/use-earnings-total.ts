import { useQuery } from '@tanstack/react-query'
import {
  createFallbackEarningsTotal,
  readCachedEarningsTotal,
} from '../earnings-total-cache'
import { getEarningsTotal } from '../get-earnings-total'
import { queryKeys } from '../query-keys'

export function useEarningsTotal() {
  return useQuery({
    queryKey: queryKeys.earningsTotal,
    initialData: () => readCachedEarningsTotal() ?? createFallbackEarningsTotal(),
    queryFn: getEarningsTotal,
    refetchInterval: 60_000,
  })
}

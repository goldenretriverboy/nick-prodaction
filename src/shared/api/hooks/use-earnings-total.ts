import { useQuery } from '@tanstack/react-query'
import { getEarningsTotal } from '../get-earnings-total'
import { queryKeys } from '../query-keys'

export function useEarningsTotal() {
  return useQuery({
    queryKey: queryKeys.earningsTotal,
    queryFn: getEarningsTotal,
    refetchInterval: 60_000,
  })
}

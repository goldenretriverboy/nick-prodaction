import { useQuery } from '@tanstack/react-query'
import { listTariffs } from '../list-tariffs'
import { queryKeys } from '../query-keys'

export function useTariffsList() {
  return useQuery({
    queryKey: queryKeys.tariffsList,
    queryFn: listTariffs,
  })
}

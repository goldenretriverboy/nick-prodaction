import { useMemo } from 'react'
import { useQueries } from '@tanstack/react-query'
import { listWorks } from '../list-works'
import { queryKeys } from '../query-keys'
import type { ListWorksResponseDto, WorkItemDto } from '../types'

type UseWorksPagesParams = {
  page: number
  limit: number
}

type UseWorksPagesResult = {
  items: WorkItemDto[]
  total: number
  isLoading: boolean
  isError: boolean
  error: Error | null
  isLoadingMore: boolean
  hasNextPage: boolean
}

export function useWorksPages({ page, limit }: UseWorksPagesParams): UseWorksPagesResult {
  const pageNumbers = useMemo(
    () => Array.from({ length: page }, (_, index) => index + 1),
    [page],
  )

  const queries = useQueries({
    queries: pageNumbers.map((pageNumber) => ({
      queryKey: queryKeys.worksList({ page: pageNumber, limit }),
      queryFn: () => listWorks({ page: pageNumber, limit }),
    })),
  })

  const loadedResponses = queries
    .map((query) => query.data)
    .filter((response): response is ListWorksResponseDto => response !== undefined)

  const items = useMemo(() => {
    const itemsMap = new Map<string, WorkItemDto>()

    for (const response of loadedResponses) {
      for (const item of response.items) {
        itemsMap.set(item.id, item)
      }
    }

    return Array.from(itemsMap.values())
  }, [loadedResponses])

  const total = loadedResponses[0]?.total ?? 0

  const isLoading =
    loadedResponses.length === 0 &&
    queries.some((query) => query.isPending || query.isLoading)

  const isError = queries.some((query) => query.isError)
  const rawError = queries.find((query) => query.error)?.error

  const error =
    rawError instanceof Error
      ? rawError
      : rawError
        ? new Error('Failed to load works')
        : null

  const lastQuery = queries[queries.length - 1]

  const isLoadingMore =
    Boolean(lastQuery?.isFetching) &&
    !lastQuery?.data &&
    loadedResponses.length > 0

  const hasNextPage = total > 0 && items.length < total

  return {
    items,
    total,
    isLoading,
    isError,
    error,
    isLoadingMore,
    hasNextPage,
  }
}

import type { EarningsTotalResponseDto } from './types'

const EARNINGS_TOTAL_STORAGE_KEY = 'earnings-total-cache-v1'

export const EARNINGS_TOTAL_FALLBACK_USD = 2_200_000

function isValidCachedValue(value: unknown): value is EarningsTotalResponseDto {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<EarningsTotalResponseDto>
  return (
    typeof candidate.total_usd === 'number' &&
    Number.isFinite(candidate.total_usd) &&
    candidate.total_usd >= 0 &&
    typeof candidate.reports_count === 'number' &&
    Number.isFinite(candidate.reports_count) &&
    candidate.reports_count >= 0 &&
    typeof candidate.updated_at === 'string' &&
    candidate.updated_at.length > 0
  )
}

export function createFallbackEarningsTotal(): EarningsTotalResponseDto {
  return {
    total_usd: EARNINGS_TOTAL_FALLBACK_USD,
    reports_count: 0,
    updated_at: new Date(0).toISOString(),
  }
}

export function readCachedEarningsTotal():
  | EarningsTotalResponseDto
  | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawValue = window.localStorage.getItem(EARNINGS_TOTAL_STORAGE_KEY)
    if (!rawValue) {
      return null
    }

    const parsedValue: unknown = JSON.parse(rawValue)
    if (!isValidCachedValue(parsedValue)) {
      return null
    }

    return parsedValue
  } catch {
    return null
  }
}

export function writeCachedEarningsTotal(
  payload: EarningsTotalResponseDto,
): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(EARNINGS_TOTAL_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Storage can be unavailable in private mode or restricted contexts.
  }
}

import { env } from '@/shared/config/env'

function buildUrl(path: string): string {
  if (!env.apiBaseUrl) {
    return path
  }

  const normalizedBaseUrl = env.apiBaseUrl.endsWith('/')
    ? env.apiBaseUrl.slice(0, -1)
    : env.apiBaseUrl

  return `${normalizedBaseUrl}${path}`
}

export async function requestJson<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.headers ?? {}),
    },
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`)
  }

  return (await response.json()) as T
}

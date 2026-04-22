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
    let details = ''

    try {
      const payload = (await response.json()) as { message?: unknown }
      if (typeof payload?.message === 'string' && payload.message.trim()) {
        details = `: ${payload.message}`
      }
    } catch {
      // ignore non-json error payloads
    }

    throw new Error(`Request failed: ${response.status}${details}`)
  }

  return (await response.json()) as T
}

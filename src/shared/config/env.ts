function readBooleanEnv(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) {
    return defaultValue
  }

  return value === 'true'
}

function readOptionalEnv(value: string | undefined): string | undefined {
  if (typeof value !== 'string') {
    return undefined
  }

  const normalized = value.trim()
  return normalized.length > 0 ? normalized : undefined
}

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  useLocalMocks: readBooleanEnv(import.meta.env.VITE_USE_LOCAL_MOCKS, true),
  useLiveEarnings: readBooleanEnv(import.meta.env.VITE_USE_LIVE_EARNINGS, false),
  emailJsServiceId: readOptionalEnv(import.meta.env.VITE_EMAILJS_SERVICE_ID),
  emailJsTemplateId: readOptionalEnv(import.meta.env.VITE_EMAILJS_TEMPLATE_ID),
  emailJsPublicKey: readOptionalEnv(import.meta.env.VITE_EMAILJS_PUBLIC_KEY),
} as const

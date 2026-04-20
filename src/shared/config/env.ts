function readBooleanEnv(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) {
    return defaultValue
  }

  return value === 'true'
}

export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '',
  useLocalMocks: readBooleanEnv(import.meta.env.VITE_USE_LOCAL_MOCKS, true),
  useLiveEarnings: readBooleanEnv(import.meta.env.VITE_USE_LIVE_EARNINGS, false),
} as const

const formatterByTimezone = new Map<string, Intl.DateTimeFormat>()

function getDayKeyFormatter(timeZone: string): Intl.DateTimeFormat {
  const cached = formatterByTimezone.get(timeZone)
  if (cached) {
    return cached
  }

  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  formatterByTimezone.set(timeZone, formatter)
  return formatter
}

export function getDayKeyInTimeZone(date: Date, timeZone: string): string {
  const formatter = getDayKeyFormatter(timeZone)
  const parts = formatter.formatToParts(date)
  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  if (!year || !month || !day) {
    throw new Error('Cannot build day key')
  }

  return `${year}-${month}-${day}`
}

export function getDayKeyFromIso(iso: string, timeZone: string): string {
  return getDayKeyInTimeZone(new Date(iso), timeZone)
}

export function formatDateTimeInTimeZone(iso: string, timeZone: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    timeZone,
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(iso))
}

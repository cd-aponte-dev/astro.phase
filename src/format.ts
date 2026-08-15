export function formatTime(date: Date | null, timeZone: string): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit', timeZone }).format(
    date,
  )
}

export function formatDate(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    timeZone,
  }).format(date)
}

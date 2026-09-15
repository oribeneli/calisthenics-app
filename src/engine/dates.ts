// Minimal date helpers for 'YYYY-MM-DD' keys. UTC-based so results never depend on the host timezone.

export function parseKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

export function toKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function addDays(key: string, days: number): string {
  const d = parseKey(key)
  d.setUTCDate(d.getUTCDate() + days)
  return toKey(d)
}

/** b − a in whole days. */
export function diffDays(a: string, b: string): number {
  return Math.round((parseKey(b).getTime() - parseKey(a).getTime()) / 86_400_000)
}

/** 0 = Sunday .. 6 = Saturday */
export function weekday(key: string): number {
  return parseKey(key).getUTCDay()
}

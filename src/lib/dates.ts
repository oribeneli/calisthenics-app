// Pure date helpers. No timezone library — everything works off local time
// and the 'YYYY-MM-DD' string key used throughout the schema.

function pad2(n: number): string {
  return n.toString().padStart(2, '0')
}

/** Formats a Date as a local 'YYYY-MM-DD' key. */
export function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

/** Today's date as a 'YYYY-MM-DD' key, in local time. */
export function todayKey(): string {
  return formatDateKey(new Date())
}

/** Parses a 'YYYY-MM-DD' key into a local Date at midnight. */
export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Returns a new 'YYYY-MM-DD' key offset by `days` (may be negative). */
export function addDays(key: string, days: number): string {
  const date = parseDateKey(key)
  date.setDate(date.getDate() + days)
  return formatDateKey(date)
}

/** Monday-start date key for the week containing `key`. */
export function startOfWeek(key: string): string {
  const date = parseDateKey(key)
  const day = date.getDay() // 0 = Sunday .. 6 = Saturday
  const diffToMonday = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diffToMonday)
  return formatDateKey(date)
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const

/** Short weekday label ('Mon', 'Tue', ...) for a 'YYYY-MM-DD' key. */
export function weekdayLabel(key: string): string {
  return WEEKDAY_LABELS[parseDateKey(key).getDay()]
}

/** Human-friendly display, e.g. 'Mon, Sep 15'. */
export function formatDisplayDate(key: string): string {
  return parseDateKey(key).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

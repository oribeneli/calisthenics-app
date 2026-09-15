import { describe, expect, it } from 'vitest'
import { addDays, formatDateKey, parseDateKey, startOfWeek, todayKey, weekdayLabel } from './dates'

describe('formatDateKey / parseDateKey', () => {
  it('round-trips a date', () => {
    const date = new Date(2026, 8, 15) // Sep 15 2026 (Tuesday)
    expect(formatDateKey(date)).toBe('2026-09-15')
    expect(parseDateKey('2026-09-15').getTime()).toBe(date.getTime())
  })

  it('pads single-digit months and days', () => {
    expect(formatDateKey(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('todayKey', () => {
  it('matches formatDateKey(new Date())', () => {
    expect(todayKey()).toBe(formatDateKey(new Date()))
  })
})

describe('addDays', () => {
  it('adds positive days, crossing a month boundary', () => {
    expect(addDays('2026-01-30', 3)).toBe('2026-02-02')
  })

  it('subtracts with negative days', () => {
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })
})

describe('startOfWeek', () => {
  it('returns the same Monday for any day in that week', () => {
    // 2026-09-15 is a Tuesday; the week's Monday is 2026-09-14.
    expect(startOfWeek('2026-09-15')).toBe('2026-09-14')
    expect(startOfWeek('2026-09-14')).toBe('2026-09-14')
    expect(startOfWeek('2026-09-20')).toBe('2026-09-14') // Sunday
  })
})

describe('weekdayLabel', () => {
  it('labels a known date correctly', () => {
    expect(weekdayLabel('2026-09-15')).toBe('Tue')
  })
})

import { describe, expect, it } from 'vitest'
import {
  consistency28,
  habitRates,
  levelTimeline,
  trailingAverage7,
  weeklyVolume,
} from './stats'
import type { Session, SetLog } from '../../db/types'

describe('consistency28', () => {
  it('counts only scheduled days, ignores rest days', () => {
    const today = '2026-09-15' // Tuesday
    const trainDays = [2, 4, 6] // Tue, Thu, Sat
    const sessions: Session[] = [
      { id: 1, date: '2026-09-15', plannedKind: 'train', status: 'done' },
      { id: 2, date: '2026-09-10', plannedKind: 'train', status: 'skipped' },
    ]
    const result = consistency28(sessions, trainDays, today)
    expect(result.dots).toHaveLength(28)
    const todayDot = result.dots.find((d) => d.date === today)
    expect(todayDot?.kind).toBe('done')
    // Non-train weekdays are 'rest', never counted as missed.
    const sunday = result.dots.find((d) => d.date === '2026-09-13')
    expect(sunday?.kind).toBe('rest')
  })

  it('computes pct as done / scheduled, not done / 28', () => {
    const today = '2026-09-15'
    const trainDays = [2] // only Tuesdays in this 28-day window -> 4 scheduled days
    const sessions: Session[] = [
      { id: 1, date: '2026-09-15', plannedKind: 'train', status: 'done' },
      { id: 2, date: '2026-09-08', plannedKind: 'train', status: 'partial' },
    ]
    const result = consistency28(sessions, trainDays, today)
    expect(result.scheduledCount).toBe(4)
    expect(result.doneCount).toBe(2)
    expect(result.pct).toBe(50)
  })

  it('never returns a missed dot on an unscheduled day', () => {
    const result = consistency28([], [1, 3, 5], '2026-09-15')
    expect(result.dots.every((d) => d.kind !== 'missed' || [1, 3, 5].includes(parseWeekday(d.date)))).toBe(true)
  })

  it('counts weeksWithTwoPlus in 7-day blocks ending today', () => {
    const today = '2026-09-15'
    const trainDays = [0, 1, 2, 3, 4, 5, 6]
    const sessions: Session[] = ['2026-09-15', '2026-09-14'].map((date, i) => ({
      id: i + 1,
      date,
      plannedKind: 'train',
      status: 'done',
    }))
    const result = consistency28(sessions, trainDays, today)
    expect(result.weeksWithTwoPlus).toBe(1)
    expect(result.totalWeeks).toBe(4)
  })
})

function parseWeekday(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number)
  return new Date(y, m - 1, d).getDay()
}

describe('trailingAverage7', () => {
  it('averages only entries within the trailing 7-day window', () => {
    const checkins = [
      { date: '2026-09-01', weightKg: 100 },
      { date: '2026-09-08', weightKg: 98 },
    ]
    const points = trailingAverage7(checkins)
    // 09-08 window is 09-02..09-08; 09-01 falls outside it, so avg7 == raw.
    expect(points[1].avg7).toBe(98)
  })

  it('averages multiple entries inside the window', () => {
    const checkins = [
      { date: '2026-09-10', weightKg: 100 },
      { date: '2026-09-12', weightKg: 98 },
      { date: '2026-09-14', weightKg: 96 },
    ]
    const points = trailingAverage7(checkins)
    expect(points[2].avg7).toBe(98) // (100+98+96)/3
  })

  it('ignores check-ins with no weight', () => {
    const points = trailingAverage7([{ date: '2026-09-10', weightKg: undefined }])
    expect(points).toHaveLength(0)
  })

  it('sorts by date regardless of input order', () => {
    const points = trailingAverage7([
      { date: '2026-09-12', weightKg: 96 },
      { date: '2026-09-10', weightKg: 100 },
    ])
    expect(points.map((p) => p.date)).toEqual(['2026-09-10', '2026-09-12'])
  })
})

describe('weeklyVolume', () => {
  it('sums reps and hold seconds per ISO week, joined via sessionId', () => {
    const sessions: Session[] = [
      { id: 1, date: '2026-09-15', plannedKind: 'train', status: 'done' }, // Tue, week of 09-14
    ]
    const setLogs: SetLog[] = [
      { sessionId: 1, ladderId: 'push', levelId: 'x', setIndex: 0, targetReps: 10, doneReps: 10, outcome: 'clean', ts: '' },
      { sessionId: 1, ladderId: 'core', levelId: 'y', setIndex: 0, targetReps: 20, doneReps: 0, holdSeconds: 20, outcome: 'clean', ts: '' },
    ]
    const points = weeklyVolume(sessions, setLogs, '2026-09-15', 2)
    expect(points).toHaveLength(2)
    const thisWeek = points[points.length - 1]
    expect(thisWeek.weekStart).toBe('2026-09-14')
    expect(thisWeek.volume).toBe(30)
    expect(thisWeek.sessions).toBe(1)
  })

  it('returns empty buckets for weeks with no data', () => {
    const points = weeklyVolume([], [], '2026-09-15', 8)
    expect(points).toHaveLength(8)
    expect(points.every((p) => p.volume === 0 && p.sessions === 0)).toBe(true)
  })

  it('does not double-count a session with multiple set logs', () => {
    const sessions: Session[] = [{ id: 1, date: '2026-09-15', plannedKind: 'train', status: 'done' }]
    const setLogs: SetLog[] = [1, 2, 3].map((i) => ({
      sessionId: 1,
      ladderId: 'push',
      levelId: 'x',
      setIndex: i,
      targetReps: 10,
      doneReps: 10,
      outcome: 'clean',
      ts: '',
    }))
    const points = weeklyVolume(sessions, setLogs, '2026-09-15', 1)
    expect(points[0].sessions).toBe(1)
    expect(points[0].volume).toBe(30)
  })
})

describe('levelTimeline', () => {
  const ladders = [
    { id: 'push', levels: [{ id: 'p1' }, { id: 'p2' }, { id: 'p3' }] },
    { id: 'pull', levels: [{ id: 'l1' }, { id: 'l2' }] },
  ]

  it('forward-fills each ladder to its most recent level at every date', () => {
    const states = [
      {
        ladderId: 'push',
        history: [
          { date: '2026-08-01', levelId: 'p1', reason: 'assessment' },
          { date: '2026-08-15', levelId: 'p2', reason: 'PROGRESS_UP' },
        ],
      },
      {
        ladderId: 'pull',
        history: [{ date: '2026-08-01', levelId: 'l1', reason: 'assessment' }],
      },
    ]
    const points = levelTimeline(states, ladders)
    expect(points).toEqual([
      { date: '2026-08-01', push: 1, pull: 1 },
      { date: '2026-08-15', push: 2, pull: 1 },
    ])
  })

  it('returns an empty array when no ladder has history', () => {
    expect(levelTimeline([], ladders)).toEqual([])
  })
})

describe('habitRates', () => {
  const defs = [{ key: 'protein', label: 'Protein' }, { key: 'water', label: 'Water' }]

  it('computes pct of the last 28 days as done, out of 28 not entries present', () => {
    const today = '2026-09-15'
    const habits = [
      { date: '2026-09-15', key: 'protein', done: true },
      { date: '2026-09-14', key: 'protein', done: true },
      { date: '2026-09-13', key: 'protein', done: false },
    ]
    const rates = habitRates(habits, defs, today)
    expect(rates.find((r) => r.key === 'protein')?.pct28).toBe(Math.round((2 / 28) * 100))
    expect(rates.find((r) => r.key === 'water')?.pct28).toBe(0)
  })

  it('ignores entries outside the 28-day window', () => {
    const today = '2026-09-15'
    const habits = [{ date: '2026-01-01', key: 'protein', done: true }]
    const rates = habitRates(habits, defs, today)
    expect(rates.find((r) => r.key === 'protein')?.pct28).toBe(0)
  })
})

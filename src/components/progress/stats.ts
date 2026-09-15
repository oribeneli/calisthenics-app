// Pure computation helpers for the Progress page. No Dexie/db imports here —
// everything takes plain arrays so it can be unit-tested without IndexedDB.

import type { PatternId } from '../../data/types'
import type { Checkin, Habit, LadderState, Session, SetLog } from '../../db/types'
import { addDays, startOfWeek } from '../../lib/dates'

// ---------------------------------------------------------------------------
// consistency28

export type ConsistencyDotKind = 'done' | 'missed' | 'rest'

export interface ConsistencyDot {
  date: string
  kind: ConsistencyDotKind
}

export interface ConsistencyResult {
  /** 0-100, rounded. 0 when nothing was scheduled in the window. */
  pct: number
  scheduledCount: number
  doneCount: number
  /** Weeks (most recent 4, 7-day blocks ending today) with 2+ completed sessions. */
  weeksWithTwoPlus: number
  totalWeeks: number
  /** Oldest first, 28 entries. */
  dots: ConsistencyDot[]
}

/**
 * Rolling 28-day consistency: sessions done ÷ scheduled training days.
 * `trainDays` is the weekday set (0 = Sunday .. 6 = Saturday) from the
 * user's slots/trainDays. A day counts as "done" when a non-rest session for
 * that date has status 'done' or 'partial'.
 */
export function consistency28(sessions: Session[], trainDays: number[], today: string): ConsistencyResult {
  const byDate = new Map<string, Session[]>()
  for (const s of sessions) {
    const arr = byDate.get(s.date) ?? []
    arr.push(s)
    byDate.set(s.date, arr)
  }
  const trainSet = new Set(trainDays)
  const dots: ConsistencyDot[] = []
  let scheduledCount = 0
  let doneCount = 0
  for (let i = 27; i >= 0; i--) {
    const date = addDays(today, -i)
    const weekday = parseLocalWeekday(date)
    const scheduled = trainSet.has(weekday)
    const daySessions = byDate.get(date) ?? []
    const done = daySessions.some(
      (s) => s.plannedKind !== 'rest' && (s.status === 'done' || s.status === 'partial'),
    )
    if (scheduled) {
      scheduledCount++
      if (done) doneCount++
      dots.push({ date, kind: done ? 'done' : 'missed' })
    } else {
      dots.push({ date, kind: 'rest' })
    }
  }
  const weeksWithTwoPlus = countWeeksWithTwoPlus(dots)
  const pct = scheduledCount === 0 ? 0 : Math.round((doneCount / scheduledCount) * 100)
  return { pct, scheduledCount, doneCount, weeksWithTwoPlus, totalWeeks: 4, dots }
}

function countWeeksWithTwoPlus(dots: ConsistencyDot[]): number {
  // dots is oldest-first, 28 entries. Chunk into 4 blocks of 7, most recent last.
  let weeks = 0
  for (let block = 0; block < 4; block++) {
    const chunk = dots.slice(block * 7, block * 7 + 7)
    const done = chunk.filter((d) => d.kind === 'done').length
    if (done >= 2) weeks++
  }
  return weeks
}

function parseLocalWeekday(dateKey: string): number {
  const [year, month, day] = dateKey.split('-').map(Number)
  return new Date(year, month - 1, day).getDay()
}

// ---------------------------------------------------------------------------
// trailingAverage7

export interface WeightPoint {
  date: string
  raw: number
  avg7: number
}

/**
 * One point per check-in with a logged weight. `avg7` is the average of all
 * logged weights in the trailing 7-calendar-day window ending on that date
 * (the date itself plus the 6 days before it), not a fixed-count average —
 * a gap day doesn't shift which days count.
 */
export function trailingAverage7(checkins: Pick<Checkin, 'date' | 'weightKg'>[]): WeightPoint[] {
  const entries = checkins
    .filter((c): c is { date: string; weightKg: number } => c.weightKg !== undefined)
    .sort((a, b) => a.date.localeCompare(b.date))
  return entries.map((entry) => {
    const windowStart = addDays(entry.date, -6)
    const inWindow = entries.filter((e) => e.date >= windowStart && e.date <= entry.date)
    const avg7 = inWindow.reduce((sum, e) => sum + e.weightKg, 0) / inWindow.length
    return { date: entry.date, raw: entry.weightKg, avg7: Math.round(avg7 * 10) / 10 }
  })
}

// ---------------------------------------------------------------------------
// weeklyVolume

export interface WeeklyVolumePoint {
  weekStart: string
  /** Sum of doneReps + holdSeconds logged across all sets that week. */
  volume: number
  sessions: number
}

/**
 * Total logged volume (reps + hold-seconds summed) and session count per ISO
 * (Monday-start) week, for the last `weeks` weeks up to and including
 * today's week. Always returns `weeks` buckets, oldest first, even if empty.
 */
export function weeklyVolume(sessions: Session[], setLogs: SetLog[], today: string, weeks = 8): WeeklyVolumePoint[] {
  const sessionDate = new Map<number, string>()
  const sessionCounted = new Map<string, Set<number>>()
  for (const s of sessions) {
    if (s.id === undefined) continue
    sessionDate.set(s.id, s.date)
  }

  const currentWeekStart = startOfWeek(today)
  const weekStarts: string[] = []
  for (let i = weeks - 1; i >= 0; i--) weekStarts.push(addDays(currentWeekStart, -7 * i))
  const points = new Map<string, WeeklyVolumePoint>(weekStarts.map((w) => [w, { weekStart: w, volume: 0, sessions: 0 }]))

  for (const log of setLogs) {
    const date = sessionDate.get(log.sessionId)
    if (!date) continue
    const week = startOfWeek(date)
    const point = points.get(week)
    if (!point) continue
    point.volume += log.doneReps + (log.holdSeconds ?? 0)
  }

  for (const s of sessions) {
    if (s.plannedKind === 'rest' || (s.status !== 'done' && s.status !== 'partial')) continue
    const week = startOfWeek(s.date)
    const point = points.get(week)
    if (!point) continue
    const seen = sessionCounted.get(week) ?? new Set<number>()
    if (s.id !== undefined && seen.has(s.id)) continue
    if (s.id !== undefined) seen.add(s.id)
    sessionCounted.set(week, seen)
    point.sessions += 1
  }

  return weekStarts.map((w) => points.get(w)!)
}

// ---------------------------------------------------------------------------
// levelTimeline

export interface LevelTimelinePoint {
  date: string
  [ladderId: string]: string | number
}

interface LadderStateHistory {
  ladderId: string
  history: LadderState['history']
}

/** The minimal ladder shape this helper needs: an id and ordered level ids. */
export interface LadderShape {
  id: string
  levels: { id: string }[]
}

/**
 * Merges every ladder's history into one array of {date, push, pull, ...}
 * points (1-based level number), forward-filling each ladder's most recent
 * known level at every date any ladder changed. Ladders with no history yet
 * are simply absent from a point until their first entry.
 */
export function levelTimeline(states: LadderStateHistory[], ladders: LadderShape[]): LevelTimelinePoint[] {
  const levelIndexOf = (ladderId: string, levelId: string): number => {
    const ladder = ladders.find((l) => l.id === ladderId)
    const idx = ladder?.levels.findIndex((lv) => lv.id === levelId) ?? -1
    return idx + 1
  }

  const allDates = Array.from(new Set(states.flatMap((s) => s.history.map((h) => h.date)))).sort()
  const last: Record<string, number> = {}
  return allDates.map((date) => {
    const point: LevelTimelinePoint = { date }
    for (const s of states) {
      const entry = [...s.history].reverse().find((h) => h.date <= date)
      if (entry) last[s.ladderId] = levelIndexOf(s.ladderId, entry.levelId)
      if (last[s.ladderId] !== undefined) point[s.ladderId] = last[s.ladderId]
    }
    return point
  })
}

// ---------------------------------------------------------------------------
// habitRates

export interface HabitRatePoint {
  key: string
  label: string
  /** Percentage (0-100) of the last 28 days this habit was checked done. */
  pct28: number
}

export function habitRates(
  habits: Pick<Habit, 'date' | 'key' | 'done'>[],
  habitDefs: { key: string; label: string }[],
  today: string,
): HabitRatePoint[] {
  const windowStart = addDays(today, -27)
  const doneCount = new Map<string, number>()
  for (const h of habits) {
    if (!h.done || h.date < windowStart || h.date > today) continue
    doneCount.set(h.key, (doneCount.get(h.key) ?? 0) + 1)
  }
  return habitDefs.map((def) => ({
    key: def.key,
    label: def.label,
    pct28: Math.round(((doneCount.get(def.key) ?? 0) / 28) * 100),
  }))
}

export type { PatternId }

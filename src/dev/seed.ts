// Dev-only helpers exposed on window.__coach for manual QA and screenshots.
// Never imported in production builds (see main.tsx guard).

import { db } from '../db/db'
import { program } from '../data/program'
import { addDays, todayKey } from '../lib/dates'
import type { PatternId } from '../data/types'

function rnd(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

export async function clearAll(): Promise<void> {
  await Promise.all(db.tables.map((t) => t.clear()))
}

/** A user who finished onboarding today and has not trained yet. */
export async function seedFresh(): Promise<void> {
  await clearAll()
  const today = todayKey()
  const wd = new Date().getDay()
  await db.profile.put({
    id: 'me',
    name: 'Ori',
    sex: 'male',
    birthYear: 1996,
    heightCm: 175,
    startWeightKg: 100,
    trainDays: [wd, (wd + 2) % 7, (wd + 4) % 7],
    slots: [wd, (wd + 2) % 7, (wd + 4) % 7].map((d) => ({ day: d, time: '19:30', place: 'living room' })),
    sessionMinutes: 25,
    trainTime: '19:30',
    constraints: ['shoulder hypermobility', 'sensitive wrists'],
    notes: '',
    createdAt: today,
    onboardedAt: `${today}T08:00:00.000Z`,
    screening: { q8: true, q9: true },
    gatesPassed: [],
    goalWeightKg: 76,
  })
}

/** Four weeks of plausible history: sessions, check-ins, weight, habits, ladder states at level 2–3. */
export async function seedDemo(weeks = 4): Promise<void> {
  await clearAll()
  const r = rnd(42)
  const today = todayKey()
  const start = addDays(today, -weeks * 7)
  const wd = new Date(start + 'T12:00:00').getDay()
  const trainDays = [wd, (wd + 2) % 7, (wd + 4) % 7]
  await db.profile.put({
    id: 'me',
    name: 'Ori',
    sex: 'male',
    birthYear: 1996,
    heightCm: 175,
    startWeightKg: 100,
    trainDays,
    slots: trainDays.map((d) => ({ day: d, time: '19:30', place: 'living room' })),
    sessionMinutes: 25,
    trainTime: '19:30',
    constraints: ['shoulder hypermobility', 'sensitive wrists'],
    notes: '',
    createdAt: start,
    onboardedAt: `${start}T08:00:00.000Z`,
    screening: { q8: true, q9: true },
    gatesPassed: [],
    goalWeightKg: 76,
    stepBaseline: 4200,
  })
  const levelIdx: Record<PatternId, number> = { push: 0, pull: 0, squat: 0, hinge: 0, core: 0 }
  const history: Record<PatternId, { date: string; levelId: string; reason: string }[]> = { push: [], pull: [], squat: [], hinge: [], core: [] }
  let weight = 100
  for (let d = 0; d <= weeks * 7; d++) {
    const date = addDays(start, d)
    const day = new Date(date + 'T12:00:00').getDay()
    weight += -0.09 + (r() - 0.5) * 0.8
    const sleep = 5.5 + r() * 3
    await db.checkins.add({
      date,
      sleepHours: Math.round(sleep * 2) / 2,
      sleepQuality: (sleep < 6.5 ? 2 : 4) as 2 | 4,
      mood: (r() < 0.15 ? 2 : 4) as 2 | 4,
      soreness: (r() < 0.2 ? 4 : 2) as 2 | 4,
      weightKg: d % 3 === 0 ? Math.round(weight * 10) / 10 : undefined,
    })
    for (const h of program.habits) {
      await db.habits.add({ date, key: h.key, done: r() < 0.7 })
    }
    if (d % 14 === 0) {
      await db.bodyMetrics.add({ date, waistCm: Math.round((112 - d * 0.12) * 10) / 10, hipCm: 116 - d * 0.05, chestCm: 118 - d * 0.04, armCm: 36 })
    }
    if (!trainDays.includes(day) || date > today) {
      if (date <= today && !trainDays.includes(day) && r() < 0.5) {
        await db.sessions.add({ date, plannedKind: 'rest', status: 'done' })
      }
      continue
    }
    if (r() < 0.15) continue // a missed session
    const kind = d === 0 ? 'assessment' : r() < 0.1 ? 'minimum' : 'train'
    const sessionId = (await db.sessions.add({
      date,
      plannedKind: kind,
      status: 'done',
      startedAt: `${date}T19:30:00.000Z`,
      endedAt: `${date}T19:52:00.000Z`,
      rpe: 5 + Math.round(r() * 2),
      note: r() < 0.3 ? 'Felt okay. Shoulders stayed put.' : undefined,
      adaptationNote: d === 0 ? 'Week 0: starting levels set' : undefined,
    })) as number
    const sets = kind === 'minimum' ? 1 : d < 7 ? 1 : d < 21 ? 2 : 3
    for (const ladder of program.ladders) {
      const level = ladder.levels[levelIdx[ladder.id]]
      const target = level.scheme.reps ? level.scheme.reps[0] + Math.min(4, Math.floor(d / 7)) : level.scheme.holdSec![0]
      for (let s = 0; s < sets; s++) {
        const done = r() < 0.85 ? target : Math.max(1, target - 3)
        await db.setLogs.add({
          sessionId,
          ladderId: ladder.id,
          levelId: level.id,
          setIndex: s,
          targetReps: target,
          doneReps: level.scheme.reps ? done : 0,
          holdSeconds: level.scheme.holdSec ? done : undefined,
          outcome: done >= target ? 'clean' : 'short',
          ts: `${date}T19:${30 + s * 4}:00.000Z`,
        })
      }
      if (d > 0 && d % 10 === 0 && levelIdx[ladder.id] < 3) {
        levelIdx[ladder.id]++
        history[ladder.id].push({ date, levelId: ladder.levels[levelIdx[ladder.id]].id, reason: 'PROGRESS_UP' })
        await db.events.add({ ts: `${date}T20:00:00.000Z`, type: 'PROGRESS_UP', payload: { ladderId: ladder.id } })
      }
    }
  }
  for (const ladder of program.ladders) {
    const level = ladder.levels[levelIdx[ladder.id]]
    await db.ladderState.put({
      ladderId: ladder.id,
      currentLevelId: level.id,
      repTarget: level.scheme.reps ? level.scheme.reps[0] + 2 : level.scheme.holdSec![0],
      cleanStreak: 1,
      failStreak: 0,
      updatedAt: new Date().toISOString(),
      history: [{ date: start, levelId: ladder.levels[0].id, reason: 'assessment' }, ...history[ladder.id]],
    })
  }
}

declare global {
  interface Window {
    __coach?: { db: typeof db; seedFresh: typeof seedFresh; seedDemo: typeof seedDemo; clearAll: typeof clearAll }
  }
}

export function exposeDevHelpers(): void {
  window.__coach = { db, seedFresh, seedDemo, clearAll }
}

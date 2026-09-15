import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../db/db'
import { finishSession, getTodayPlan, getTodaySession, logSet, setLadderLevel, startSession, trainDaysOf } from './coach'
import { program } from '../data/program'
import { addDays, weekday } from '../engine/dates'

const TODAY = '2026-09-22'
const START = '2026-09-14'

async function reset() {
  await Promise.all([
    db.profile.clear(),
    db.checkins.clear(),
    db.sessions.clear(),
    db.setLogs.clear(),
    db.ladderState.clear(),
    db.settings.clear(),
    db.events.clear(),
  ])
  await db.profile.put({
    id: 'me',
    name: 'Ori',
    sex: 'male',
    birthYear: 1996,
    heightCm: 175,
    startWeightKg: 100,
    trainDays: [weekday(TODAY)],
    sessionMinutes: 25,
    trainTime: '19:30',
    constraints: [],
    notes: '',
    createdAt: START,
    onboardedAt: `${START}T10:00:00.000Z`,
    screening: { q9: true },
  })
}

beforeEach(reset)

describe('coach adapter', () => {
  it('derives train days from slots when present', () => {
    expect(trainDaysOf({ trainDays: [1], slots: [{ day: 2, time: '19:00', place: 'x' }, { day: 4, time: '19:00', place: 'x' }] } as never)).toEqual([2, 4])
  })

  it('first plan is an assessment; finishing it writes ladder states from the levels achieved', async () => {
    const plan = await getTodayPlan(TODAY)
    expect(plan?.kind).toBe('assessment')
    const sessionId = await startSession(plan!, TODAY)
    expect((await getTodaySession(TODAY))?.id).toBe(sessionId)
    const push = program.ladders.find((l) => l.id === 'push')!
    await logSet({ sessionId, ladderId: 'push', levelId: push.levels[0].id, setIndex: 0, target: 10, done: 10, unit: 'reps', outcome: 'too_easy' })
    await logSet({ sessionId, ladderId: 'push', levelId: push.levels[1].id, setIndex: 1, target: 8, done: 8, unit: 'reps', outcome: 'clean' })
    for (const id of ['pull', 'squat', 'hinge', 'core'] as const) {
      const l = program.ladders.find((x) => x.id === id)!
      await logSet({ sessionId, ladderId: id, levelId: l.levels[0].id, setIndex: 0, target: 8, done: 8, unit: 'reps', outcome: 'clean' })
    }
    const out = await finishSession({ sessionId, rpe: 5 })
    expect(out.states).toHaveLength(5)
    const rows = await db.ladderState.toArray()
    expect(rows.find((r) => r.ladderId === 'push')?.currentLevelId).toBe(push.levels[1].id)
    expect(rows.find((r) => r.ladderId === 'squat')?.currentLevelId).toBe(program.ladders.find((l) => l.id === 'squat')!.levels[0].id)
    expect(rows.every((r) => r.history.length === 1)).toBe(true)
    const session = await db.sessions.get(sessionId)
    expect(session?.status).toBe('done')
    expect(session?.adaptationNote).toMatch(/starting at level/i)
    // Same day again → done.
    expect((await getTodayPlan(TODAY))?.kind).toBe('done')
  })

  it('a normal session applies the check-in and persists rep-target progression', async () => {
    for (const l of program.ladders) {
      await setLadderLevel(l.id, l.levels[l.id === 'push' ? 8 : 1].id, 8, 'test')
    }
    await db.sessions.add({ date: addDays(TODAY, -2), plannedKind: 'train', status: 'done' })
    await db.checkins.add({ date: TODAY, sleepHours: 8, sleepQuality: 4, mood: 4, soreness: 1 })
    const plan = await getTodayPlan(TODAY)
    expect(plan?.kind).toBe('train')
    expect(plan?.progressionAllowed).toBe(true)
    expect(plan?.exercises.find((e) => e.ladderId === 'push')?.note).toMatch(/fists/i)
    const sessionId = await startSession(plan!, TODAY)
    for (const ex of plan!.exercises) {
      for (let i = 0; i < ex.sets; i++) {
        await logSet({ sessionId, ladderId: ex.ladderId, levelId: ex.level.id, setIndex: i, target: ex.target, done: ex.target, unit: ex.unit, outcome: 'clean' })
      }
    }
    const out = await finishSession({ sessionId, rpe: 6 })
    expect(out.events.length).toBeGreaterThan(0)
    const push = await db.ladderState.get('push')
    expect(push?.repTarget).toBeGreaterThan(8)
    expect(await db.events.count()).toBeGreaterThan(0)
  })

  it('a bad night halves nothing but blocks progression and explains it', async () => {
    for (const l of program.ladders) await setLadderLevel(l.id, l.levels[1].id, 8, 'test')
    await db.sessions.add({ date: addDays(TODAY, -2), plannedKind: 'train', status: 'done' })
    await db.checkins.add({ date: TODAY, sleepHours: 5, sleepQuality: 2, mood: 3, soreness: 2 })
    const plan = await getTodayPlan(TODAY)
    expect(plan?.rulesFired).toContain('SLEEP_LOW')
    expect(plan?.explanation).toMatch(/sleep/i)
  })

  it('a newly opened deload window is persisted as a setting', async () => {
    for (const l of program.ladders) await setLadderLevel(l.id, l.levels[1].id, 8, 'test')
    await db.sessions.add({ date: addDays(TODAY, -2), plannedKind: 'train', status: 'done' })
    await db.events.bulkAdd([
      { ts: `${addDays(TODAY, -5)}T12:00:00.000Z`, type: 'REGRESS_LEVEL', payload: { ladderId: 'push' } },
      { ts: `${addDays(TODAY, -3)}T12:00:00.000Z`, type: 'REGRESS_LEVEL', payload: { ladderId: 'squat' } },
    ])
    const plan = await getTodayPlan(TODAY)
    expect(plan?.rulesFired).toContain('DELOAD_REACTIVE')
    expect((await db.settings.get('deloadUntil'))?.value).toBe(plan?.deloadUntil)
  })
})

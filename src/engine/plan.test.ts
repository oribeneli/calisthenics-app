import { describe, expect, it } from 'vitest'
import { fixtureProgram } from './fixtures'
import { planToday } from './plan'
import { addDays, weekday } from './dates'
import type { EngineLadderState, EngineSessionRecord, PlanInput } from './types'
import type { PatternId } from '../data/types'

const START = '2026-09-07' // Monday
const IDS: PatternId[] = ['push', 'pull', 'squat', 'hinge', 'core']

function states(level = 2, repTarget?: number): EngineLadderState[] {
  return IDS.map((id) => ({
    ladderId: id,
    levelId: `${id}.l${level}`,
    repTarget: repTarget ?? (id === 'core' ? 20 : 8),
    cleanStreak: 0,
    failStreak: 0,
  }))
}

function session(date: string, extra: Partial<EngineSessionRecord> = {}): EngineSessionRecord {
  return { date, kind: 'train', status: 'done', sets: [], ...extra }
}

function input(over: Partial<PlanInput> = {}): PlanInput {
  const today = over.today ?? addDays(START, 8) // week 1, Tuesday
  return {
    program: fixtureProgram(),
    today,
    programStart: START,
    trainDays: [weekday(today)],
    states: states(),
    sessions: [session(addDays(today, -2))],
    events: [],
    ...over,
  }
}

describe('planToday — session kind', () => {
  it('rest day when today is not a training day', () => {
    const out = planToday(input({ trainDays: [] }))
    expect(out.kind).toBe('rest')
    expect(out.exercises).toHaveLength(0)
    expect(out.explanation).toMatch(/rest day/i)
  })

  it('blocked while a hard stop is pending', () => {
    const out = planToday(input({ hardStopPending: true }))
    expect(out.kind).toBe('blocked')
    expect(out.rulesFired).toEqual(['HARD_STOP'])
  })

  it('done when a session is already logged today', () => {
    const i = input()
    const out = planToday({ ...i, sessions: [session(i.today)] })
    expect(out.kind).toBe('done')
  })

  it('assessment when any ladder has no state: level 1, one set, assess mode', () => {
    const out = planToday(input({ states: [], sessions: [] }))
    expect(out.kind).toBe('assessment')
    expect(out.exercises).toHaveLength(5)
    for (const ex of out.exercises) {
      expect(ex.level.id).toMatch(/\.l1$/)
      expect(ex.mode).toBe('assess')
      expect(ex.sets).toBe(1)
    }
    expect(out.progressionAllowed).toBe(false)
  })
})

describe('planToday — volume ramp', () => {
  it.each([
    [1, 1],
    [2, 2],
    [3, 2],
    [4, 3],
    [10, 3],
  ])('week %i → %i sets', (week, sets) => {
    const today = addDays(START, week * 7 + 1)
    const out = planToday(input({ today, trainDays: [weekday(today)], sessions: [session(addDays(today, -2))] }))
    expect(out.kind).toBe('train')
    expect(out.setsPerExercise).toBe(sets)
    expect(out.exercises.every((e) => e.sets === sets)).toBe(true)
    expect(out.rulesFired).toEqual([])
    expect(out.progressionAllowed).toBe(true)
  })

  it('uses the state rep target, clamped to the level range', () => {
    const out = planToday(input({ states: states(2, 10) }))
    expect(out.exercises.find((e) => e.ladderId === 'push')!.target).toBe(10)
    const clamped = planToday(input({ states: states(2, 99) }))
    expect(clamped.exercises.find((e) => e.ladderId === 'push')!.target).toBe(12)
  })

  it('rpe ceiling follows the week', () => {
    expect(planToday(input()).rpeCeiling).toBe(6)
    const today = addDays(START, 4 * 7 + 1)
    expect(planToday(input({ today, trainDays: [weekday(today)] })).rpeCeiling).toBe(7)
  })
})

describe('planToday — readiness rules', () => {
  const week4 = addDays(START, 4 * 7 + 1)
  const w4 = (over: Partial<PlanInput> = {}) =>
    input({ today: week4, trainDays: [weekday(week4)], sessions: [session(addDays(week4, -2))], ...over })

  it('SLEEP_LOW: one set fewer, no progression, RPE capped at 6', () => {
    const out = planToday(w4({ checkin: { sleepHours: 5, sleepQuality: 3, mood: 3, soreness: 2 } }))
    expect(out.rulesFired).toEqual(['SLEEP_LOW'])
    expect(out.setsPerExercise).toBe(2)
    expect(out.progressionAllowed).toBe(false)
    expect(out.rpeCeiling).toBe(6)
    expect(out.explanation).toMatch(/sleep was 5h/i)
  })

  it('SLEEP_MID: full sets, no progression', () => {
    const out = planToday(w4({ checkin: { sleepHours: 6.5, sleepQuality: 3, mood: 3, soreness: 2 } }))
    expect(out.rulesFired).toEqual(['SLEEP_MID'])
    expect(out.setsPerExercise).toBe(3)
    expect(out.progressionAllowed).toBe(false)
  })

  it('SLEEP_MID also fires on poor quality with enough hours', () => {
    const out = planToday(w4({ checkin: { sleepHours: 8, sleepQuality: 2, mood: 3, soreness: 2 } }))
    expect(out.rulesFired).toEqual(['SLEEP_MID'])
  })

  it('never drops below one set', () => {
    const out = planToday(input({ checkin: { sleepHours: 4, sleepQuality: 1, mood: 3, soreness: 4 } }))
    expect(out.setsPerExercise).toBe(1)
  })

  it('SORENESS_HIGH with areas: those patterns one level down, today only', () => {
    const out = planToday(w4({ checkin: { sleepHours: 8, sleepQuality: 4, mood: 4, soreness: 4, soreAreas: ['squat'] } }))
    expect(out.rulesFired).toEqual(['SORENESS_HIGH'])
    const squat = out.exercises.find((e) => e.ladderId === 'squat')!
    expect(squat.level.id).toBe('squat.l1')
    expect(squat.mode).toBe('today_only')
    expect(squat.baseLevelId).toBe('squat.l2')
    expect(out.exercises.find((e) => e.ladderId === 'push')!.mode).toBe('normal')
    expect(out.setsPerExercise).toBe(3)
    expect(out.progressionAllowed).toBe(false)
  })

  it('SORENESS_HIGH without areas: one set fewer everywhere', () => {
    const out = planToday(w4({ checkin: { sleepHours: 8, sleepQuality: 4, mood: 4, soreness: 5 } }))
    expect(out.setsPerExercise).toBe(2)
    expect(out.exercises.every((e) => e.mode === 'normal')).toBe(true)
  })

  it('SORENESS_PERSIST: three sore sessions running opens an easy week', () => {
    const sessions = [session(addDays(week4, -4), { soreness: 4 }), session(addDays(week4, -2), { soreness: 5 })]
    const out = planToday(w4({ sessions, checkin: { sleepHours: 8, sleepQuality: 4, mood: 4, soreness: 4 } }))
    expect(out.rulesFired).toContain('SORENESS_PERSIST')
    expect(out.rulesFired).toContain('DELOAD_REACTIVE')
    expect(out.setsPerExercise).toBe(2) // round(3 * 0.5)
    expect(out.deloadUntil).toBe(addDays(week4, 6))
  })

  it('MOOD_LOW: minimum session, one set, counts as train kind "minimum"', () => {
    const out = planToday(w4({ checkin: { sleepHours: 8, sleepQuality: 4, mood: 2, soreness: 1 } }))
    expect(out.kind).toBe('minimum')
    expect(out.rulesFired).toEqual(['MOOD_LOW'])
    expect(out.setsPerExercise).toBe(1)
    expect(out.progressionAllowed).toBe(false)
  })

  it('wantMinimum: short version on demand', () => {
    const out = planToday(w4({ wantMinimum: true }))
    expect(out.kind).toBe('minimum')
    expect(out.rulesFired).toEqual(['MIN_SESSION'])
    expect(out.setsPerExercise).toBe(1)
  })

  it('SLEEP_LOW + MOOD_LOW: minimum wins on sets, both rules recorded', () => {
    const out = planToday(w4({ checkin: { sleepHours: 4, sleepQuality: 1, mood: 1, soreness: 1 } }))
    expect(out.kind).toBe('minimum')
    expect(out.rulesFired).toEqual(['SLEEP_LOW', 'MOOD_LOW'])
    expect(out.setsPerExercise).toBe(1)
  })
})

describe('planToday — missed time', () => {
  const week6 = addDays(START, 6 * 7 + 1)
  const w6 = (gap: number, over: Partial<PlanInput> = {}) =>
    input({ today: week6, trainDays: [weekday(week6)], sessions: [session(addDays(week6, -gap))], ...over })

  it('a single missed session changes nothing', () => {
    const out = planToday(w6(4))
    expect(out.rulesFired).toEqual([])
    expect(out.setsPerExercise).toBe(3)
  })

  it('MISS_1_WEEK: 7–13 days → one set fewer', () => {
    const out = planToday(w6(8))
    expect(out.rulesFired).toEqual(['MISS_1_WEEK'])
    expect(out.setsPerExercise).toBe(2)
    expect(out.progressionAllowed).toBe(true)
  })

  it('MISS_2_3_WEEKS: 14–27 days → retest one level down', () => {
    const out = planToday(w6(15))
    expect(out.rulesFired).toEqual(['MISS_2_3_WEEKS'])
    for (const ex of out.exercises) {
      expect(ex.level.id).toMatch(/\.l1$/)
      expect(ex.mode).toBe('retest')
      expect(ex.baseLevelId).toMatch(/\.l2$/)
    }
    expect(out.progressionAllowed).toBe(false)
    expect(out.rescreen).toBe(false)
  })

  it('MISS_4_PLUS_WEEKS: ≥28 days → two levels down (floor 1), persist, rescreen', () => {
    const out = planToday(w6(30, { states: states(4) }))
    expect(out.rulesFired).toEqual(['MISS_4_PLUS_WEEKS'])
    for (const ex of out.exercises) {
      expect(ex.level.id).toMatch(/\.l2$/)
      expect(ex.mode).toBe('persist')
    }
    expect(out.rescreen).toBe(true)
    const floor = planToday(w6(30, { states: states(2) }))
    expect(floor.exercises.every((e) => e.level.id.endsWith('.l1'))).toBe(true)
  })

  it('no sessions yet and states present → no miss rule', () => {
    const out = planToday(w6(4, { sessions: [] }))
    expect(out.rulesFired).toEqual([])
  })
})

describe('planToday — reactive deload', () => {
  const week5 = addDays(START, 5 * 7 + 1)
  const w5 = (over: Partial<PlanInput> = {}) =>
    input({ today: week5, trainDays: [weekday(week5)], sessions: [session(addDays(week5, -2))], ...over })

  it('two REGRESS_LEVEL events within 21 days open a 7-day easy week at half sets', () => {
    const events = [
      { date: addDays(week5, -10), type: 'REGRESS_LEVEL' as const, ladderId: 'push' as const },
      { date: addDays(week5, -3), type: 'REGRESS_LEVEL' as const, ladderId: 'squat' as const },
    ]
    const out = planToday(w5({ events }))
    expect(out.rulesFired).toEqual(['DELOAD_REACTIVE'])
    expect(out.setsPerExercise).toBe(2)
    expect(out.progressionAllowed).toBe(false)
    expect(out.deloadUntil).toBe(addDays(week5, 6))
  })

  it('old regress events do not count', () => {
    const events = [
      { date: addDays(week5, -30), type: 'REGRESS_LEVEL' as const },
      { date: addDays(week5, -25), type: 'REGRESS_LEVEL' as const },
    ]
    expect(planToday(w5({ events })).rulesFired).toEqual([])
  })

  it('regressions before the last easy week do not reopen one', () => {
    const events = [
      { date: addDays(week5, -12), type: 'REGRESS_LEVEL' as const },
      { date: addDays(week5, -10), type: 'REGRESS_LEVEL' as const },
      { date: addDays(week5, -9), type: 'DELOAD_REACTIVE' as const },
    ]
    expect(planToday(w5({ events })).rulesFired).toEqual([])
    const again = [...events, { date: addDays(week5, -1), type: 'REGRESS_LEVEL' as const }]
    expect(planToday(w5({ events: again })).rulesFired).toEqual([])
    const twice = [...again, { date: addDays(week5, -2), type: 'REGRESS_LEVEL' as const }]
    expect(planToday(w5({ events: twice })).rulesFired).toEqual(['DELOAD_REACTIVE'])
  })

  it('three form-break sessions running trigger a deload', () => {
    const sessions = [
      session(addDays(week5, -6), { formBreak: true }),
      session(addDays(week5, -4), { formBreak: true }),
      session(addDays(week5, -2), { formBreak: true }),
    ]
    expect(planToday(w5({ sessions })).rulesFired).toEqual(['DELOAD_REACTIVE'])
  })

  it('an active deload window keeps applying; an expired one does not', () => {
    const active = planToday(w5({ deloadUntil: addDays(week5, 2) }))
    expect(active.rulesFired).toEqual(['DELOAD_REACTIVE'])
    expect(active.deloadUntil).toBeUndefined()
    const expired = planToday(w5({ deloadUntil: addDays(week5, -1) }))
    expect(expired.rulesFired).toEqual([])
  })
})

describe('planToday — screening adaptations', () => {
  it('SHOULDER_LOCK caps push at chest height for the first weeks', () => {
    const st = states(6).map((s) => (s.ladderId === 'push' ? { ...s, levelId: 'push.l8' } : s))
    const out = planToday(input({ states: st, screening: { shoulderUnstable: true } }))
    const push = out.exercises.find((e) => e.ladderId === 'push')!
    expect(out.rulesFired).toContain('SHOULDER_LOCK')
    expect(push.level.id).toBe('push.l6')
    expect(push.mode).toBe('today_only')
    expect(out.exercises.find((e) => e.ladderId === 'pull')!.level.id).toBe('pull.l6')
  })

  it('SHOULDER_LOCK expires after the lock weeks', () => {
    const today = addDays(START, 6 * 7 + 1)
    const st = states(6).map((s) => (s.ladderId === 'push' ? { ...s, levelId: 'push.l8' } : s))
    const out = planToday(input({ today, trainDays: [weekday(today)], states: st, screening: { shoulderUnstable: true } }))
    expect(out.rulesFired).not.toContain('SHOULDER_LOCK')
    expect(out.exercises.find((e) => e.ladderId === 'push')!.level.id).toBe('push.l8')
  })

  it('wrist issue adds a fists/forearms note on hand-loaded levels only', () => {
    const out = planToday(input({ states: states(2), screening: { wristIssue: true } }))
    expect(out.exercises.find((e) => e.ladderId === 'push')!.note).toMatch(/fists/i)
    const l1 = planToday(input({ states: states(1), screening: { wristIssue: true } }))
    expect(l1.exercises.find((e) => e.ladderId === 'push')!.note).toBeUndefined()
  })
})

describe('planToday — explanation', () => {
  it('is a single sentence with no judgmental words', () => {
    const cases = [
      planToday(input()),
      planToday(input({ checkin: { sleepHours: 5, sleepQuality: 2, mood: 2, soreness: 4 } })),
      planToday(input({ sessions: [session(addDays(input().today, -20))] })),
    ]
    for (const out of cases) {
      expect(out.explanation.length).toBeGreaterThan(20)
      expect(out.explanation).not.toMatch(/fail|missed|behind|lazy/i)
      expect(out.explanation.split(/\. /).length).toBe(1)
    }
  })
})

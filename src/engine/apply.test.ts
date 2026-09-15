import { describe, expect, it } from 'vitest'
import { fixtureProgram } from './fixtures'
import { applySession, classifySets } from './apply'
import { planToday } from './plan'
import { addDays, weekday } from './dates'
import type { ApplyInput, EngineLadderState, EngineSetResult, PlanInput, PlanOutput } from './types'
import type { PatternId } from '../data/types'

const START = '2026-09-07'
const IDS: PatternId[] = ['push', 'pull', 'squat', 'hinge', 'core']

function states(over: Partial<Record<PatternId, Partial<EngineLadderState>>> = {}): EngineLadderState[] {
  return IDS.map((id) => ({
    ladderId: id,
    levelId: `${id}.l2`,
    repTarget: id === 'core' ? 20 : 8,
    cleanStreak: 0,
    failStreak: 0,
    ...over[id],
  }))
}

function plan(over: Partial<PlanInput> = {}, weekOffset = 4): { plan: PlanOutput; input: PlanInput } {
  const today = addDays(START, weekOffset * 7 + 1)
  const input: PlanInput = {
    program: fixtureProgram(),
    today,
    programStart: START,
    trainDays: [weekday(today)],
    states: states(),
    sessions: [{ date: addDays(today, -2), kind: 'train', status: 'done', sets: [] }],
    events: [],
    ...over,
  }
  return { plan: planToday(input), input }
}

function sets(p: PlanOutput, ladderId: PatternId, done: number | number[], outcome: EngineSetResult['outcome'] = 'clean'): EngineSetResult[] {
  const ex = p.exercises.find((e) => e.ladderId === ladderId)!
  const arr = Array.isArray(done) ? done : Array(ex.sets).fill(done)
  return arr.map((d) => ({ ladderId, levelId: ex.level.id, target: ex.target, done: d, outcome }))
}

function allClean(p: PlanOutput): EngineSetResult[] {
  return p.exercises.flatMap((e) => sets(p, e.ladderId, e.target))
}

function apply(p: PlanOutput, input: PlanInput, results: EngineSetResult[], extra: Partial<ApplyInput> = {}) {
  return applySession({ program: input.program, date: input.today, states: input.states, plan: p, results, ...extra })
}

const S = (ladderId: PatternId, out: ReturnType<typeof applySession>) => out.states.find((s) => s.ladderId === ladderId)!

describe('classifySets', () => {
  it('clean at max, clean below max, partial, fail by shortfall, fail by too-hard taps', () => {
    const mk = (done: number[], outcome: EngineSetResult['outcome'] = 'clean') =>
      done.map((d) => ({ ladderId: 'push' as const, levelId: 'x', target: 10, done: d, outcome }))
    expect(classifySets(mk([10, 10, 10]), 10, true, 0.7, 2)).toBe('clean_max')
    expect(classifySets(mk([10, 10, 10]), 10, false, 0.7, 2)).toBe('clean')
    expect(classifySets(mk([10, 9, 10]), 10, false, 0.7, 2)).toBe('partial')
    expect(classifySets(mk([5, 6, 7]), 10, false, 0.7, 2)).toBe('fail')
    expect(classifySets(mk([10, 10, 10], 'fail'), 10, false, 0.7, 2)).toBe('fail')
    expect(classifySets(mk([10, 10, 10], 'too_easy'), 10, false, 0.7, 2)).toBe('clean_max')
    expect(classifySets([], 10, false, 0.7, 2)).toBe('partial')
  })
})

describe('applySession — double progression inside a level', () => {
  it('clean session below the top of range raises the rep target by the step', () => {
    const { plan: p, input } = plan()
    const out = apply(p, input, allClean(p))
    expect(S('push', out).repTarget).toBe(10)
    expect(S('push', out).cleanStreak).toBe(0)
    expect(S('core', out).repTarget).toBe(25)
    expect(out.events.filter((e) => e.type === 'REP_TARGET_UP')).toHaveLength(5)
  })

  it('two clean sessions at the top of range move the level up and reset the target', () => {
    const { plan: p, input } = plan({ states: states({ push: { repTarget: 12 } }) })
    const first = apply(p, input, allClean(p))
    expect(S('push', first).cleanStreak).toBe(1)
    expect(S('push', first).levelId).toBe('push.l2')
    const second = apply(p, { ...input, states: first.states }, allClean(p))
    expect(S('push', second).levelId).toBe('push.l3')
    expect(S('push', second).repTarget).toBe(8)
    expect(S('push', second).cleanStreak).toBe(0)
    expect(second.events.some((e) => e.type === 'PROGRESS_UP' && e.ladderId === 'push')).toBe(true)
    expect(second.messages.join(' ')).toMatch(/level up/i)
  })

  it('a "too easy" tap counts as hitting the top of the range', () => {
    const { plan: p, input } = plan({ states: states({ push: { cleanStreak: 1 } }) })
    const out = apply(p, input, sets(p, 'push', 8, 'too_easy'))
    expect(S('push', out).levelId).toBe('push.l3')
  })

  it('no progression when the plan disallowed it (rep target and streak frozen)', () => {
    const { plan: p, input } = plan({
      states: states({ push: { repTarget: 12, cleanStreak: 1 } }),
      checkin: { sleepHours: 5, sleepQuality: 3, mood: 3, soreness: 1 },
    })
    expect(p.progressionAllowed).toBe(false)
    const out = apply(p, input, allClean(p))
    expect(S('push', out)).toMatchObject({ levelId: 'push.l2', repTarget: 12, cleanStreak: 1 })
    expect(S('squat', out).repTarget).toBe(8)
  })

  it('a form break holds the level and resets the clean streak', () => {
    const { plan: p, input } = plan({ states: states({ push: { repTarget: 12, cleanStreak: 1 } }) })
    const out = apply(p, input, allClean(p), { formBreak: true })
    expect(S('push', out)).toMatchObject({ levelId: 'push.l2', cleanStreak: 0 })
    expect(out.events.some((e) => e.type === 'PROGRESS_HOLD')).toBe(true)
  })

  it('a partial session (some sets short of target but ≥70%) leaves everything unchanged except streaks', () => {
    const { plan: p, input } = plan({ states: states({ push: { cleanStreak: 1, failStreak: 1 } }) })
    const out = apply(p, input, sets(p, 'push', [8, 8, 7]))
    expect(S('push', out)).toMatchObject({ levelId: 'push.l2', repTarget: 8, cleanStreak: 0, failStreak: 0 })
  })

  it('a skipped exercise leaves its state untouched', () => {
    const { plan: p, input } = plan({ states: states({ push: { cleanStreak: 1 } }) })
    const out = apply(p, input, sets(p, 'squat', 8))
    expect(S('push', out)).toMatchObject({ cleanStreak: 1 })
  })
})

describe('applySession — regression', () => {
  it('two sessions below 70% of target drop one level and reset to the bottom of the range', () => {
    const { plan: p, input } = plan({ states: states({ push: { repTarget: 12 } }) })
    const first = apply(p, input, sets(p, 'push', 5))
    expect(S('push', first)).toMatchObject({ levelId: 'push.l2', failStreak: 1 })
    expect(first.messages.join(' ')).not.toMatch(/fail/i)
    const second = apply(p, { ...input, states: first.states }, sets(p, 'push', 5))
    expect(S('push', second)).toMatchObject({ levelId: 'push.l1', repTarget: 8, failStreak: 0, cleanStreak: 0 })
    expect(second.events.some((e) => e.type === 'REGRESS_LEVEL' && e.ladderId === 'push')).toBe(true)
    expect(second.messages.join(' ')).toMatch(/found your level/i)
  })

  it('"too hard" on two sets regresses immediately', () => {
    const { plan: p, input } = plan()
    const out = apply(p, input, sets(p, 'push', [3, 2, 8], 'fail'))
    expect(S('push', out).levelId).toBe('push.l1')
  })

  it('pain in a pattern regresses it immediately even with clean reps', () => {
    const { plan: p, input } = plan()
    const out = apply(p, input, allClean(p), { painPatterns: ['hinge'] })
    expect(S('hinge', out).levelId).toBe('hinge.l1')
    expect(S('push', out).levelId).toBe('push.l2')
    expect(out.events.find((e) => e.type === 'REGRESS_LEVEL')?.detail).toBe('pain')
  })

  it('level 1 never bottoms out', () => {
    const { plan: p, input } = plan({ states: states({ push: { levelId: 'push.l1' } }) })
    const out = apply(p, input, sets(p, 'push', [1, 1, 1], 'fail'))
    expect(S('push', out)).toMatchObject({ levelId: 'push.l1', failStreak: 0 })
    expect(out.messages.join(' ')).toMatch(/level 1/)
  })

  it('a clean session resets the fail streak', () => {
    const { plan: p, input } = plan({ states: states({ push: { failStreak: 1 } }) })
    const out = apply(p, input, allClean(p))
    expect(S('push', out).failStreak).toBe(0)
  })
})

describe('applySession — ladder ceilings, hidden and gated levels', () => {
  it('holds at the top of the ladder', () => {
    const { plan: p, input } = plan({ states: states({ push: { levelId: 'push.l8', repTarget: 12, cleanStreak: 1 } }) })
    const out = apply(p, input, allClean(p))
    expect(S('push', out).levelId).toBe('push.l8')
    expect(out.messages.join(' ')).toMatch(/top of this ladder/i)
  })

  it('does not advance into a hidden level before its week', () => {
    const { plan: p, input } = plan({ states: states({ push: { levelId: 'push.l6', repTarget: 12, cleanStreak: 1 } }) })
    expect(S('push', apply(p, input, allClean(p))).levelId).toBe('push.l6')
    const later = plan({ states: states({ push: { levelId: 'push.l6', repTarget: 12, cleanStreak: 1 } }) }, 9)
    expect(S('push', apply(later.plan, later.input, allClean(later.plan))).levelId).toBe('push.l7')
  })

  it('does not advance into a gated level until the gate is passed', () => {
    const st = states({ pull: { levelId: 'pull.l4', repTarget: 12, cleanStreak: 1 } })
    const { plan: p, input } = plan({ states: st })
    expect(S('pull', apply(p, input, allClean(p))).levelId).toBe('pull.l4')
    const passed = applySession(
      { program: input.program, date: input.today, states: st, plan: p, results: allClean(p) },
      ['table_sit_test'],
    )
    expect(S('pull', passed).levelId).toBe('pull.l5')
  })
})

describe('applySession — special modes', () => {
  it('today_only (soreness) never changes state', () => {
    const { plan: p, input } = plan({ checkin: { sleepHours: 8, sleepQuality: 4, mood: 4, soreness: 4, soreAreas: ['squat'] } })
    const out = apply(p, input, sets(p, 'squat', 1, 'fail'))
    expect(S('squat', out)).toMatchObject({ levelId: 'squat.l2', failStreak: 0 })
  })

  it('retest: clean restores the original level, short keeps the lower one', () => {
    const today = addDays(START, 6 * 7 + 1)
    const { plan: p, input } = plan({ today, trainDays: [weekday(today)], sessions: [{ date: addDays(today, -16), kind: 'train', status: 'done', sets: [] }] })
    expect(p.exercises[0].mode).toBe('retest')
    const good = apply(p, input, allClean(p))
    expect(S('push', good).levelId).toBe('push.l2')
    const bad = apply(p, input, [...sets(p, 'push', 3), ...sets(p, 'squat', 8)])
    expect(S('push', bad).levelId).toBe('push.l1')
    expect(S('squat', bad).levelId).toBe('squat.l2')
  })

  it('persist: the performed level becomes the state level', () => {
    const today = addDays(START, 6 * 7 + 1)
    const { plan: p, input } = plan({
      today,
      trainDays: [weekday(today)],
      states: states({ push: { levelId: 'push.l5' } }),
      sessions: [{ date: addDays(today, -40), kind: 'train', status: 'done', sets: [] }],
    })
    const out = apply(p, input, allClean(p))
    expect(S('push', out)).toMatchObject({ levelId: 'push.l3', repTarget: 8 })
  })

  it('assessment: the highest clean level wins, capped by assessmentCap; nothing clean → level 1', () => {
    const { plan: p, input } = plan({ states: [], sessions: [] }, 0)
    expect(p.kind).toBe('assessment')
    const results: EngineSetResult[] = [
      { ladderId: 'push', levelId: 'push.l1', target: 8, done: 8, outcome: 'too_easy' },
      { ladderId: 'push', levelId: 'push.l2', target: 8, done: 8, outcome: 'clean' },
      { ladderId: 'push', levelId: 'push.l3', target: 8, done: 4, outcome: 'fail' },
      { ladderId: 'squat', levelId: 'squat.l1', target: 8, done: 8, outcome: 'too_easy' },
      { ladderId: 'squat', levelId: 'squat.l2', target: 8, done: 8, outcome: 'too_easy' },
      { ladderId: 'squat', levelId: 'squat.l3', target: 8, done: 8, outcome: 'too_easy' },
      { ladderId: 'squat', levelId: 'squat.l4', target: 8, done: 8, outcome: 'clean' },
      { ladderId: 'core', levelId: 'core.l1', target: 20, done: 5, outcome: 'fail' },
    ]
    const out = apply(p, input, results)
    expect(S('push', out)).toMatchObject({ levelId: 'push.l2', repTarget: 8 })
    expect(S('squat', out).levelId).toBe('squat.l3') // cap 3
    expect(S('core', out).levelId).toBe('core.l1')
    expect(S('pull', out).levelId).toBe('pull.l1')
    expect(out.states).toHaveLength(5)
  })
})

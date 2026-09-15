// Eight-week simulation of the adaptive engine against the real program data.
// Always asserts sanity; writes docs/SIMULATION.md when SIMULATE=1.

import { describe, expect, it } from 'vitest'
import { writeFileSync } from 'node:fs'
import { program } from '../data/program'
import { applySession } from './apply'
import { planToday } from './plan'
import { addDays, weekday } from './dates'
import { indexOfLevel, ladderOf } from './ladders'
import type { EngineEvent, EngineLadderState, EngineSessionRecord, EngineSetResult, PlanOutput } from './types'
import type { PatternId } from '../data/types'

const START = '2026-09-21' // Monday
const DAYS = 56
const TRAIN_DAYS = [1, 3, 5]

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Scenario {
  name: string
  seed: number
  /** Strength in "level units" per ladder at day 0. */
  strength0: number
  /** Strength gain per completed working set. */
  gainPerSet: number
  pSkip: number
  pBadSleep: number
  pLowMood: number
  pSore: number
  /** Inclusive day range with no training at all (a holiday, an illness). */
  gap?: [number, number]
  /** Skip the assessment: the user set every ladder to this 1-based level by hand. */
  manualStartLevel?: number
}

const SCENARIOS: Scenario[] = [
  { name: 'Steady beginner (good sleep, shows up)', seed: 1, strength0: 0.6, gainPerSet: 0.05, pSkip: 0.05, pBadSleep: 0.1, pLowMood: 0.03, pSore: 0.05 },
  { name: 'Realistic (skips, bad nights, a two-week gap in week 5)', seed: 7, strength0: 0.4, gainPerSet: 0.04, pSkip: 0.2, pBadSleep: 0.3, pLowMood: 0.1, pSore: 0.15, gap: [29, 43] },
  { name: 'Overreacher (set every ladder to level 5 by hand, weak, sore often)', seed: 3, strength0: 0.5, gainPerSet: 0.02, pSkip: 0.1, pBadSleep: 0.4, pLowMood: 0.15, pSore: 0.4, manualStartLevel: 5 },
]

interface SimResult {
  scenario: Scenario
  weekly: { week: number; sessions: number; minimum: number; rules: Record<string, number>; levels: Record<PatternId, number>; targets: Record<PatternId, number> }[]
  changes: { date: string; ladder: PatternId; from: number; to: number; type: string }[]
  explanations: string[]
  totalSessions: number
  totalSets: number
  totalReps: number
}

function simulate(sc: Scenario): SimResult {
  const rnd = mulberry32(sc.seed)
  const strength: Record<PatternId, number> = { push: sc.strength0, pull: sc.strength0, squat: sc.strength0, hinge: sc.strength0, core: sc.strength0 }
  let states: EngineLadderState[] = sc.manualStartLevel
    ? program.ladders.map((l) => {
        const level = l.levels[sc.manualStartLevel! - 1]
        return { ladderId: l.id, levelId: level.id, repTarget: level.scheme.reps ? level.scheme.reps[0] : level.scheme.holdSec![0], cleanStreak: 0, failStreak: 0 }
      })
    : []
  const sessions: EngineSessionRecord[] = []
  const events: EngineEvent[] = []
  let deloadUntil: string | undefined
  const result: SimResult = { scenario: sc, weekly: [], changes: [], explanations: [], totalSessions: 0, totalSets: 0, totalReps: 0 }
  let weekRules: Record<string, number> = {}
  let weekSessions = 0
  let weekMinimum = 0

  const levelIdx = (id: PatternId) => {
    const s = states.find((x) => x.ladderId === id)
    return s ? indexOfLevel(ladderOf(program, id), s.levelId) : -1
  }

  for (let day = 0; day < DAYS; day++) {
    const today = addDays(START, day)
    const inGap = sc.gap !== undefined && day >= sc.gap[0] && day <= sc.gap[1]
    const isTrain = TRAIN_DAYS.includes(weekday(today))
    const badSleep = rnd() < sc.pBadSleep
    const checkin = {
      sleepHours: badSleep ? 5 + rnd() * 1.5 : 7 + rnd() * 1.5,
      sleepQuality: badSleep ? 2 : 4,
      mood: rnd() < sc.pLowMood ? 2 : 4,
      soreness: rnd() < sc.pSore ? 4 : 2,
    }
    if (isTrain && !inGap && rnd() >= sc.pSkip) {
      const plan: PlanOutput = planToday({
        program,
        today,
        programStart: START,
        trainDays: TRAIN_DAYS,
        states,
        sessions,
        events,
        checkin,
        gatesPassed: [],
        deloadUntil,
      })
      if (plan.deloadUntil) {
        deloadUntil = plan.deloadUntil
        events.push({ date: today, type: 'DELOAD_REACTIVE' })
      }
      for (const r of plan.rulesFired) weekRules[r] = (weekRules[r] ?? 0) + 1
      result.explanations.push(`${today}: ${plan.explanation}`)
      expect(plan.explanation.length).toBeGreaterThan(10)
      expect(['train', 'assessment', 'minimum']).toContain(plan.kind)

      const before = Object.fromEntries(program.ladders.map((l) => [l.id, levelIdx(l.id)])) as Record<PatternId, number>
      const results: EngineSetResult[] = []
      for (const ex of plan.exercises) {
        const ladder = ladderOf(program, ex.ladderId)
        if (ex.mode === 'assess') {
          // Find-your-level: climb while it feels easy, up to the cap.
          let idx = 0
          for (;;) {
            const level = ladder.levels[idx]
            const t = level.scheme.reps ? level.scheme.reps[0] : level.scheme.holdSec![0]
            const ratio = 1 + (strength[ex.ladderId] - idx) * 0.5
            const done = Math.max(0, Math.round(t * Math.min(1.3, ratio)))
            const outcome = ratio >= 1.25 ? 'too_easy' : done >= t ? 'clean' : done < 0.5 * t ? 'fail' : 'short'
            results.push({ ladderId: ex.ladderId, levelId: level.id, target: t, done, outcome })
            result.totalSets++
            result.totalReps += done
            if (outcome !== 'too_easy' || idx + 1 >= ladder.assessmentCap) break
            idx++
          }
          continue
        }
        const idx = indexOfLevel(ladder, ex.level.id)
        for (let s = 0; s < ex.sets; s++) {
          const fatigue = 1 - s * 0.04
          const ratio = (1 + (strength[ex.ladderId] - idx) * 0.5) * fatigue * (0.95 + rnd() * 0.1)
          const done = Math.max(0, Math.round(ex.target * Math.min(1.3, ratio)))
          const outcome = ratio >= 1.25 ? 'too_easy' : done >= ex.target ? 'clean' : done < 0.5 * ex.target ? 'fail' : 'short'
          results.push({ ladderId: ex.ladderId, levelId: ex.level.id, target: ex.target, done, outcome })
          strength[ex.ladderId] += sc.gainPerSet
          result.totalSets++
          result.totalReps += done
        }
      }
      const out = applySession({ program, date: today, states, plan, results, formBreak: rnd() < 0.1 })
      // Sanity: at most one level change per ladder per session; never outside the ladder.
      for (const s of out.states) {
        const ladder = ladderOf(program, s.ladderId)
        const after = indexOfLevel(ladder, s.levelId)
        expect(after).toBeGreaterThanOrEqual(0)
        expect(after).toBeLessThan(ladder.levels.length)
        if (before[s.ladderId] >= 0) {
          expect(Math.abs(after - before[s.ladderId])).toBeLessThanOrEqual(plan.rulesFired.includes('MISS_4_PLUS_WEEKS') ? 2 : 1)
          if (after !== before[s.ladderId]) {
            const ev = out.events.find((e) => e.ladderId === s.ladderId && (e.type === 'PROGRESS_UP' || e.type === 'REGRESS_LEVEL'))
            result.changes.push({ date: today, ladder: s.ladderId, from: before[s.ladderId] + 1, to: after + 1, type: ev?.type ?? plan.exercises.find((e) => e.ladderId === s.ladderId)!.mode })
          }
        }
      }
      for (const m of out.messages) expect(m).not.toMatch(/\bfail(ed|ure)?\b|missed|behind/i)
      states = out.states
      events.push(...out.events)
      sessions.push({ date: today, kind: plan.kind as EngineSessionRecord['kind'], status: 'done', sets: results, formBreak: false, soreness: checkin.soreness })
      result.totalSessions++
      weekSessions++
      if (plan.kind === 'minimum') weekMinimum++
    } else if (!isTrain) {
      sessions.push({ date: today, kind: 'rest', status: 'done', sets: [] })
    }
    // Idle decay after two weeks away.
    if (inGap && day - sc.gap![0] > 14) for (const id of Object.keys(strength) as PatternId[]) strength[id] -= 0.03

    if (day % 7 === 6) {
      result.weekly.push({
        week: Math.floor(day / 7),
        sessions: weekSessions,
        minimum: weekMinimum,
        rules: weekRules,
        levels: Object.fromEntries(program.ladders.map((l) => [l.id, levelIdx(l.id) + 1])) as Record<PatternId, number>,
        targets: Object.fromEntries(program.ladders.map((l) => [l.id, states.find((s) => s.ladderId === l.id)?.repTarget ?? 0])) as Record<PatternId, number>,
      })
      weekRules = {}
      weekSessions = 0
      weekMinimum = 0
    }
  }
  return result
}

function render(results: SimResult[]): string {
  const lines: string[] = []
  lines.push('# Eight-week engine simulation', '')
  lines.push(`Generated by \`SIMULATE=1 npx vitest run src/engine/simulation\` from \`src/engine/simulation.test.ts\` against \`src/data/program.json\` v${program.version}.`)
  lines.push('Three synthetic users train Mon/Wed/Fri from 2026-09-21 for 56 days. Each simulated set produces reps from a hidden "strength" number that grows with every completed set, so the engine is driven by plausible, noisy results rather than by scripted outcomes.', '')
  lines.push('Sanity checks asserted for every session: the plan is a train/assessment/minimum kind on training days, every level stays inside its ladder, no ladder changes more than one level per session (two after a 4-week layoff), and no message contains "failed", "missed" or "behind".', '')
  for (const r of results) {
    const sc = r.scenario
    lines.push(`## ${sc.name}`, '')
    lines.push(`Parameters: ${sc.manualStartLevel ? `manual start at level ${sc.manualStartLevel}, ` : ''}start strength ${sc.strength0}, gain/set ${sc.gainPerSet}, P(skip) ${sc.pSkip}, P(bad sleep) ${sc.pBadSleep}, P(low mood) ${sc.pLowMood}, P(sore) ${sc.pSore}${sc.gap ? `, no training on days ${sc.gap[0]}–${sc.gap[1]}` : ''}.`, '')
    lines.push(`Totals: ${r.totalSessions} sessions, ${r.totalSets} sets, ${r.totalReps} reps/seconds logged.`, '')
    lines.push('| Week | Sessions (min.) | Push | Pull | Squat | Hinge | Core | Rules fired |', '|---|---|---|---|---|---|---|---|')
    for (const w of r.weekly) {
      const rules = Object.entries(w.rules).map(([k, v]) => `${k}×${v}`).join(', ') || '—'
      const cell = (id: PatternId) => `L${w.levels[id]} @${w.targets[id]}`
      lines.push(`| ${w.week} | ${w.sessions} (${w.minimum}) | ${cell('push')} | ${cell('pull')} | ${cell('squat')} | ${cell('hinge')} | ${cell('core')} | ${rules} |`)
    }
    lines.push('', '**Level changes**', '')
    if (r.changes.length === 0) lines.push('- none')
    for (const c of r.changes) lines.push(`- ${c.date} · ${c.ladder}: level ${c.from} → ${c.to} (${c.type})`)
    lines.push('', '**Sample explanations (first 6 sessions and every session with a modifier)**', '')
    const picked = r.explanations.filter((e, i) => i < 6 || !/^\S+: Full session/.test(e)).slice(0, 25)
    for (const e of picked) lines.push(`- ${e}`)
    lines.push('')
  }
  return lines.join('\n') + '\n'
}

describe('eight-week simulation', () => {
  const results = SCENARIOS.map(simulate)

  it('steady beginner progresses in most ladders and is never regressed', () => {
    const r = results[0]
    const last = r.weekly[r.weekly.length - 1]
    const ups = r.changes.filter((c) => c.type === 'PROGRESS_UP').length
    const downs = r.changes.filter((c) => c.type === 'REGRESS_LEVEL').length
    expect(ups).toBeGreaterThanOrEqual(3)
    expect(downs).toBe(0)
    expect(Object.values(last.levels).filter((l) => l >= 2).length).toBeGreaterThanOrEqual(3)
  })

  it('realistic user survives a two-week gap with a retest, and rules fire', () => {
    const r = results[1]
    const rules = new Set(r.weekly.flatMap((w) => Object.keys(w.rules)))
    expect(rules.has('MISS_2_3_WEEKS')).toBe(true)
    expect(rules.has('SLEEP_LOW') || rules.has('SLEEP_MID')).toBe(true)
    expect(r.totalSessions).toBeGreaterThan(10)
  })

  it('overreacher regresses toward level 1 and never below it, and gets an easy week', () => {
    const r = results[2]
    expect(r.changes.some((c) => c.type === 'REGRESS_LEVEL')).toBe(true)
    for (const w of r.weekly) for (const l of Object.values(w.levels)) expect(l).toBeGreaterThanOrEqual(1)
    const rules = new Set(r.weekly.flatMap((w) => Object.keys(w.rules)))
    expect(rules.has('DELOAD_REACTIVE')).toBe(true)
  })

  it('writes docs/SIMULATION.md when SIMULATE=1', () => {
    if (process.env.SIMULATE !== '1') return
    writeFileSync('docs/SIMULATION.md', render(results))
  })
})

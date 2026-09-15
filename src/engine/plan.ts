import type { PatternId } from '../data/types'
import { addDays, diffDays, weekday } from './dates'
import { ladderOf, levelAt, indexOfLevel, maxTarget, minTarget, prevLevel, unitOf } from './ladders'
import { rpeForWeek, setsForWeek, weekIndexOf } from './week'
import type {
  EngineLadderState,
  EngineSessionRecord,
  ExerciseMode,
  PlanInput,
  PlanOutput,
  PlannedExercise,
  RuleName,
} from './types'

/** Push levels above this 0-based index put the hands below chest height. */
export const SHOULDER_LOCK_MAX_INDEX = 5
/** Weeks (0-based) during which the shoulder lock applies after a "shoulder unstable" screen answer. */
export const SHOULDER_LOCK_WEEKS = 5
export const DELOAD_DAYS = 7

interface Ctx {
  input: PlanInput
  weekIndex: number
  rules: RuleName[]
  setsDelta: number
  setFactor: number
  minimum: boolean
  progressionAllowed: boolean
  rpeCap?: number
  levelShift: number
  shiftMode: ExerciseMode
  todayOnlyPatterns: Set<PatternId>
  deloadUntil?: string
  rescreen: boolean
  notes: string[]
}

function lastDoneSession(sessions: EngineSessionRecord[]): EngineSessionRecord | undefined {
  for (let i = sessions.length - 1; i >= 0; i--) {
    const s = sessions[i]
    if (s.kind !== 'rest' && s.status !== 'skipped') return s
  }
  return undefined
}

function recentDone(sessions: EngineSessionRecord[], n: number): EngineSessionRecord[] {
  return sessions.filter((s) => s.kind !== 'rest' && s.status !== 'skipped').slice(-n)
}

// ---- Named rules. Each inspects the context and mutates it when it fires. ----

export function ruleMissedTime(ctx: Ctx): void {
  const { input } = ctx
  const r = input.program.rules
  const last = lastDoneSession(input.sessions)
  if (!last) return
  const gap = diffDays(last.date, input.today)
  if (gap >= r.missFourWeeksDays) {
    ctx.rules.push('MISS_4_PLUS_WEEKS')
    ctx.levelShift = -2
    ctx.shiftMode = 'persist'
    ctx.progressionAllowed = false
    ctx.rescreen = true
    ctx.notes.push(`It has been ${gap} days, so every exercise restarts two levels down and rebuilds from there`)
  } else if (gap >= r.missTwoWeeksDays) {
    ctx.rules.push('MISS_2_3_WEEKS')
    ctx.levelShift = -1
    ctx.shiftMode = 'retest'
    ctx.progressionAllowed = false
    ctx.notes.push(`After ${gap} days away today is a retest one level down; hit the target and the level comes straight back`)
  } else if (gap >= r.missWeekDays) {
    ctx.rules.push('MISS_1_WEEK')
    ctx.setsDelta -= 1
    ctx.notes.push(`First session back after ${gap} days, so one set fewer today`)
  }
}

export function ruleDeload(ctx: Ctx): void {
  const { input } = ctx
  const r = input.program.rules
  const active = input.deloadUntil !== undefined && input.deloadUntil >= input.today
  let trigger: string | undefined
  if (!active) {
    let windowStart = addDays(input.today, -r.deloadRegressEventsWindowDays)
    // Only regressions after the last easy week count toward opening a new one.
    for (const e of input.events) if (e.type === 'DELOAD_REACTIVE' && e.date >= windowStart) windowStart = addDays(e.date, 1)
    const regressions = input.events.filter((e) => e.type === 'REGRESS_LEVEL' && e.date >= windowStart).length
    const recent = recentDone(input.sessions, r.deloadFormBreakSessions)
    const formBreaks =
      recent.length === r.deloadFormBreakSessions && recent.every((s) => s.formBreak === true)
    if (regressions >= r.deloadRegressEvents) trigger = 'two level changes in three weeks'
    else if (formBreaks) trigger = 'form broke down in three sessions running'
  }
  if (!active && !trigger) return
  ctx.rules.push('DELOAD_REACTIVE')
  ctx.setFactor = r.deloadSetFactor
  ctx.progressionAllowed = false
  if (trigger) {
    ctx.deloadUntil = addDays(input.today, DELOAD_DAYS - 1)
    ctx.notes.push(`Easy week: ${trigger}, so sets are halved and levels stay put until ${ctx.deloadUntil}`)
  } else {
    ctx.notes.push(`Easy week until ${input.deloadUntil}: half the sets, same levels`)
  }
}

export function ruleSoreness(ctx: Ctx): void {
  const { input } = ctx
  const c = input.checkin
  if (!c) return
  const r = input.program.rules
  if (c.soreness < r.sorenessHigh) return
  const recent = recentDone(input.sessions, r.sorenessPersistSessions - 1)
  const persist =
    recent.length === r.sorenessPersistSessions - 1 &&
    recent.every((s) => (s.soreness ?? 0) >= r.sorenessHigh)
  if (persist && !ctx.rules.includes('DELOAD_REACTIVE')) {
    ctx.rules.push('SORENESS_PERSIST', 'DELOAD_REACTIVE')
    ctx.setFactor = r.deloadSetFactor
    ctx.progressionAllowed = false
    ctx.deloadUntil = addDays(input.today, DELOAD_DAYS - 1)
    ctx.notes.push(`Soreness has stayed high for three sessions, so this is an easy week: half the sets, same levels`)
    return
  }
  ctx.rules.push('SORENESS_HIGH')
  ctx.progressionAllowed = false
  if (c.soreAreas && c.soreAreas.length > 0) {
    for (const p of c.soreAreas) ctx.todayOnlyPatterns.add(p)
    ctx.notes.push(`Soreness is ${c.soreness}/5 in ${c.soreAreas.join(' and ')}, so those run one level easier today only`)
  } else {
    ctx.setsDelta -= 1
    ctx.notes.push(`Soreness is ${c.soreness}/5, so one set fewer everywhere today`)
  }
}

export function ruleSleep(ctx: Ctx): void {
  const c = ctx.input.checkin
  if (!c) return
  const r = ctx.input.program.rules
  if (c.sleepHours < r.sleepLowHours) {
    ctx.rules.push('SLEEP_LOW')
    ctx.setsDelta -= 1
    ctx.progressionAllowed = false
    ctx.rpeCap = 6
    ctx.notes.push(`Sleep was ${fmtHours(c.sleepHours)}, so one set fewer and no level changes today`)
  } else if (c.sleepHours < r.sleepMidHours || c.sleepQuality <= r.sleepQualityLow) {
    ctx.rules.push('SLEEP_MID')
    ctx.progressionAllowed = false
    ctx.notes.push(
      c.sleepHours < r.sleepMidHours
        ? `Sleep was ${fmtHours(c.sleepHours)}, so the full session runs but levels stay put today`
        : `Sleep quality was ${c.sleepQuality}/5, so the full session runs but levels stay put today`,
    )
  }
}

export function ruleMood(ctx: Ctx): void {
  const c = ctx.input.checkin
  const r = ctx.input.program.rules
  if (ctx.input.wantMinimum) {
    ctx.rules.push('MIN_SESSION')
    ctx.minimum = true
    ctx.progressionAllowed = false
    ctx.notes.push(`Short version: one set of each, about five minutes, and it counts in full`)
    return
  }
  if (c && c.mood <= r.moodLow) {
    ctx.rules.push('MOOD_LOW')
    ctx.minimum = true
    ctx.progressionAllowed = false
    ctx.notes.push(`Mood is ${c.mood}/5, so today is the short version: one set of each, and it counts in full`)
  }
}

export function ruleShoulderLock(ctx: Ctx, exercises: PlannedExercise[]): void {
  if (!ctx.input.screening?.shoulderUnstable) return
  if (ctx.weekIndex >= SHOULDER_LOCK_WEEKS) return
  const ex = exercises.find((e) => e.ladderId === 'push')
  if (!ex) return
  const ladder = ladderOf(ctx.input.program, 'push')
  if (indexOfLevel(ladder, ex.level.id) <= SHOULDER_LOCK_MAX_INDEX) return
  ctx.rules.push('SHOULDER_LOCK')
  const level = levelAt(ladder, SHOULDER_LOCK_MAX_INDEX)
  Object.assign(ex, {
    level,
    mode: 'today_only' as ExerciseMode,
    target: minTarget(level),
    unit: unitOf(level),
    perSide: level.scheme.perSide === true,
    restSec: level.scheme.restSec,
    note: 'Shoulder check-in: hands stay at chest height or higher for the first weeks',
  })
  ctx.notes.push('Push stays at chest height until the shoulder has four weeks of control work')
}

// ---- Plan assembly ----

function fmtHours(h: number): string {
  return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`
}

function buildExercise(ctx: Ctx, state: EngineLadderState | undefined, ladderId: PatternId): PlannedExercise {
  const ladder = ladderOf(ctx.input.program, ladderId)
  if (!state) {
    const level = ladder.levels[0]
    return {
      ladderId,
      level,
      baseLevelId: level.id,
      mode: 'assess',
      sets: 1,
      target: minTarget(level),
      unit: unitOf(level),
      perSide: level.scheme.perSide === true,
      restSec: level.scheme.restSec,
      note: `Find your level: start here, and if it felt easy try the next level (up to level ${ladder.assessmentCap})`,
    }
  }
  const baseIdx = indexOfLevel(ladder, state.levelId)
  let level = ladder.levels[baseIdx]
  let mode: ExerciseMode = 'normal'
  let target = Math.min(Math.max(state.repTarget, minTarget(level)), maxTarget(level))
  if (ctx.levelShift < 0) {
    level = levelAt(ladder, baseIdx + ctx.levelShift)
    mode = ctx.shiftMode
    target = minTarget(level)
  } else if (ctx.todayOnlyPatterns.has(ladderId)) {
    const p = prevLevel(ladder, state.levelId)
    if (p) {
      level = p
      mode = 'today_only'
      target = minTarget(level)
    }
  }
  const note = ctx.input.screening?.wristIssue && level.wristLoad >= 1 ? 'Wrists: fists on a towel, or forearms' : undefined
  return {
    ladderId,
    level,
    baseLevelId: state.levelId,
    mode,
    sets: 0,
    target,
    unit: unitOf(level),
    perSide: level.scheme.perSide === true,
    restSec: level.scheme.restSec,
    note,
  }
}

export function planToday(input: PlanInput): PlanOutput {
  const weekIndex = weekIndexOf(input.programStart, input.today)
  const base: PlanOutput = {
    kind: 'rest',
    weekIndex,
    exercises: [],
    progressionAllowed: false,
    rpeCeiling: rpeForWeek(input.program, weekIndex),
    setsPerExercise: 0,
    rulesFired: [],
    explanation: '',
    rescreen: false,
  }
  if (input.hardStopPending) {
    return {
      ...base,
      kind: 'blocked',
      rulesFired: ['HARD_STOP'],
      explanation: 'Training is paused until you have read the medical note and confirmed you are okay',
    }
  }
  const doneToday = input.sessions.some((s) => s.date === input.today && s.kind !== 'rest' && s.status !== 'skipped')
  if (doneToday) return { ...base, kind: 'done', explanation: 'Today is logged; the next session is on your next training day' }

  if (!input.trainDays.includes(weekday(input.today))) {
    return { ...base, explanation: 'Rest day: five minutes of easy mobility and the habit checkboxes are the whole job today' }
  }

  const ctx: Ctx = {
    input,
    weekIndex,
    rules: [],
    setsDelta: 0,
    setFactor: 1,
    minimum: false,
    progressionAllowed: true,
    levelShift: 0,
    shiftMode: 'normal',
    todayOnlyPatterns: new Set(),
    rescreen: false,
    notes: [],
  }

  const stateFor = (id: PatternId) => input.states.find((s) => s.ladderId === id)
  const assessment = input.program.ladders.some((l) => !stateFor(l.id))

  // Precedence: MISS > DELOAD > SORENESS > SLEEP > MOOD.
  if (!assessment) {
    ruleMissedTime(ctx)
    ruleDeload(ctx)
    ruleSoreness(ctx)
  }
  ruleSleep(ctx)
  ruleMood(ctx)

  const exercises = input.program.ladders.map((l) => buildExercise(ctx, stateFor(l.id), l.id))
  ruleShoulderLock(ctx, exercises)

  const baseSets = setsForWeek(input.program, weekIndex)
  let sets = ctx.minimum ? 1 : Math.max(1, Math.round((baseSets + ctx.setsDelta) * ctx.setFactor))
  if (assessment) sets = 1
  for (const ex of exercises) if (ex.mode !== 'assess') ex.sets = sets

  const kind = assessment ? 'assessment' : ctx.minimum ? 'minimum' : 'train'
  const progressionAllowed = !assessment && ctx.progressionAllowed
  const rpeCeiling = Math.min(base.rpeCeiling, ctx.rpeCap ?? 99)

  let explanation: string
  if (assessment) {
    explanation = `Week 0 is about finding your starting level: one easy set of each pattern, stepping up only when a level felt easy`
  } else if (ctx.notes.length > 0) {
    explanation = ctx.notes[0] + (ctx.notes.length > 1 ? ` (also: ${ctx.notes.slice(1).join('; ').toLowerCase()})` : '')
  } else {
    explanation = `Full session, week ${weekIndex}: ${sets} set${sets === 1 ? '' : 's'} of each exercise, stopping every set at RPE ${rpeCeiling} or when the last rep starts to look different`
  }

  return {
    kind,
    weekIndex,
    exercises,
    progressionAllowed,
    rpeCeiling,
    setsPerExercise: sets,
    rulesFired: ctx.rules,
    explanation,
    deloadUntil: ctx.deloadUntil,
    rescreen: ctx.rescreen,
  }
}

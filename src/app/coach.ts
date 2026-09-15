// Adapter between IndexedDB (Dexie) and the pure adaptive engine.
// UI code calls these functions; it never calls the engine directly.

import { db } from '../db/db'
import type { Checkin, LadderState, Profile, Session, SetLog } from '../db/types'
import type { PatternId, Program } from '../data/types'
import { program as defaultProgram } from '../data/program'
import { applySession, planToday } from '../engine'
import type {
  ApplyOutput,
  EngineEvent,
  EngineLadderState,
  EngineSessionRecord,
  EngineSetResult,
  PlanInput,
  PlanOutput,
  RuleName,
  SetOutcome,
} from '../engine/types'
import { todayKey } from '../lib/dates'

export const SETTING_DELOAD_UNTIL = 'deloadUntil'
export const SETTING_HARD_STOP = 'hardStopPending'
export const SETTING_RESCREEN = 'rescreenRequested'

export function trainDaysOf(profile: Profile): number[] {
  if (profile.slots && profile.slots.length > 0) return [...new Set(profile.slots.map((s) => s.day))].sort()
  return profile.trainDays
}

function toEngineState(row: LadderState): EngineLadderState {
  return {
    ladderId: row.ladderId as PatternId,
    levelId: row.currentLevelId,
    repTarget: row.repTarget,
    cleanStreak: row.cleanStreak,
    failStreak: row.failStreak,
  }
}

function toEngineSession(row: Session, sets: SetLog[]): EngineSessionRecord {
  const status = row.status === 'done' ? 'done' : row.status === 'partial' ? 'partial' : 'skipped'
  return {
    date: row.date,
    kind: row.plannedKind,
    status,
    sets: sets.map(toEngineSet),
    formBreak: row.formBreak,
    painPatterns: row.painPatterns,
    soreness: row.soreness,
  }
}

function toEngineSet(s: SetLog): EngineSetResult {
  return {
    ladderId: s.ladderId as PatternId,
    levelId: s.levelId,
    target: s.holdSeconds !== undefined ? s.targetReps : s.targetReps,
    done: s.holdSeconds !== undefined ? s.holdSeconds : s.doneReps,
    outcome: s.outcome,
  }
}

async function settingValue<T>(key: string): Promise<T | undefined> {
  const row = await db.settings.get(key)
  return row?.value as T | undefined
}

export async function loadPlanInput(today = todayKey(), program: Program = defaultProgram, wantMinimum = false): Promise<PlanInput | null> {
  const profile = await db.profile.get('me')
  if (!profile?.onboardedAt) return null
  const [states, sessions, setLogs, events, checkin, deloadUntil, hardStopPending] = await Promise.all([
    db.ladderState.toArray(),
    db.sessions.orderBy('date').toArray(),
    db.setLogs.toArray(),
    db.events.where('type').anyOf(['REGRESS_LEVEL', 'PROGRESS_UP', 'DELOAD_REACTIVE']).toArray(),
    db.checkins.where('date').equals(today).first(),
    settingValue<string>(SETTING_DELOAD_UNTIL),
    settingValue<boolean>(SETTING_HARD_STOP),
  ])
  const setsBySession = new Map<number, SetLog[]>()
  for (const s of setLogs) {
    const arr = setsBySession.get(s.sessionId) ?? []
    arr.push(s)
    setsBySession.set(s.sessionId, arr)
  }
  const pastSessions = sessions
    .filter((s) => s.status !== 'planned' && s.date <= today)
    .map((s) => toEngineSession(s, setsBySession.get(s.id!) ?? []))
  return {
    program,
    today,
    programStart: profile.onboardedAt.slice(0, 10),
    trainDays: trainDaysOf(profile),
    states: states.map(toEngineState),
    sessions: pastSessions,
    events: events.map((e) => ({ date: e.ts.slice(0, 10), type: e.type as RuleName, ladderId: (e.payload as { ladderId?: PatternId })?.ladderId })),
    checkin: checkin ? toEngineCheckin(checkin) : undefined,
    screening: { shoulderUnstable: profile.screening?.q8 === true, wristIssue: profile.screening?.q9 === true },
    gatesPassed: profile.gatesPassed ?? [],
    deloadUntil,
    hardStopPending: hardStopPending === true,
    wantMinimum,
  }
}

function toEngineCheckin(c: Checkin) {
  return { sleepHours: c.sleepHours, sleepQuality: c.sleepQuality, mood: c.mood, soreness: c.soreness, soreAreas: c.soreAreas }
}

/** Compute today's plan and persist any side effects (new deload window, re-screen request). */
export async function getTodayPlan(today = todayKey(), wantMinimum = false): Promise<PlanOutput | null> {
  const input = await loadPlanInput(today, defaultProgram, wantMinimum)
  if (!input) return null
  const plan = planToday(input)
  if (plan.deloadUntil) {
    await db.settings.put({ key: SETTING_DELOAD_UNTIL, value: plan.deloadUntil })
    await db.events.add({ ts: new Date().toISOString(), type: 'DELOAD_REACTIVE', payload: { until: plan.deloadUntil } })
  }
  if (plan.rescreen) await db.settings.put({ key: SETTING_RESCREEN, value: true })
  return plan
}

/** Today's session row, if one was started. */
export async function getTodaySession(today = todayKey()): Promise<Session | undefined> {
  return db.sessions.where('date').equals(today).filter((s) => s.plannedKind !== 'rest').first()
}

/** Start (or resume) today's session from a plan. Returns the session id. */
export async function startSession(plan: PlanOutput, today = todayKey()): Promise<number> {
  const existing = await getTodaySession(today)
  if (existing?.id !== undefined && existing.status === 'planned') return existing.id
  const checkin = await db.checkins.where('date').equals(today).first()
  const kind = plan.kind === 'assessment' || plan.kind === 'minimum' ? plan.kind : 'train'
  return db.sessions.add({
    date: today,
    plannedKind: kind,
    status: 'planned',
    startedAt: new Date().toISOString(),
    planSnapshot: plan,
    soreness: checkin?.soreness,
    rulesFired: plan.rulesFired,
  }) as Promise<number>
}

export interface LogSetArgs {
  sessionId: number
  ladderId: PatternId
  levelId: string
  setIndex: number
  target: number
  done: number
  unit: 'reps' | 'sec'
  outcome: SetOutcome
}

export async function logSet(args: LogSetArgs): Promise<number> {
  return db.setLogs.add({
    sessionId: args.sessionId,
    ladderId: args.ladderId,
    levelId: args.levelId,
    setIndex: args.setIndex,
    targetReps: args.target,
    doneReps: args.unit === 'reps' ? args.done : 0,
    holdSeconds: args.unit === 'sec' ? args.done : undefined,
    outcome: args.outcome,
    ts: new Date().toISOString(),
  }) as Promise<number>
}

export interface FinishArgs {
  sessionId: number
  rpe?: number
  note?: string
  formBreak?: boolean
  painPatterns?: PatternId[]
  /** True when the user ended early; the session still counts. */
  partial?: boolean
}

/** Close the session: run the progression rules and persist ladder states, events and the explanation. */
export async function finishSession(args: FinishArgs): Promise<ApplyOutput> {
  const session = await db.sessions.get(args.sessionId)
  if (!session?.planSnapshot) throw new Error('session has no plan snapshot')
  const [sets, stateRows, profile] = await Promise.all([
    db.setLogs.where('sessionId').equals(args.sessionId).toArray(),
    db.ladderState.toArray(),
    db.profile.get('me'),
  ])
  const out = applySession(
    {
      program: defaultProgram,
      date: session.date,
      states: stateRows.map(toEngineState),
      plan: session.planSnapshot,
      results: sets.map(toEngineSet),
      formBreak: args.formBreak,
      painPatterns: args.painPatterns,
    },
    profile?.gatesPassed ?? [],
  )
  const now = new Date().toISOString()
  await db.transaction('rw', [db.sessions, db.ladderState, db.events], async () => {
    for (const s of out.states) {
      const prev = stateRows.find((r) => r.ladderId === s.ladderId)
      const changed = !prev || prev.currentLevelId !== s.levelId
      const history = prev?.history ?? []
      if (changed) {
        const ev = out.events.find((e) => e.ladderId === s.ladderId && (e.type === 'PROGRESS_UP' || e.type === 'REGRESS_LEVEL'))
        history.push({ date: session.date, levelId: s.levelId, reason: ev?.type ?? (prev ? 'adjusted' : 'assessment') })
      }
      await db.ladderState.put({
        ladderId: s.ladderId,
        currentLevelId: s.levelId,
        repTarget: s.repTarget,
        cleanStreak: s.cleanStreak,
        failStreak: s.failStreak,
        updatedAt: now,
        history,
      })
    }
    for (const e of out.events) {
      await db.events.add({ ts: `${session.date}T12:00:00.000Z`, type: e.type, payload: { ladderId: e.ladderId, detail: e.detail } })
    }
    await db.sessions.update(args.sessionId, {
      status: args.partial ? 'partial' : 'done',
      endedAt: now,
      rpe: args.rpe,
      note: args.note,
      formBreak: args.formBreak,
      painPatterns: args.painPatterns,
      adaptationNote: out.messages.join(' · '),
    })
  })
  return out
}

/** Mark today as a rest day done (mobility routine completed). */
export async function logRestDay(today = todayKey()): Promise<void> {
  const existing = await db.sessions.where('date').equals(today).first()
  if (existing) return
  await db.sessions.add({ date: today, plannedKind: 'rest', status: 'done', startedAt: new Date().toISOString(), endedAt: new Date().toISOString() })
}

export async function setHardStop(pending: boolean): Promise<void> {
  await db.settings.put({ key: SETTING_HARD_STOP, value: pending })
  if (pending) await db.events.add({ ts: new Date().toISOString(), type: 'HARD_STOP', payload: {} })
}

/** Manually set a ladder level (Program page). Resets the rep target to the bottom of the range. */
export async function setLadderLevel(ladderId: PatternId, levelId: string, repTarget: number, reason = 'manual'): Promise<void> {
  const prev = await db.ladderState.get(ladderId)
  const history = prev?.history ?? []
  history.push({ date: todayKey(), levelId, reason })
  await db.ladderState.put({
    ladderId,
    currentLevelId: levelId,
    repTarget,
    cleanStreak: 0,
    failStreak: 0,
    updatedAt: new Date().toISOString(),
    history,
  })
}

export type { EngineEvent }

import type { Level, PatternId, Program } from '../data/types'

/** Persisted per-ladder state (mirrors db LadderState, minus history). */
export interface EngineLadderState {
  ladderId: PatternId
  levelId: string
  /** Current rep (or hold-seconds) target inside the level's range. */
  repTarget: number
  cleanStreak: number
  failStreak: number
}

export type SetOutcome = 'clean' | 'short' | 'fail' | 'too_easy'

export interface EngineSetResult {
  ladderId: PatternId
  levelId: string
  target: number
  done: number
  outcome: SetOutcome
}

export type SessionKind = 'train' | 'assessment' | 'minimum' | 'rest'

export interface EngineSessionRecord {
  date: string
  kind: SessionKind
  status: 'done' | 'partial' | 'skipped'
  sets: EngineSetResult[]
  /** True when the user flagged a form break (or pressed "too hard") anywhere in the session. */
  formBreak?: boolean
  /** Patterns where the user reported joint / sharp pain. */
  painPatterns?: PatternId[]
  /** Soreness reported at the day's check-in (1–5). */
  soreness?: number
}

export type RuleName =
  | 'HARD_STOP'
  | 'MISS_1_WEEK'
  | 'MISS_2_3_WEEKS'
  | 'MISS_4_PLUS_WEEKS'
  | 'DELOAD_REACTIVE'
  | 'SORENESS_PERSIST'
  | 'SORENESS_HIGH'
  | 'SLEEP_LOW'
  | 'SLEEP_MID'
  | 'MOOD_LOW'
  | 'MIN_SESSION'
  | 'SHOULDER_LOCK'
  | 'PROGRESS_UP'
  | 'PROGRESS_HOLD'
  | 'REGRESS_LEVEL'
  | 'REP_TARGET_UP'

export interface EngineEvent {
  date: string
  type: RuleName
  ladderId?: PatternId
  detail?: string
}

export interface CheckinInput {
  sleepHours: number
  sleepQuality: number
  mood: number
  soreness: number
  /** Optional: which patterns are sore (empty = unspecified). */
  soreAreas?: PatternId[]
}

export interface ScreeningFlags {
  shoulderUnstable?: boolean
  wristIssue?: boolean
}

export interface PlanInput {
  program: Program
  /** 'YYYY-MM-DD' */
  today: string
  /** Date onboarding finished; week 0 starts here. */
  programStart: string
  /** 0 = Sunday .. 6 = Saturday */
  trainDays: number[]
  states: EngineLadderState[]
  /** Past sessions, ascending by date. */
  sessions: EngineSessionRecord[]
  events: EngineEvent[]
  checkin?: CheckinInput
  screening?: ScreeningFlags
  gatesPassed?: string[]
  /** Active reactive-deload window end date, if any. */
  deloadUntil?: string
  /** True when a HARD_STOP happened and has not been acknowledged. */
  hardStopPending?: boolean
  /** User explicitly asked for the short version today. */
  wantMinimum?: boolean
}

export type ExerciseMode =
  /** State level; results count toward progression. */
  | 'normal'
  /** Temporary level for today (soreness); state unchanged afterwards. */
  | 'today_only'
  /** Retest after a layoff: clean → original level restored, otherwise stays down. */
  | 'retest'
  /** Level change persists after the session (long layoff). */
  | 'persist'
  /** Week-0 find-your-level: state written from the level actually achieved. */
  | 'assess'

export interface PlannedExercise {
  ladderId: PatternId
  level: Level
  /** Level held in state before today's modifiers. */
  baseLevelId: string
  mode: ExerciseMode
  sets: number
  target: number
  unit: 'reps' | 'sec'
  perSide: boolean
  restSec: number
  /** Ladder-specific note shown on the card (e.g. fists, incline lock). */
  note?: string
}

export interface PlanOutput {
  kind: SessionKind | 'blocked' | 'done'
  weekIndex: number
  exercises: PlannedExercise[]
  /** Whether PROGRESS_UP may fire from today's results. */
  progressionAllowed: boolean
  rpeCeiling: number
  setsPerExercise: number
  rulesFired: RuleName[]
  /** One sentence. */
  explanation: string
  /** Newly opened deload window (caller persists it). */
  deloadUntil?: string
  /** Caller should prompt a re-screen (long layoff). */
  rescreen: boolean
}

export interface ApplyInput {
  program: Program
  date: string
  states: EngineLadderState[]
  plan: PlanOutput
  results: EngineSetResult[]
  formBreak?: boolean
  painPatterns?: PatternId[]
}

export interface ApplyOutput {
  states: EngineLadderState[]
  events: EngineEvent[]
  /** One line per ladder that changed, in non-judgmental language. */
  messages: string[]
}

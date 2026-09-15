// Dexie table row types. No exercise/program content or adaptive-engine
// logic lives here — this is pure data shape for local-first storage.

import type { PatternId } from '../data/types'
import type { PlanOutput } from '../engine/types'

export type Sex = 'male' | 'female' | 'other'

export interface TrainSlot {
  /** 0 = Sunday .. 6 = Saturday */
  day: number
  /** 'HH:MM' */
  time: string
  place: string
}

export interface Profile {
  id: 'me'
  name: string
  sex: Sex
  birthYear: number
  heightCm: number
  startWeightKg: number
  /** 0 = Sunday .. 6 = Saturday */
  trainDays: number[]
  sessionMinutes: number
  trainTime: string
  constraints: string[]
  notes: string
  createdAt: string
  onboardedAt?: string
  /** If-then training slots (day + time + place); trainDays is derived from these. */
  slots?: TrainSlot[]
  /** PAR-Q+ and app screening answers keyed by question id (q1..q11). */
  screening?: Record<string, boolean>
  /** One-time gates the user has confirmed (e.g. 'table_sit_test'). */
  gatesPassed?: string[]
  goalWeightKg?: number
  /** Baseline daily steps measured in week 0, if entered. */
  stepBaseline?: number
}

export interface Checkin {
  id?: number
  /** 'YYYY-MM-DD', unique */
  date: string
  sleepHours: number
  sleepQuality: 1 | 2 | 3 | 4 | 5
  mood: 1 | 2 | 3 | 4 | 5
  soreness: 1 | 2 | 3 | 4 | 5
  weightKg?: number
  note?: string
  /** Patterns the user tagged as sore (optional). */
  soreAreas?: PatternId[]
}

export type PlannedKind = 'train' | 'rest' | 'assessment' | 'minimum'
export type SessionStatus = 'planned' | 'done' | 'partial' | 'skipped'

export interface Session {
  id?: number
  date: string
  plannedKind: PlannedKind
  status: SessionStatus
  startedAt?: string
  endedAt?: string
  rpe?: number
  note?: string
  adaptationNote?: string
  /** The engine plan this session was started from (frozen for applySession). */
  planSnapshot?: PlanOutput
  formBreak?: boolean
  painPatterns?: PatternId[]
  /** Soreness reported at that day's check-in (1–5). */
  soreness?: number
  rulesFired?: string[]
}

export type SetOutcome = 'clean' | 'short' | 'fail' | 'too_easy'

export interface SetLog {
  id?: number
  sessionId: number
  ladderId: string
  levelId: string
  setIndex: number
  targetReps: number
  doneReps: number
  holdSeconds?: number
  outcome: SetOutcome
  ts: string
}

export interface LadderHistoryEntry {
  date: string
  levelId: string
  reason: string
}

export interface LadderState {
  ladderId: string
  currentLevelId: string
  /** Current rep (or hold-seconds) target inside the level's range. */
  repTarget: number
  cleanStreak: number
  failStreak: number
  updatedAt: string
  history: LadderHistoryEntry[]
}

export interface BodyMetrics {
  id?: number
  date: string
  waistCm?: number
  hipCm?: number
  chestCm?: number
  armCm?: number
}

export type PhotoView = 'front' | 'side'

export interface Photo {
  id?: number
  date: string
  view: PhotoView
  blob: Blob
}

export interface Habit {
  id?: number
  date: string
  key: string
  done: boolean
}

export interface Setting {
  key: string
  value: unknown
}

export interface AppEvent {
  id?: number
  ts: string
  type: string
  payload: unknown
}

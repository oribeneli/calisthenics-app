// Dexie table row types. No exercise/program content or adaptive-engine
// logic lives here — this is pure data shape for local-first storage.

export type Sex = 'male' | 'female' | 'other'

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
}

export type PlannedKind = 'train' | 'rest' | 'assessment'
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

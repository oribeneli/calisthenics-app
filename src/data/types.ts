// Program data schema. program.json must satisfy `Program`; src/data/program.test.ts
// checks the structural invariants (no ladder bottoms out, no cycles, every level has rules).

export type PatternId = 'push' | 'pull' | 'squat' | 'hinge' | 'core'

export const PATTERN_IDS: PatternId[] = ['push', 'pull', 'squat', 'hinge', 'core']

export interface RepScheme {
  /** Working sets at full volume (the engine scales this by week and readiness). */
  sets: number
  /** Rep range [min, max]. Exactly one of reps / holdSec is set. */
  reps?: [number, number]
  /** Hold range in seconds [min, max]. */
  holdSec?: [number, number]
  /** True when the count is per side (left and right). */
  perSide?: boolean
  restSec: number
}

export interface Level {
  /** Stable id, e.g. "push.wall_serratus_press". Never renumber. */
  id: string
  name: string
  /** One-paragraph setup / description shown on the exercise card. */
  setup: string
  /** 2–3 short form cues. */
  cues: string[]
  /** 2 common faults. */
  faults: string[]
  scheme: RepScheme
  /** Human-readable advance rule (the engine applies the generic rule; this explains it). */
  advance: string
  /** Human-readable regress rule. */
  regress: string
  /** 0 = no wrist load, 1 = neutral/elevated/fists ok, 2 = full extension on the floor. */
  wristLoad: 0 | 1 | 2
  /** 0 = control work, 1 = moderate, 2 = end-range risk for a hypermobile shoulder. */
  shoulderRisk: 0 | 1 | 2
  /** Hidden from auto-progression until this program week (1-based). */
  hiddenUntilWeek?: number
  /** Requires a one-time user confirmation before it can be assigned (e.g. table sit test). */
  gate?: { key: string; label: string }
}

export interface Ladder {
  id: PatternId
  name: string
  /** Why this ladder is built the way it is (plain language, shown on the Program page). */
  rationale: string
  levels: Level[]
  /** Week-0 assessment never places the user above this 1-based level index. */
  assessmentCap: number
  /** Pattern-specific regression triggers, plain language. */
  specialRegress: string[]
  /** Honest ceiling note, if the ladder tops out without equipment. */
  ceilingNote?: string
}

export interface RoutineStep {
  id: string
  name: string
  cue: string
  durationSec: number
}

export interface RuleParams {
  advanceCleanSessions: number
  regressFailSessions: number
  regressShortFraction: number
  tooHardSetsForFail: number
  sleepLowHours: number
  sleepMidHours: number
  sleepQualityLow: number
  sorenessHigh: number
  sorenessPersistSessions: number
  moodLow: number
  deloadRegressEventsWindowDays: number
  deloadRegressEvents: number
  deloadFormBreakSessions: number
  deloadSetFactor: number
  missWeekDays: number
  missTwoWeeksDays: number
  missFourWeeksDays: number
}

export interface Program {
  version: string
  ladders: Ladder[]
  warmup: RoutineStep[]
  cooldown: RoutineStep[]
  restDayMobility: RoutineStep[]
  /** Sets per exercise by program week (1-based, ascending weekFrom). */
  volumeRamp: { weekFrom: number; sets: number }[]
  /** RPE ceiling by program week. */
  rpeCeiling: { weekFrom: number; rpe: number }[]
  rules: RuleParams
  habits: { key: string; label: string; why: string }[]
  screening: {
    id: string
    text: string
    /** hard = see a doctor first, no skip · soft = recommend clearance · advisory = show note · adapt = changes program defaults */
    gate: 'hard' | 'soft' | 'advisory' | 'adapt'
    note?: string
  }[]
}

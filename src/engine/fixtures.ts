import type { Ladder, Level, PatternId, Program } from '../data/types'

function lvl(id: string, i: number, hold = false, extra: Partial<Level> = {}): Level {
  return {
    id,
    name: id,
    setup: 'setup',
    cues: ['cue a', 'cue b'],
    faults: ['fault a', 'fault b'],
    scheme: hold
      ? { sets: 3, holdSec: [20, 30], restSec: 60 }
      : { sets: 3, reps: [8, 12], restSec: 60 },
    advance: 'advance',
    regress: 'regress',
    wristLoad: i === 0 ? 0 : 1,
    shoulderRisk: i === 0 ? 0 : 1,
    ...extra,
  }
}

function ladder(id: PatternId, n: number, opts: { hold?: boolean; cap?: number } = {}): Ladder {
  const levels: Level[] = []
  for (let i = 0; i < n; i++) levels.push(lvl(`${id}.l${i + 1}`, i, opts.hold))
  return {
    id,
    name: id,
    rationale: 'because',
    levels,
    assessmentCap: opts.cap ?? 3,
    specialRegress: [],
  }
}

export function fixtureProgram(): Program {
  const push = ladder('push', 8)
  push.levels[6].hiddenUntilWeek = 9
  const pull = ladder('pull', 6)
  pull.levels[4].gate = { key: 'table_sit_test', label: 'sit test' }
  return {
    version: 'test',
    ladders: [push, pull, ladder('squat', 6), ladder('hinge', 6), ladder('core', 6, { hold: true })],
    warmup: [{ id: 'w1', name: 'march', cue: 'go', durationSec: 60 }],
    cooldown: [{ id: 'c1', name: 'walk', cue: 'go', durationSec: 60 }],
    restDayMobility: [{ id: 'm1', name: 'cat-cow', cue: 'go', durationSec: 60 }],
    volumeRamp: [
      { weekFrom: 0, sets: 1 },
      { weekFrom: 2, sets: 2 },
      { weekFrom: 4, sets: 3 },
    ],
    rpeCeiling: [
      { weekFrom: 0, rpe: 6 },
      { weekFrom: 3, rpe: 7 },
      { weekFrom: 9, rpe: 8 },
    ],
    rules: {
      advanceCleanSessions: 2,
      regressFailSessions: 2,
      regressShortFraction: 0.7,
      tooHardSetsForFail: 2,
      sleepLowHours: 6,
      sleepMidHours: 7,
      sleepQualityLow: 2,
      sorenessHigh: 4,
      sorenessPersistSessions: 3,
      moodLow: 2,
      deloadRegressEventsWindowDays: 21,
      deloadRegressEvents: 2,
      deloadFormBreakSessions: 3,
      deloadSetFactor: 0.5,
      missWeekDays: 7,
      missTwoWeeksDays: 14,
      missFourWeeksDays: 28,
    },
    habits: [],
    screening: [],
  }
}

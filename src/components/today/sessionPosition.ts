// Pure helper: derive "where are we in the session" from the plan's exercise
// list and the set logs recorded so far. setLogs are the source of truth so a
// page reload resumes at the right exercise/set without any extra bookkeeping.

import type { SetOutcome } from '../../db/types'

export interface SessionExercise {
  ladderId: string
  /** Sets required to finish a normal (non-assessment) exercise. */
  sets: number
  /** True for week-0 "find your level" exercises, which don't have a fixed set count. */
  assess?: boolean
  /** Assessment only: max attempts before the pattern is considered done. */
  maxAttempts?: number
}

export interface SessionSetLog {
  ladderId: string
  outcome: SetOutcome
}

export interface SessionPosition {
  /** Index into the exercises array; equals exercises.length once the session is complete. */
  exerciseIndex: number
  /** 1-based set (or assessment attempt) number within the current exercise. 0 once complete. */
  setNumber: number
  /** True once every exercise has enough logged sets (or its assessment has concluded). */
  complete: boolean
}

const ASSESS_STOP_OUTCOMES: SetOutcome[] = ['short', 'fail']

/** Whether `ex` has all the sets (or assessment attempts) it needs, given its logs. */
function isExerciseComplete(ex: SessionExercise, logsForEx: SessionSetLog[]): boolean {
  if (!ex.assess) return logsForEx.length >= ex.sets
  const last = logsForEx[logsForEx.length - 1]
  const stoppedNaturally = last !== undefined && ASSESS_STOP_OUTCOMES.includes(last.outcome)
  const capReached = ex.maxAttempts !== undefined && logsForEx.length >= ex.maxAttempts
  return stoppedNaturally || capReached
}

/**
 * Derives the current exercise/set position for a session from its logs.
 * Exercises are always attempted in order, so once any later exercise has a
 * log, every exercise before it must already be settled — even an
 * assessment pattern the user locked in via "that's my level" without an
 * extra log of its own. That keeps a remount from regressing to an earlier
 * pattern just because its own logs alone still look "undecided".
 */
export function deriveSessionPosition(exercises: SessionExercise[], logs: SessionSetLog[]): SessionPosition {
  let lastTouched = -1
  for (let i = 0; i < exercises.length; i++) {
    if (logs.some((l) => l.ladderId === exercises[i].ladderId)) lastTouched = i
  }
  if (lastTouched === -1) {
    return exercises.length === 0
      ? { exerciseIndex: 0, setNumber: 0, complete: true }
      : { exerciseIndex: 0, setNumber: 1, complete: false }
  }

  const ex = exercises[lastTouched]
  const logsForEx = logs.filter((l) => l.ladderId === ex.ladderId)
  if (!isExerciseComplete(ex, logsForEx)) {
    return { exerciseIndex: lastTouched, setNumber: logsForEx.length + 1, complete: false }
  }
  const next = lastTouched + 1
  return next >= exercises.length
    ? { exerciseIndex: exercises.length, setNumber: 0, complete: true }
    : { exerciseIndex: next, setNumber: 1, complete: false }
}

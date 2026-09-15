import { describe, expect, it } from 'vitest'
import { deriveSessionPosition, type SessionExercise, type SessionSetLog } from './sessionPosition'

const fixed = (ladderId: string, sets: number): SessionExercise => ({ ladderId, sets })
const assess = (ladderId: string, maxAttempts: number): SessionExercise => ({ ladderId, sets: 0, assess: true, maxAttempts })
const log = (ladderId: string, outcome: SessionSetLog['outcome']): SessionSetLog => ({ ladderId, outcome })

describe('deriveSessionPosition', () => {
  it('starts at the first exercise, set 1, with no logs', () => {
    const exercises = [fixed('push', 2), fixed('pull', 2)]
    expect(deriveSessionPosition(exercises, [])).toEqual({ exerciseIndex: 0, setNumber: 1, complete: false })
  })

  it('advances to set 2 after one logged set', () => {
    const exercises = [fixed('push', 2), fixed('pull', 2)]
    expect(deriveSessionPosition(exercises, [log('push', 'clean')])).toEqual({
      exerciseIndex: 0,
      setNumber: 2,
      complete: false,
    })
  })

  it('moves to the next exercise once the current one has enough sets, regardless of outcome', () => {
    const exercises = [fixed('push', 2), fixed('pull', 2)]
    const logs = [log('push', 'clean'), log('push', 'short')]
    expect(deriveSessionPosition(exercises, logs)).toEqual({ exerciseIndex: 1, setNumber: 1, complete: false })
  })

  it('is complete once every exercise has its sets logged', () => {
    const exercises = [fixed('push', 1), fixed('pull', 1)]
    const logs = [log('push', 'clean'), log('pull', 'clean')]
    expect(deriveSessionPosition(exercises, logs)).toEqual({ exerciseIndex: 2, setNumber: 0, complete: true })
  })

  it('assessment: stays on the pattern after a clean attempt (awaiting the next-level decision)', () => {
    const exercises = [assess('push', 3)]
    expect(deriveSessionPosition(exercises, [log('push', 'clean')])).toEqual({
      exerciseIndex: 0,
      setNumber: 2,
      complete: false,
    })
  })

  it('assessment: moves on once an attempt comes back short', () => {
    const exercises = [assess('push', 3), fixed('pull', 1)]
    const logs = [log('push', 'clean'), log('push', 'short')]
    expect(deriveSessionPosition(exercises, logs)).toEqual({ exerciseIndex: 1, setNumber: 1, complete: false })
  })

  it('assessment: stops once the attempt cap is reached even on a clean set', () => {
    const exercises = [assess('push', 2), fixed('pull', 1)]
    const logs = [log('push', 'clean'), log('push', 'too_easy')]
    expect(deriveSessionPosition(exercises, logs)).toEqual({ exerciseIndex: 1, setNumber: 1, complete: false })
  })

  it('assessment: does not regress to an earlier pattern "locked in" without a log once a later one has logs', () => {
    // push was left at a clean, undecided attempt (the user tapped "that's my level",
    // which logs nothing) before moving on to pull — a remount must resume at pull.
    const exercises = [assess('push', 3), assess('pull', 4), fixed('squat', 1)]
    const logs = [log('push', 'clean'), log('pull', 'short')]
    expect(deriveSessionPosition(exercises, logs)).toEqual({ exerciseIndex: 2, setNumber: 1, complete: false })
  })
})

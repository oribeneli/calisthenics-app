import type { RepScheme } from '../../data/types'

/** "3 x 8-12 reps" / "2 x 15-25s hold" / "3 x 6-8 reps, per side". */
export function formatScheme(scheme: RepScheme): string {
  const range = scheme.reps
    ? `${scheme.reps[0]}-${scheme.reps[1]} reps`
    : `${scheme.holdSec![0]}-${scheme.holdSec![1]}s hold`
  const perSide = scheme.perSide ? ', per side' : ''
  return `${scheme.sets} x ${range}${perSide}`
}

/** The bottom of a level's range, used as the initial rep target when a level is assigned. */
export function schemeFloor(scheme: RepScheme): number {
  return scheme.reps ? scheme.reps[0] : scheme.holdSec![0]
}

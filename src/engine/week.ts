import type { Program } from '../data/types'
import { diffDays } from './dates'

/** Program week, 0-based. Week 0 is the onboarding / assessment week. */
export function weekIndexOf(programStart: string, today: string): number {
  const days = diffDays(programStart, today)
  return days < 0 ? 0 : Math.floor(days / 7)
}

export function setsForWeek(program: Program, weekIndex: number): number {
  let sets = program.volumeRamp[0]?.sets ?? 1
  for (const step of program.volumeRamp) if (weekIndex >= step.weekFrom) sets = step.sets
  return sets
}

export function rpeForWeek(program: Program, weekIndex: number): number {
  let rpe = program.rpeCeiling[0]?.rpe ?? 6
  for (const step of program.rpeCeiling) if (weekIndex >= step.weekFrom) rpe = step.rpe
  return rpe
}

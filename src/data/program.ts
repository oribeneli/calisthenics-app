import programJson from './program.json'
import type { Ladder, Level, PatternId, Program } from './types'

export const program = programJson as Program

/** Options that gate progression availability. */
export interface ProgressionOptions {
  /** Current 1-based program week. */
  week: number
  /** Gate keys the user has confirmed (e.g. "table_sit_test"). */
  gatesPassed: string[]
}

export function getLadder(ladderId: PatternId): Ladder {
  const ladder = program.ladders.find((l) => l.id === ladderId)
  if (!ladder) throw new Error(`Unknown ladder: ${ladderId}`)
  return ladder
}

export function getLevel(ladderId: PatternId, levelId: string): Level {
  const ladder = getLadder(ladderId)
  const level = ladder.levels.find((l) => l.id === levelId)
  if (!level) throw new Error(`Unknown level "${levelId}" in ladder "${ladderId}"`)
  return level
}

/** 0-based index of a level within its ladder. */
export function levelIndex(ladderId: PatternId, levelId: string): number {
  const ladder = getLadder(ladderId)
  const index = ladder.levels.findIndex((l) => l.id === levelId)
  if (index === -1) throw new Error(`Unknown level "${levelId}" in ladder "${ladderId}"`)
  return index
}

/** Level at a 0-based index, clamped to the ladder's bounds. */
export function levelAt(ladderId: PatternId, index: number): Level {
  const ladder = getLadder(ladderId)
  const clamped = Math.min(Math.max(index, 0), ladder.levels.length - 1)
  return ladder.levels[clamped]
}

function isAvailable(level: Level, options: ProgressionOptions): boolean {
  if (level.hiddenUntilWeek !== undefined && options.week < level.hiddenUntilWeek) return false
  if (level.gate && !options.gatesPassed.includes(level.gate.key)) return false
  return true
}

/**
 * The next level up the ladder, or null at the top, or null if the next
 * level is hidden (before its `hiddenUntilWeek`) or gated (gate key not in
 * `gatesPassed`).
 */
export function nextLevel(ladderId: PatternId, levelId: string, options: ProgressionOptions): Level | null {
  const ladder = getLadder(ladderId)
  const index = levelIndex(ladderId, levelId)
  if (index >= ladder.levels.length - 1) return null
  const candidate = ladder.levels[index + 1]
  return isAvailable(candidate, options) ? candidate : null
}

/** The level below, or null at level 1 (never bottoms out). */
export function prevLevel(ladderId: PatternId, levelId: string): Level | null {
  const index = levelIndex(ladderId, levelId)
  if (index <= 0) return null
  const ladder = getLadder(ladderId)
  return ladder.levels[index - 1]
}

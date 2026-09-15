import type { Ladder, Level, PatternId, Program } from '../data/types'

export function ladderOf(program: Program, id: PatternId): Ladder {
  const l = program.ladders.find((x) => x.id === id)
  if (!l) throw new Error(`unknown ladder ${id}`)
  return l
}

export function indexOfLevel(ladder: Ladder, levelId: string): number {
  const i = ladder.levels.findIndex((l) => l.id === levelId)
  if (i < 0) throw new Error(`unknown level ${levelId} in ${ladder.id}`)
  return i
}

export function levelAt(ladder: Ladder, index: number): Level {
  const i = Math.min(Math.max(index, 0), ladder.levels.length - 1)
  return ladder.levels[i]
}

export interface NextOpts {
  weekIndex: number
  gatesPassed: string[]
}

/** Next level, or null at the top or when the next level is hidden / gated. */
export function nextLevel(ladder: Ladder, levelId: string, opts: NextOpts): Level | null {
  const i = indexOfLevel(ladder, levelId)
  const next = ladder.levels[i + 1]
  if (!next) return null
  if (next.hiddenUntilWeek !== undefined && opts.weekIndex + 1 < next.hiddenUntilWeek) return null
  if (next.gate && !opts.gatesPassed.includes(next.gate.key)) return null
  return next
}

/** Previous level, or null at level 1 (a ladder never bottoms out). */
export function prevLevel(ladder: Ladder, levelId: string): Level | null {
  const i = indexOfLevel(ladder, levelId)
  return i > 0 ? ladder.levels[i - 1] : null
}

export function minTarget(level: Level): number {
  return level.scheme.reps ? level.scheme.reps[0] : level.scheme.holdSec![0]
}

export function maxTarget(level: Level): number {
  return level.scheme.reps ? level.scheme.reps[1] : level.scheme.holdSec![1]
}

/** Rep-target step inside a level: +2 reps (or +1 for narrow ranges), +5 s for holds. */
export function targetStep(level: Level): number {
  if (level.scheme.holdSec) return 5
  const [lo, hi] = level.scheme.reps!
  return hi - lo < 4 ? 1 : 2
}

export function unitOf(level: Level): 'reps' | 'sec' {
  return level.scheme.holdSec ? 'sec' : 'reps'
}

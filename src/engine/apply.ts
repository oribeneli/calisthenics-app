import type { Ladder, Level, PatternId } from '../data/types'
import { indexOfLevel, ladderOf, maxTarget, minTarget, nextLevel, prevLevel, targetStep } from './ladders'
import type { ApplyInput, ApplyOutput, EngineEvent, EngineLadderState, EngineSetResult, PlannedExercise } from './types'

export function freshState(ladderId: PatternId, level: Level): EngineLadderState {
  return { ladderId, levelId: level.id, repTarget: minTarget(level), cleanStreak: 0, failStreak: 0 }
}

type SessionVerdict = 'clean_max' | 'clean' | 'partial' | 'fail'

/** Classify one ladder's sets for the session. */
export function classifySets(
  sets: EngineSetResult[],
  target: number,
  atMax: boolean,
  shortFraction: number,
  tooHardSetsForFail: number,
): SessionVerdict {
  if (sets.length === 0) return 'partial'
  const tooHard = sets.filter((s) => s.outcome === 'fail').length
  if (tooHard >= tooHardSetsForFail) return 'fail'
  const totalTarget = target * sets.length
  const totalDone = sets.reduce((a, s) => a + Math.min(s.done, s.target), 0)
  if (totalDone < shortFraction * totalTarget) return 'fail'
  const allHit = sets.every((s) => s.done >= target || s.outcome === 'too_easy')
  if (!allHit) return 'partial'
  const anyTooEasy = sets.some((s) => s.outcome === 'too_easy')
  return atMax || anyTooEasy ? 'clean_max' : 'clean'
}

function levelName(l: Level): string {
  return l.name
}

function applyOne(
  input: ApplyInput,
  ladder: Ladder,
  ex: PlannedExercise,
  state: EngineLadderState | undefined,
  sets: EngineSetResult[],
  events: EngineEvent[],
  messages: string[],
  gatesPassed: string[],
): EngineLadderState | undefined {
  const r = input.program.rules
  const date = input.date
  const pain = input.painPatterns?.includes(ex.ladderId) === true

  if (ex.mode === 'assess') {
    // Highest level attempted with a clean set wins; nothing clean → level 1.
    let best: Level = ladder.levels[0]
    for (const s of sets) {
      if (s.outcome !== 'clean' && s.outcome !== 'too_easy') continue
      const lvl = ladder.levels.find((l) => l.id === s.levelId)
      if (lvl && indexOfLevel(ladder, lvl.id) > indexOfLevel(ladder, best.id)) best = lvl
    }
    const capped = ladder.levels[Math.min(indexOfLevel(ladder, best.id), ladder.assessmentCap - 1)]
    messages.push(`${ladder.name}: starting at level ${indexOfLevel(ladder, capped.id) + 1}, ${levelName(capped)}`)
    return freshState(ex.ladderId, capped)
  }

  if (!state) return state
  if (sets.length === 0 && !pain) return state

  const performed = ex.level
  const atMax = ex.target >= maxTarget(performed)
  const verdict = pain ? 'fail' : classifySets(sets, ex.target, atMax, r.regressShortFraction, r.tooHardSetsForFail)

  if (ex.mode === 'today_only') return state

  if (ex.mode === 'retest') {
    if (verdict === 'clean' || verdict === 'clean_max') {
      const original = ladder.levels[indexOfLevel(ladder, ex.baseLevelId)]
      messages.push(`${ladder.name}: level ${indexOfLevel(ladder, original.id) + 1} is back`)
      return { ...freshState(ex.ladderId, original) }
    }
    messages.push(`${ladder.name}: continuing at level ${indexOfLevel(ladder, performed.id) + 1} for now`)
    return freshState(ex.ladderId, performed)
  }

  if (ex.mode === 'persist') {
    messages.push(`${ladder.name}: rebuilding from level ${indexOfLevel(ladder, performed.id) + 1}`)
    return freshState(ex.ladderId, performed)
  }

  // mode === 'normal'
  const next: EngineLadderState = { ...state }
  const immediateRegress = pain || sets.filter((s) => s.outcome === 'fail').length >= r.tooHardSetsForFail

  if (verdict === 'fail') {
    next.cleanStreak = 0
    next.failStreak = immediateRegress ? r.regressFailSessions : state.failStreak + 1
    if (next.failStreak >= r.regressFailSessions) {
      const down = prevLevel(ladder, state.levelId)
      if (down) {
        events.push({ date, type: 'REGRESS_LEVEL', ladderId: ex.ladderId, detail: pain ? 'pain' : immediateRegress ? 'too hard' : 'below target twice' })
        messages.push(`${ladder.name}: found your level — ${levelName(down)} (level ${indexOfLevel(ladder, down.id) + 1}) is the right place to build from`)
        return freshState(ex.ladderId, down)
      }
      messages.push(`${ladder.name}: staying on level 1 with a lower target; that is the floor and it is a fine place to be`)
      return { ...freshState(ex.ladderId, performed), failStreak: 0 }
    }
    messages.push(`${ladder.name}: logged as done at ${sets.reduce((a, s) => a + s.done, 0)} of ${ex.target * sets.length}`)
    return next
  }

  next.failStreak = 0
  if (verdict === 'partial') {
    next.cleanStreak = 0
    return next
  }

  if (input.formBreak) {
    events.push({ date, type: 'PROGRESS_HOLD', ladderId: ex.ladderId })
    next.cleanStreak = 0
    return next
  }

  if (!input.plan.progressionAllowed) return next

  if (verdict === 'clean') {
    const step = targetStep(performed)
    next.repTarget = Math.min(maxTarget(performed), ex.target + step)
    next.cleanStreak = 0
    events.push({ date, type: 'REP_TARGET_UP', ladderId: ex.ladderId, detail: String(next.repTarget) })
    messages.push(`${ladder.name}: next time ${next.repTarget}${ex.unit === 'sec' ? ' s' : ' reps'}`)
    return next
  }

  // clean_max
  next.repTarget = maxTarget(performed)
  next.cleanStreak = state.cleanStreak + 1
  if (next.cleanStreak >= r.advanceCleanSessions) {
    const up = nextLevel(ladder, state.levelId, { weekIndex: input.plan.weekIndex, gatesPassed })
    if (up) {
      events.push({ date, type: 'PROGRESS_UP', ladderId: ex.ladderId, detail: up.id })
      messages.push(`${ladder.name}: level up — ${levelName(up)} (level ${indexOfLevel(ladder, up.id) + 1})`)
      return freshState(ex.ladderId, up)
    }
    events.push({ date, type: 'PROGRESS_HOLD', ladderId: ex.ladderId, detail: 'top or locked' })
    messages.push(`${ladder.name}: holding at the top of this ladder for now`)
    next.cleanStreak = r.advanceCleanSessions
    return next
  }
  messages.push(`${ladder.name}: one more clean session at ${next.repTarget} and you move up`)
  return next
}

export function applySession(input: ApplyInput, gatesPassed: string[] = []): ApplyOutput {
  const events: EngineEvent[] = []
  const messages: string[] = []
  const states: EngineLadderState[] = []
  for (const ex of input.plan.exercises) {
    const ladder = ladderOf(input.program, ex.ladderId)
    const state = input.states.find((s) => s.ladderId === ex.ladderId)
    const sets = input.results.filter((s) => s.ladderId === ex.ladderId)
    const updated = applyOne(input, ladder, ex, state, sets, events, messages, gatesPassed)
    if (updated) states.push(updated)
  }
  // Ladders not in the plan keep their state untouched.
  for (const s of input.states) if (!states.some((x) => x.ladderId === s.ladderId)) states.push(s)
  return { states, events, messages }
}

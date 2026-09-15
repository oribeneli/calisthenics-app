import { describe, expect, it } from 'vitest'
import { levelAt, nextLevel, prevLevel, program } from './program'
import type { Ladder } from './types'

describe('program.json structure', () => {
  it('has every ladder with at least 8 levels', () => {
    for (const ladder of program.ladders) {
      expect(ladder.levels.length, ladder.id).toBeGreaterThanOrEqual(8)
    }
  })

  it('gives level 1 of every ladder wristLoad 0 and shoulderRisk 0', () => {
    for (const ladder of program.ladders) {
      const level1 = ladder.levels[0]
      expect(level1.wristLoad, `${ladder.id} level 1 wristLoad`).toBe(0)
      expect(level1.shoulderRisk, `${ladder.id} level 1 shoulderRisk`).toBe(0)
    }
  })

  it('has unique ids across all ladders, each prefixed with its ladder id', () => {
    const allIds = program.ladders.flatMap((l) => l.levels.map((lvl) => lvl.id))
    expect(new Set(allIds).size).toBe(allIds.length)
    for (const ladder of program.ladders) {
      for (const level of ladder.levels) {
        expect(level.id.startsWith(`${ladder.id}.`)).toBe(true)
      }
    }
  })

  it('gives every level non-empty advance and regress text', () => {
    for (const ladder of program.ladders) {
      for (const level of ladder.levels) {
        expect(level.advance.length, level.id).toBeGreaterThan(0)
        expect(level.regress.length, level.id).toBeGreaterThan(0)
      }
    }
  })

  it('gives every level 2-3 cues and exactly 2 faults', () => {
    for (const ladder of program.ladders) {
      for (const level of ladder.levels) {
        expect(level.cues.length, level.id).toBeGreaterThanOrEqual(2)
        expect(level.cues.length, level.id).toBeLessThanOrEqual(3)
        expect(level.faults.length, level.id).toBe(2)
      }
    }
  })

  it('sets exactly one of reps/holdSec per level, with min <= max', () => {
    for (const ladder of program.ladders) {
      for (const level of ladder.levels) {
        const { reps, holdSec } = level.scheme
        const hasReps = reps !== undefined
        const hasHold = holdSec !== undefined
        expect(hasReps !== hasHold, level.id).toBe(true)
        if (reps) expect(reps[0], level.id).toBeLessThanOrEqual(reps[1])
        if (holdSec) expect(holdSec[0], level.id).toBeLessThanOrEqual(holdSec[1])
      }
    }
  })

  it('gives every level sets >= 1 and restSec >= 30', () => {
    for (const ladder of program.ladders) {
      for (const level of ladder.levels) {
        expect(level.scheme.sets, level.id).toBeGreaterThanOrEqual(1)
        expect(level.scheme.restSec, level.id).toBeGreaterThanOrEqual(30)
      }
    }
  })

  it('caps assessmentCap at or below the ladder length', () => {
    for (const ladder of program.ladders) {
      expect(ladder.assessmentCap, ladder.id).toBeLessThanOrEqual(ladder.levels.length)
    }
  })

  it('has volumeRamp and rpeCeiling weekFrom values in ascending order', () => {
    const weekFroms = (arr: { weekFrom: number }[]) => arr.map((x) => x.weekFrom)
    const ramp = weekFroms(program.volumeRamp)
    const ceiling = weekFroms(program.rpeCeiling)
    expect(ramp).toEqual([...ramp].sort((a, b) => a - b))
    expect(ceiling).toEqual([...ceiling].sort((a, b) => a - b))
  })

  it('has exactly 6 habits', () => {
    expect(program.habits.length).toBe(6)
  })

  it('has 11 screening items with 4 hard gates', () => {
    expect(program.screening.length).toBe(11)
    expect(program.screening.filter((s) => s.gate === 'hard').length).toBe(4)
  })
})

describe('prevLevel', () => {
  it('returns null for level 1 of every ladder (no bottoming out)', () => {
    for (const ladder of program.ladders) {
      expect(prevLevel(ladder.id, ladder.levels[0].id), ladder.id).toBeNull()
    }
  })

  it('returns level 1 from level 2', () => {
    for (const ladder of program.ladders) {
      if (ladder.levels.length < 2) continue
      const prev = prevLevel(ladder.id, ladder.levels[1].id)
      expect(prev?.id, ladder.id).toBe(ladder.levels[0].id)
    }
  })
})

describe('nextLevel', () => {
  it('walks the whole ladder without repeating an id and returns null at the top', () => {
    for (const ladder of program.ladders) {
      const gatesPassed = ladder.levels
        .filter((l) => l.gate)
        .map((l) => l.gate!.key)
      const seen: string[] = []
      let current: string | null = ladder.levels[0].id
      seen.push(current)
      while (true) {
        const next = nextLevel(ladder.id, current, { week: 999, gatesPassed })
        if (next === null) break
        expect(seen.includes(next.id), `${ladder.id} cycled back to ${next.id}`).toBe(false)
        seen.push(next.id)
        current = next.id
      }
      expect(seen).toEqual(ladder.levels.map((l) => l.id))
    }
  })

  it('does not return a hidden level before its week', () => {
    const hiddenCase = findHiddenCase(program.ladders)
    expect(hiddenCase, 'expected at least one hidden level for this test to be meaningful').toBeTruthy()
    if (!hiddenCase) return
    const { ladder, before, hidden } = hiddenCase
    const result = nextLevel(ladder.id, before.id, {
      week: hidden.hiddenUntilWeek! - 1,
      gatesPassed: [],
    })
    expect(result).toBeNull()
  })

  it('does not return a gated level until the gate key is in gatesPassed', () => {
    const gatedCase = findGatedCase(program.ladders)
    expect(gatedCase, 'expected at least one gated level for this test to be meaningful').toBeTruthy()
    if (!gatedCase) return
    const { ladder, before, gated } = gatedCase
    const blocked = nextLevel(ladder.id, before.id, { week: 999, gatesPassed: [] })
    expect(blocked).toBeNull()
    const allowed = nextLevel(ladder.id, before.id, { week: 999, gatesPassed: [gated.gate!.key] })
    expect(allowed?.id).toBe(gated.id)
  })
})

describe('levelAt', () => {
  it('clamps out-of-range indices to the ladder bounds', () => {
    for (const ladder of program.ladders) {
      expect(levelAt(ladder.id, -5).id).toBe(ladder.levels[0].id)
      expect(levelAt(ladder.id, 999).id).toBe(ladder.levels[ladder.levels.length - 1].id)
    }
  })
})

function findHiddenCase(ladders: Ladder[]) {
  for (const ladder of ladders) {
    const idx = ladder.levels.findIndex((l) => l.hiddenUntilWeek !== undefined)
    if (idx > 0) {
      return { ladder, before: ladder.levels[idx - 1], hidden: ladder.levels[idx] }
    }
  }
  return null
}

function findGatedCase(ladders: Ladder[]) {
  for (const ladder of ladders) {
    const idx = ladder.levels.findIndex((l) => l.gate)
    if (idx > 0) {
      return { ladder, before: ladder.levels[idx - 1], gated: ladder.levels[idx] }
    }
  }
  return null
}

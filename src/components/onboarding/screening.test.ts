import { describe, expect, it } from 'vitest'
import { program } from '../../data/program'
import { constraintsFromAdaptHits, screeningVerdict } from './screening'

describe('screeningVerdict', () => {
  it('is not blocked when nothing is answered YES', () => {
    const verdict = screeningVerdict({}, program.screening)
    expect(verdict.blocked).toBe(false)
    expect(verdict.hardHits).toHaveLength(0)
  })

  it('blocks Next on any hard-gate YES and echoes that question', () => {
    const verdict = screeningVerdict({ q1: true }, program.screening)
    expect(verdict.blocked).toBe(true)
    expect(verdict.hardHits.map((q) => q.id)).toEqual(['q1'])
  })

  it('un-blocks the moment a hard-gate answer flips back to No', () => {
    const withYes = screeningVerdict({ q7: true }, program.screening)
    const withNo = screeningVerdict({ q7: false }, program.screening)
    expect(withYes.blocked).toBe(true)
    expect(withNo.blocked).toBe(false)
  })

  it('collects every hard-gate hit, not just the first', () => {
    const verdict = screeningVerdict({ q1: true, q2: true, q3: true }, program.screening)
    expect(verdict.hardHits.map((q) => q.id).sort()).toEqual(['q1', 'q2', 'q3'])
  })

  it('never blocks on soft, advisory or adapt gates alone', () => {
    const verdict = screeningVerdict({ q4: true, q6: true, q8: true, q9: true, q10: true, q11: true }, program.screening)
    expect(verdict.blocked).toBe(false)
    expect(verdict.softHits.map((q) => q.id)).toEqual(expect.arrayContaining(['q4', 'q10']))
    expect(verdict.advisoryHits.map((q) => q.id)).toEqual(expect.arrayContaining(['q6', 'q11']))
    expect(verdict.adaptHits.map((q) => q.id)).toEqual(expect.arrayContaining(['q8', 'q9']))
  })
})

describe('constraintsFromAdaptHits', () => {
  it('maps the shoulder and wrist adapt questions to their profile constraint labels', () => {
    const verdict = screeningVerdict({ q8: true, q9: true }, program.screening)
    expect(constraintsFromAdaptHits(verdict.adaptHits)).toEqual(['shoulder hypermobility', 'sensitive wrists'])
  })

  it('returns an empty list when no adapt question was answered YES', () => {
    const verdict = screeningVerdict({}, program.screening)
    expect(constraintsFromAdaptHits(verdict.adaptHits)).toEqual([])
  })
})

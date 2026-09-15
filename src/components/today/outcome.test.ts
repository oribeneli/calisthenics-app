import { describe, expect, it } from 'vitest'
import { classifyOutcome } from './outcome'

describe('classifyOutcome', () => {
  it('is clean when done meets the target', () => {
    expect(classifyOutcome(10, 10)).toBe('clean')
  })

  it('is clean when done exceeds the target', () => {
    expect(classifyOutcome(12, 10)).toBe('clean')
  })

  it('is short when done falls under the target', () => {
    expect(classifyOutcome(8, 10)).toBe('short')
  })

  it('is short at zero reps done', () => {
    expect(classifyOutcome(0, 10)).toBe('short')
  })
})

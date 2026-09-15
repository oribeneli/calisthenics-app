import { describe, expect, it } from 'vitest'
import { deriveTrainDays, hasDuplicateDays } from './slots'

describe('deriveTrainDays', () => {
  it('derives trainDays from the slots, in slot order', () => {
    const slots = [
      { day: 2, time: '19:30', place: 'living room' },
      { day: 4, time: '07:00', place: 'living room' },
      { day: 6, time: '09:00', place: 'garage' },
    ]
    expect(deriveTrainDays(slots)).toEqual([2, 4, 6])
  })

  it('returns an empty array for no slots', () => {
    expect(deriveTrainDays([])).toEqual([])
  })
})

describe('hasDuplicateDays', () => {
  it('is false when every slot uses a distinct day', () => {
    const slots = [
      { day: 1, time: '19:30', place: 'living room' },
      { day: 3, time: '19:30', place: 'living room' },
      { day: 5, time: '19:30', place: 'living room' },
    ]
    expect(hasDuplicateDays(slots)).toBe(false)
  })

  it('is true when two slots share a day', () => {
    const slots = [
      { day: 1, time: '19:30', place: 'living room' },
      { day: 1, time: '07:00', place: 'gym' },
      { day: 5, time: '19:30', place: 'living room' },
    ]
    expect(hasDuplicateDays(slots)).toBe(true)
  })
})

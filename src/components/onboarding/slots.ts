// Pure slot -> trainDays derivation, kept separate from the step component so
// it is trivially unit-testable.

export interface SlotLike {
  day: number
  time: string
  place: string
}

/** trainDays is just the slots' days, in slot order. */
export function deriveTrainDays(slots: SlotLike[]): number[] {
  return slots.map((slot) => slot.day)
}

/** True when two or more slots share the same day-of-week. */
export function hasDuplicateDays(slots: SlotLike[]): boolean {
  const seen = new Set<number>()
  for (const slot of slots) {
    if (seen.has(slot.day)) return true
    seen.add(slot.day)
  }
  return false
}

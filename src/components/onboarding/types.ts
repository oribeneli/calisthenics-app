// Shared draft shape for the onboarding wizard. Pure data only — no db or
// routing here, so it can be unit-tested and reused across the step components.

import type { Sex, TrainSlot } from '../../db/types'

export interface OnboardingDraft {
  name: string
  sex: Sex
  birthYear: number
  heightCm: number
  weightKg: number
  /** Screening answers keyed by question id (q1..q11). */
  screening: Record<string, boolean>
  /** Exactly three if-then training slots. */
  slots: TrainSlot[]
}

export const DEFAULT_SLOT_TIME = '19:30'
export const DEFAULT_SLOT_PLACE = 'living room'

/** A fresh draft with sensible defaults and three distinct, spread-out slot days. */
export function defaultDraft(): OnboardingDraft {
  const startDay = new Date().getDay()
  const slotDays = [1, 3, 5].map((offset) => (startDay + offset) % 7)
  return {
    name: '',
    sex: 'male',
    birthYear: 1996,
    heightCm: 175,
    weightKg: 80,
    screening: {},
    slots: slotDays.map((day) => ({ day, time: DEFAULT_SLOT_TIME, place: DEFAULT_SLOT_PLACE })),
  }
}

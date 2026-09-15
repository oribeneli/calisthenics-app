// Pure PAR-Q+ screening logic: no gate blocks Next except a hard-gate YES.
// Kept dependency-free (just the question list) so it is trivially unit-testable.

import type { Program } from '../../data/types'

export type ScreeningQuestion = Program['screening'][number]
export type ScreeningAnswers = Record<string, boolean>

export interface ScreeningVerdict {
  hardHits: ScreeningQuestion[]
  softHits: ScreeningQuestion[]
  advisoryHits: ScreeningQuestion[]
  adaptHits: ScreeningQuestion[]
  /** True while any hard-gate question is answered YES — Next stays disabled. */
  blocked: boolean
}

/** Sorts screening answers into their gate buckets and decides whether Next is blocked. */
export function screeningVerdict(
  answers: ScreeningAnswers,
  questions: ScreeningQuestion[],
): ScreeningVerdict {
  const hits = (gate: ScreeningQuestion['gate']) =>
    questions.filter((q) => q.gate === gate && answers[q.id] === true)

  const hardHits = hits('hard')
  return {
    hardHits,
    softHits: hits('soft'),
    advisoryHits: hits('advisory'),
    adaptHits: hits('adapt'),
    blocked: hardHits.length > 0,
  }
}

// program.json only carries the long "what this changes" note for adapt-gate
// questions (e.g. "Push ladder locked at incline..."); the profile stores a
// short constraint label instead, matching src/dev/seed.ts.
const ADAPT_CONSTRAINT_LABELS: Record<string, string> = {
  q8: 'shoulder hypermobility',
  q9: 'sensitive wrists',
}

/** Builds profile.constraints from the adapt-gate questions answered YES. */
export function constraintsFromAdaptHits(adaptHits: ScreeningQuestion[]): string[] {
  return adaptHits.map((q) => ADAPT_CONSTRAINT_LABELS[q.id] ?? q.note ?? q.text)
}

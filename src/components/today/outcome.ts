// Pure helper: classify a logged set from reps/seconds done vs. the target.
// "Too hard" and "too easy" are explicit user choices (outcome 'fail' /
// 'too_easy') handled by the caller; this only covers the plain "Log set" tap.

import type { SetOutcome } from '../../db/types'

/** done >= target counts as 'clean'; otherwise it's 'short' — never "failed". */
export function classifyOutcome(done: number, target: number): Extract<SetOutcome, 'clean' | 'short'> {
  return done >= target ? 'clean' : 'short'
}

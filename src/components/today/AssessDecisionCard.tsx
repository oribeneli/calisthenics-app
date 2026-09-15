import type { Level } from '../../data/types'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { SectionLabel } from '../ui/SectionLabel'
import { StickyBottomBar } from './StickyBottomBar'

/** After a clean week-0 assessment attempt: try the next level up, or lock in this one. */
export function AssessDecisionCard({
  patternName,
  achievedLevel,
  nextLevel,
  onTryNext,
  onKeep,
}: {
  patternName: string
  achievedLevel: Level
  nextLevel: Level | null
  onTryNext: () => void
  onKeep: () => void
}) {
  return (
    <>
      <Card>
        <SectionLabel>{patternName}</SectionLabel>
        <h1 className="mt-0.5 text-xl font-semibold text-ink">How did {achievedLevel.name} feel?</h1>
        <p className="mt-2 text-sm text-body">
          If that was easy, try the next level; if it was real work, lock this one in and move on.
        </p>
      </Card>
      <StickyBottomBar>
        <div className="flex flex-col gap-2">
          {nextLevel && (
            <Button size="xl" className="w-full" onClick={onTryNext}>
              That was easy → try {nextLevel.name}
            </Button>
          )}
          <Button variant={nextLevel ? 'secondary' : 'primary'} size="xl" className="w-full" onClick={onKeep}>
            That's my level → next pattern
          </Button>
        </div>
      </StickyBottomBar>
    </>
  )
}

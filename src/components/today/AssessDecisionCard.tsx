import type { Level } from '../../data/types'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
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
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {patternName}
        </p>
        <h1 className="mt-0.5 text-xl font-semibold">{achievedLevel.name} felt easy</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          You can try the next level to see if it's a better starting point, or lock this one in and move on.
        </p>
      </Card>
      <StickyBottomBar>
        <div className="flex flex-col gap-2">
          {nextLevel && (
            <Button className="w-full" onClick={onTryNext}>
              That was easy → try {nextLevel.name}
            </Button>
          )}
          <Button variant={nextLevel ? 'secondary' : 'primary'} className="w-full" onClick={onKeep}>
            That's my level → next pattern
          </Button>
        </div>
      </StickyBottomBar>
    </>
  )
}

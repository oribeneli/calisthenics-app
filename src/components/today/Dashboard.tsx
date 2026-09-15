import type { PlanOutput } from '../../engine/types'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ExercisePreviewCard } from './ExercisePreviewCard'
import { StickyBottomBar } from './StickyBottomBar'

/** State E: a train / assessment / minimum session that hasn't been started yet. */
export function Dashboard({
  plan,
  wantMinimum,
  onToggleMinimum,
  onStart,
  starting,
}: {
  plan: PlanOutput
  wantMinimum: boolean
  onToggleMinimum: () => void
  onStart: () => void
  starting: boolean
}) {
  return (
    <>
      <header>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Week {plan.weekIndex + 1}
        </p>
        <h1 className="text-xl font-semibold">Today's session</h1>
      </header>

      <div className="mt-3 flex flex-col gap-3">
        {plan.kind === 'assessment' && (
          <Card className="border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold">Finding your level</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
              For each pattern, start at level 1 with one easy set. If it felt easy, try the next level up — you'll
              land wherever it first feels like real work.
            </p>
          </Card>
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Why today looks like this
          </p>
          <p className="mt-1 rounded-2xl border border-sky-200 bg-sky-50 p-4 text-sm text-slate-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-slate-200">
            {plan.explanation}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {plan.exercises.map((ex) => (
            <ExercisePreviewCard key={ex.ladderId} exercise={ex} />
          ))}
        </div>

        <Button variant="secondary" onClick={onToggleMinimum} aria-pressed={wantMinimum}>
          {wantMinimum ? 'Full version' : 'Short version (5 min)'}
        </Button>
      </div>

      <StickyBottomBar>
        <Button className="w-full" onClick={onStart} disabled={starting}>
          Start session
        </Button>
      </StickyBottomBar>
    </>
  )
}

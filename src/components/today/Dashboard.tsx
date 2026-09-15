import type { PlanOutput } from '../../engine/types'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ExercisePreviewCard } from './ExercisePreviewCard'
import { StickyBottomBar } from './StickyBottomBar'

const TODAY_LABEL = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })

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
        <p className="text-sm text-muted">
          Week <span className="num">{plan.weekIndex + 1}</span> · {TODAY_LABEL}
        </p>
        <h1 className="text-xl font-semibold text-ink">Today's session</h1>
      </header>

      <div className="mt-3 flex flex-col gap-3">
        {plan.kind === 'assessment' && (
          <Card variant="inset">
            <h2 className="text-sm font-semibold text-ink">Finding your level</h2>
            <p className="mt-1 text-sm text-body">
              For each pattern, start at level 1 with one easy set. If it felt easy, try the next level up, you'll
              land wherever it first feels like real work.
            </p>
          </Card>
        )}

        <Card variant="inset" className="border-l-[3px] border-accent">
          <p className="text-sm text-body">{plan.explanation}</p>
        </Card>

        <Card variant="plain" className="divide-y divide-line rounded-2xl border border-line bg-raised">
          {plan.exercises.map((ex) => (
            <ExercisePreviewCard key={ex.ladderId} exercise={ex} />
          ))}
        </Card>

        <Button variant="secondary" onClick={onToggleMinimum} aria-pressed={wantMinimum}>
          {wantMinimum ? 'Full version' : 'Short version (5 min)'}
        </Button>
      </div>

      <StickyBottomBar>
        <Button size="xl" className="w-full" onClick={onStart} disabled={starting}>
          Start session
        </Button>
      </StickyBottomBar>
    </>
  )
}

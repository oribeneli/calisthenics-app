import { getLadder, levelIndex } from '../../data/program.ts'
import type { PlannedExercise } from '../../engine/types'
import { Card } from '../ui/Card'

function targetLabel(ex: PlannedExercise): string {
  const unit = ex.unit === 'sec' ? (ex.target === 1 ? 'second' : 'seconds') : ex.target === 1 ? 'rep' : 'reps'
  const base = ex.unit === 'sec' ? `${ex.target} s hold` : `${ex.target} ${unit}`
  return ex.perSide ? `${base} per side` : base
}

/** Compact read-only preview of one of today's five exercises, for the dashboard. */
export function ExercisePreviewCard({ exercise }: { exercise: PlannedExercise }) {
  const ladder = getLadder(exercise.ladderId)
  const levelNum = levelIndex(exercise.ladderId, exercise.level.id) + 1

  return (
    <Card className="p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{ladder.name}</p>
      <div className="mt-0.5 flex items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold">{exercise.level.name}</h3>
        <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
          L{levelNum} of {ladder.levels.length}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
        {exercise.mode === 'assess' ? 'Find your level' : `${exercise.sets} × ${targetLabel(exercise)}`}
      </p>
      {exercise.note && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{exercise.note}</p>}
    </Card>
  )
}

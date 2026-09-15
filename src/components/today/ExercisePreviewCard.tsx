import { getLadder, levelIndex } from '../../data/program.ts'
import type { PlannedExercise } from '../../engine/types'
import { SectionLabel } from '../ui/SectionLabel'

function targetLabel(ex: PlannedExercise): string {
  const unit = ex.unit === 'sec' ? (ex.target === 1 ? 'second' : 'seconds') : ex.target === 1 ? 'rep' : 'reps'
  const base = ex.unit === 'sec' ? `${ex.target} s hold` : `${ex.target} ${unit}`
  return ex.perSide ? `${base} per side` : base
}

/** Compact read-only preview row for one of today's five exercises, on the dashboard. */
export function ExercisePreviewCard({ exercise }: { exercise: PlannedExercise }) {
  const ladder = getLadder(exercise.ladderId)
  const levelNum = levelIndex(exercise.ladderId, exercise.level.id) + 1

  return (
    <div className="p-3">
      <SectionLabel>{ladder.name}</SectionLabel>
      <div className="mt-0.5 flex items-baseline justify-between gap-2">
        <h3 className="text-base font-semibold text-ink">{exercise.level.name}</h3>
        <span className="num shrink-0 text-xs text-muted">
          L{levelNum} of {ladder.levels.length}
        </span>
      </div>
      <p className="mt-1 text-sm text-body">
        {exercise.mode === 'assess' ? (
          'Find your level'
        ) : (
          <span className="num">
            {exercise.sets} × {targetLabel(exercise)}
          </span>
        )}
      </p>
      {exercise.note && <p className="mt-1 text-xs text-muted">{exercise.note}</p>}
    </div>
  )
}

import type { RoutineStep } from '../../data/types'

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`
  const min = Math.floor(sec / 60)
  const rest = sec % 60
  return rest === 0 ? `${min} min` : `${min} min ${rest}s`
}

/** A collapsible <details> list of routine steps (warm-up, cool-down, rest-day mobility). */
export function RoutineList({ title, steps }: { title: string; steps: RoutineStep[] }) {
  const totalSec = steps.reduce((sum, s) => sum + s.durationSec, 0)

  return (
    <details className="group">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 [&::-webkit-details-marker]:hidden">
        <span className="text-sm font-semibold text-ink">{title}</span>
        <span className="num flex items-center gap-2 text-xs text-muted">
          {formatDuration(totalSec)}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-open:rotate-180"
            aria-hidden="true"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </summary>
      <ol className="mt-2 flex flex-col gap-2 border-t border-line pt-2">
        {steps.map((step) => (
          <li key={step.id} className="flex items-start justify-between gap-3 text-sm">
            <div>
              <p className="font-medium text-ink">{step.name}</p>
              <p className="text-muted">{step.cue}</p>
            </div>
            <span className="num shrink-0 text-muted">{formatDuration(step.durationSec)}</span>
          </li>
        ))}
      </ol>
    </details>
  )
}

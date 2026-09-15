import { cn } from '../../lib/cn'
import type { Level } from '../../data/types'
import { formatScheme } from './format'

export interface LevelCardProps {
  level: Level
  index: number
  isCurrent: boolean
  currentWeek: number
  gatePassed: boolean
  onToggleGate: (key: string) => void
  onSetLevel: () => void
}

export function LevelCard({ level, index, isCurrent, currentWeek, gatePassed, onToggleGate, onSetLevel }: LevelCardProps) {
  const hiddenWeeks = level.hiddenUntilWeek !== undefined ? level.hiddenUntilWeek - currentWeek : 0
  const isHidden = hiddenWeeks > 0
  const canSet = !level.gate || gatePassed

  return (
    <details
      open={isCurrent}
      className={cn(
        'group rounded-xl border p-3',
        isCurrent
          ? 'border-sky-400 bg-sky-50 dark:border-sky-700 dark:bg-sky-950/40'
          : 'border-slate-200 dark:border-slate-800',
      )}
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-2 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-medium text-slate-900 dark:text-slate-100">
              #{index + 1} {level.name}
            </span>
            {isCurrent && (
              <span className="rounded-full bg-sky-600 px-2 py-0.5 text-[11px] font-semibold text-white">
                Current
              </span>
            )}
            {isHidden && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                Unlocks in week {level.hiddenUntilWeek}
              </span>
            )}
            {level.gate && (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-800 dark:bg-violet-900/40 dark:text-violet-300">
                {gatePassed ? 'Gate confirmed' : 'Gated'}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{formatScheme(level.scheme)}</p>
        </div>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mt-1 shrink-0 text-slate-400 transition-transform group-open:rotate-180"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>

      <div className="mt-3 flex flex-col gap-3 border-t border-slate-200 pt-3 text-sm dark:border-slate-800">
        <p className="text-slate-700 dark:text-slate-300">{level.setup}</p>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Cues</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-slate-700 dark:text-slate-300">
            {level.cues.map((cue) => (
              <li key={cue}>{cue}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Common faults
          </p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-slate-700 dark:text-slate-300">
            {level.faults.map((fault) => (
              <li key={fault}>{fault}</li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Advance</p>
          <p className="text-slate-700 dark:text-slate-300">{level.advance}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Regress</p>
          <p className="text-slate-700 dark:text-slate-300">{level.regress}</p>
        </div>

        {level.gate && (
          <label className="flex min-h-11 items-center gap-2 rounded-lg bg-violet-50 px-2 text-slate-800 dark:bg-violet-950/30 dark:text-slate-200">
            <input
              type="checkbox"
              checked={gatePassed}
              onChange={() => onToggleGate(level.gate!.key)}
              className="h-5 w-5 shrink-0 accent-sky-600"
            />
            <span className="text-sm">{level.gate.label}</span>
          </label>
        )}

        <button
          type="button"
          onClick={onSetLevel}
          disabled={!canSet}
          className={cn(
            'min-h-11 rounded-xl px-4 text-sm font-medium transition-colors',
            'disabled:cursor-not-allowed disabled:opacity-50',
            isCurrent
              ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              : 'bg-sky-600 text-white hover:bg-sky-500 active:bg-sky-700',
          )}
        >
          {isCurrent ? "This is my level" : 'Set as my level'}
        </button>
      </div>
    </details>
  )
}

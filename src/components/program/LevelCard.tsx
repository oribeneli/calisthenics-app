import { cn } from '../../lib/cn'
import type { Level } from '../../data/types'
import { SectionLabel } from '../ui/SectionLabel'
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
      className={cn('group border-l-[3px] pl-3', isCurrent ? 'border-accent' : 'border-transparent')}
    >
      <summary className="flex cursor-pointer list-none items-start justify-between gap-2 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-medium text-ink">
              #{index + 1} {level.name}
            </span>
            {isCurrent && (
              <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-semibold text-on-accent">
                Current
              </span>
            )}
            {isHidden && (
              <span className="rounded-full bg-warn-soft px-2 py-0.5 text-[11px] font-medium text-warn">
                Unlocks in week {level.hiddenUntilWeek}
              </span>
            )}
            {level.gate && (
              <span className="rounded-full bg-inset px-2 py-0.5 text-[11px] font-medium text-body">
                {gatePassed ? 'Gate confirmed' : 'Gated'}
              </span>
            )}
          </div>
          <p className="num mt-0.5 text-sm text-muted">{formatScheme(level.scheme)}</p>
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
          className="mt-1 shrink-0 text-muted transition-transform group-open:rotate-180"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>

      <div className="mt-3 flex flex-col gap-3 rounded-xl bg-inset p-3 text-sm">
        <p className="text-body">{level.setup}</p>

        <div>
          <SectionLabel className="text-xs">Cues</SectionLabel>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-body">
            {level.cues.map((cue) => (
              <li key={cue}>{cue}</li>
            ))}
          </ul>
        </div>

        <div>
          <SectionLabel className="text-xs">Common faults</SectionLabel>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-body">
            {level.faults.map((fault) => (
              <li key={fault}>{fault}</li>
            ))}
          </ul>
        </div>

        <div>
          <SectionLabel className="text-xs">Advance</SectionLabel>
          <p className="text-body">{level.advance}</p>
        </div>
        <div>
          <SectionLabel className="text-xs">Regress</SectionLabel>
          <p className="text-body">{level.regress}</p>
        </div>

        {level.gate && (
          <label className="flex min-h-12 items-center gap-2 rounded-lg bg-raised px-2 text-ink">
            <input
              type="checkbox"
              checked={gatePassed}
              onChange={() => onToggleGate(level.gate!.key)}
              className="h-5 w-5 shrink-0 accent-accent"
            />
            <span className="text-sm">{level.gate.label}</span>
          </label>
        )}

        <button
          type="button"
          onClick={onSetLevel}
          disabled={!canSet}
          className={cn(
            'pressable min-h-12 rounded-xl px-4 text-sm font-medium',
            'disabled:cursor-not-allowed disabled:opacity-50',
            isCurrent ? 'bg-line text-muted' : 'bg-accent text-on-accent hover:brightness-105',
          )}
        >
          {isCurrent ? "This is my level" : 'Set as my level'}
        </button>
      </div>
    </details>
  )
}

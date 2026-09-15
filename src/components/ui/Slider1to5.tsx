import { cn } from '../../lib/cn'

export interface Slider1to5Props {
  value: number | undefined
  onChange: (value: 1 | 2 | 3 | 4 | 5) => void
  label?: string
  lowLabel?: string
  highLabel?: string
  className?: string
}

const LEVELS = [1, 2, 3, 4, 5] as const

/** Five big tappable buttons for 1-5 self-report scales (mood, soreness, ...). */
export function Slider1to5({
  value,
  onChange,
  label,
  lowLabel,
  highLabel,
  className,
}: Slider1to5Props) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {label && <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>}
      <div className="flex gap-2">
        {LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            aria-label={`${level} of 5`}
            aria-pressed={value === level}
            onClick={() => onChange(level)}
            className={cn(
              'flex h-12 flex-1 items-center justify-center rounded-xl text-lg font-semibold transition-colors',
              value === level
                ? 'bg-sky-600 text-white'
                : 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
            )}
          >
            {level}
          </button>
        ))}
      </div>
      {(lowLabel || highLabel) && (
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{lowLabel}</span>
          <span>{highLabel}</span>
        </div>
      )}
    </div>
  )
}

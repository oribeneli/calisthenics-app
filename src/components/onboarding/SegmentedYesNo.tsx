import { cn } from '../../lib/cn'

export interface SegmentedYesNoProps {
  value: boolean | undefined
  onChange: (value: boolean) => void
  ariaLabel?: string
  className?: string
}

/** Big Yes/No segmented control — an alternative to a switch for screening questions. */
export function SegmentedYesNo({ value, onChange, ariaLabel, className }: SegmentedYesNoProps) {
  return (
    <div className={cn('flex gap-2', className)} role="group" aria-label={ariaLabel}>
      <button
        type="button"
        aria-pressed={value === true}
        onClick={() => onChange(true)}
        className={cn(
          'min-h-12 flex-1 rounded-xl text-base font-semibold transition-colors',
          value === true
            ? 'bg-sky-600 text-white'
            : 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
        )}
      >
        Yes
      </button>
      <button
        type="button"
        aria-pressed={value === false}
        onClick={() => onChange(false)}
        className={cn(
          'min-h-12 flex-1 rounded-xl text-base font-semibold transition-colors',
          value === false
            ? 'bg-sky-600 text-white'
            : 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
        )}
      >
        No
      </button>
    </div>
  )
}

import { cn } from '../../lib/cn'

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export interface DayChipsProps {
  value: number
  onChange: (day: number) => void
  /** Days already used by other slots — shown disabled so slots can't collide. */
  disabledDays?: number[]
  className?: string
}

/** Seven day-of-week chips, sized for one-handed tapping at phone width. */
export function DayChips({ value, onChange, disabledDays = [], className }: DayChipsProps) {
  return (
    <div className={cn('flex gap-1', className)}>
      {DAY_LABELS.map((label, day) => {
        const disabled = day !== value && disabledDays.includes(day)
        return (
          <button
            key={day}
            type="button"
            aria-label={label}
            aria-pressed={value === day}
            disabled={disabled}
            onClick={() => onChange(day)}
            className={cn(
              'flex min-h-12 flex-1 items-center justify-center rounded-xl text-xs font-semibold transition-colors',
              value === day ? 'bg-accent text-on-accent' : disabled ? 'bg-inset text-muted opacity-40' : 'bg-inset text-ink',
            )}
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}

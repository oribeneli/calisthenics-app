import { cn } from '../../lib/cn'

export interface NumberStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  label?: string
  className?: string
}

/** Big +/- buttons around a number, sized for one-handed logging. */
export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = Infinity,
  step = 1,
  label,
  className,
}: NumberStepperProps) {
  const decrement = () => onChange(Math.max(min, value - step))
  const increment = () => onChange(Math.min(max, value + step))

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {label && <span className="text-sm text-slate-600 dark:text-slate-400">{label}</span>}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Decrease"
          onClick={decrement}
          disabled={value <= min}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-2xl font-bold text-slate-900 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-100"
        >
          −
        </button>
        <span className="min-w-12 text-center text-2xl font-semibold tabular-nums">{value}</span>
        <button
          type="button"
          aria-label="Increase"
          onClick={increment}
          disabled={value >= max}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-2xl font-bold text-slate-900 disabled:opacity-40 dark:bg-slate-800 dark:text-slate-100"
        >
          +
        </button>
      </div>
    </div>
  )
}

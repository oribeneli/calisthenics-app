import { cn } from '../../lib/cn'

export interface ProgressStepsProps {
  step: number
  total: number
  label: string
}

/** Thin progress bar + "Step X of N — Label" caption for the onboarding wizard. */
export function ProgressSteps({ step, total, label }: ProgressStepsProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={cn(
              'h-1.5 flex-1 rounded-full',
              i < step ? 'bg-sky-600' : 'bg-slate-200 dark:bg-slate-800',
            )}
          />
        ))}
      </div>
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
        Step {step} of {total} — {label}
      </span>
    </div>
  )
}

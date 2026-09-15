import { cn } from '../../lib/cn'

export interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  className?: string
}

export function Toggle({ checked, onChange, label, className }: ToggleProps) {
  return (
    <label className={cn('flex min-h-12 cursor-pointer items-center justify-between gap-3', className)}>
      {label && <span className="text-base text-ink">{label}</span>}
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={cn(
          'pressable relative h-8 w-14 shrink-0 rounded-full',
          checked ? 'bg-accent' : 'bg-line',
        )}
      >
        <span
          className={cn(
            'pressable absolute top-1 left-0 h-6 w-6 rounded-full bg-raised shadow',
            checked ? 'translate-x-7' : 'translate-x-1',
          )}
        />
      </button>
    </label>
  )
}

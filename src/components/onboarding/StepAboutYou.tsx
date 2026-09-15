import { Card } from '../ui/Card'
import { NumberStepper } from '../ui/NumberStepper'
import { cn } from '../../lib/cn'
import type { Sex } from '../../db/types'
import type { OnboardingDraft } from './types'

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

const CURRENT_YEAR = new Date().getFullYear()

export interface StepAboutYouProps {
  draft: OnboardingDraft
  onChange: (patch: Partial<OnboardingDraft>) => void
}

export function StepAboutYou({ draft, onChange }: StepAboutYouProps) {
  const heightM = draft.heightCm / 100
  const bmi = Math.round((draft.weightKg / (heightM * heightM)) * 10) / 10
  const goalWeightKg = Math.round(25 * heightM * heightM * 10) / 10

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">About you</h1>
        <p className="mt-1 text-sm text-body">
          Used to set your starting levels and a realistic pace. All of this stays on this device.
        </p>
      </div>

      <Card className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-muted">Name (optional)</span>
          <input
            type="text"
            value={draft.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="What should we call you?"
            className="min-h-12 rounded-xl border border-line bg-inset px-3 text-base text-ink"
          />
        </label>

        <div className="flex flex-col gap-1">
          <span className="text-sm text-muted">Sex</span>
          <div className="flex gap-2" role="group" aria-label="Sex">
            {SEX_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                aria-pressed={draft.sex === opt.value}
                onClick={() => onChange({ sex: opt.value })}
                className={cn(
                  'min-h-12 flex-1 rounded-xl text-sm font-semibold transition-colors',
                  draft.sex === opt.value ? 'bg-accent text-on-accent' : 'bg-inset text-ink',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <NumberStepper
          label="Birth year"
          value={draft.birthYear}
          onChange={(v) => onChange({ birthYear: v })}
          min={1930}
          max={CURRENT_YEAR - 10}
          step={1}
        />
        <NumberStepper
          label="Height (cm)"
          value={draft.heightCm}
          onChange={(v) => onChange({ heightCm: v })}
          min={120}
          max={230}
          step={1}
        />
        <NumberStepper
          label="Current weight (kg)"
          value={draft.weightKg}
          onChange={(v) => onChange({ weightKg: v })}
          min={30}
          max={250}
          step={0.5}
        />
      </Card>

      <Card variant="inset">
        <p className="text-sm text-body">
          BMI <span className="num">{Number.isFinite(bmi) ? bmi : '—'}</span>, a comfortable goal weight for your
          height is around <span className="num font-semibold text-ink">{goalWeightKg} kg</span>.
        </p>
        <p className="mt-2 text-sm text-body">
          Expect roughly 0.5–1% of your body weight per week; in the first 8 weeks expect your reps to roughly
          double while the scale moves slowly.
        </p>
      </Card>
    </div>
  )
}

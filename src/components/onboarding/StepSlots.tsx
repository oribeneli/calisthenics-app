import { Card } from '../ui/Card'
import { SectionLabel } from '../ui/SectionLabel'
import { DayChips } from './DayChips'
import type { OnboardingDraft } from './types'

const FULL_DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

export interface StepSlotsProps {
  draft: OnboardingDraft
  onChange: (patch: Partial<OnboardingDraft>) => void
}

export function StepSlots({ draft, onChange }: StepSlotsProps) {
  function updateSlot(index: number, patch: Partial<OnboardingDraft['slots'][number]>) {
    const slots = draft.slots.map((slot, i) => (i === index ? { ...slot, ...patch } : slot))
    onChange({ slots })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">Your three slots</h1>
        <p className="mt-1 text-sm text-body">
          Three if-then plans beat one vague intention. Pick three days, a time, and a place.
        </p>
      </div>

      <Card className="divide-y divide-line">
        {draft.slots.map((slot, index) => {
          const otherDays = draft.slots.filter((_, i) => i !== index).map((s) => s.day)
          return (
            <div key={index} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
              <SectionLabel>Slot {index + 1}</SectionLabel>
              <DayChips
                value={slot.day}
                onChange={(day) => updateSlot(index, { day })}
                disabledDays={otherDays}
              />
              <div className="flex gap-3">
                <label className="flex flex-1 flex-col gap-1">
                  <span className="text-sm text-muted">Time</span>
                  <input
                    type="time"
                    value={slot.time}
                    onChange={(e) => updateSlot(index, { time: e.target.value })}
                    className="min-h-12 rounded-xl border border-line bg-inset px-3 text-base text-ink"
                  />
                </label>
                <label className="flex flex-1 flex-col gap-1">
                  <span className="text-sm text-muted">Place</span>
                  <input
                    type="text"
                    value={slot.place}
                    onChange={(e) => updateSlot(index, { place: e.target.value })}
                    className="min-h-12 rounded-xl border border-line bg-inset px-3 text-base text-ink"
                  />
                </label>
              </div>
              <p className="rounded-xl bg-inset px-3 py-2 text-sm text-body">
                If it is {FULL_DAY_NAMES[slot.day]} {slot.time}, then I train in the {slot.place || '…'}.
              </p>
            </div>
          )
        })}
      </Card>

      <Card variant="inset">
        <p className="text-sm text-body">
          Each session is <span className="num font-semibold text-ink">25 minutes</span>.
        </p>
      </Card>
    </div>
  )
}

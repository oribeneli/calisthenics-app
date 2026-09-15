import { Card } from '../ui/Card'
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
        <h1 className="text-xl font-semibold">Your three slots</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Three if-then plans beat one vague intention. Pick three days, a time, and a place.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {draft.slots.map((slot, index) => {
          const otherDays = draft.slots.filter((_, i) => i !== index).map((s) => s.day)
          return (
            <Card key={index} className="flex flex-col gap-3">
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Slot {index + 1}
              </span>
              <DayChips
                value={slot.day}
                onChange={(day) => updateSlot(index, { day })}
                disabledDays={otherDays}
              />
              <div className="flex gap-3">
                <label className="flex flex-1 flex-col gap-1">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Time</span>
                  <input
                    type="time"
                    value={slot.time}
                    onChange={(e) => updateSlot(index, { time: e.target.value })}
                    className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 text-base dark:border-slate-700 dark:bg-slate-800"
                  />
                </label>
                <label className="flex flex-1 flex-col gap-1">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Place</span>
                  <input
                    type="text"
                    value={slot.place}
                    onChange={(e) => updateSlot(index, { place: e.target.value })}
                    className="min-h-12 rounded-xl border border-slate-300 bg-white px-3 text-base dark:border-slate-700 dark:bg-slate-800"
                  />
                </label>
              </div>
              <p className="rounded-xl bg-sky-50 px-3 py-2 text-sm text-sky-900 dark:bg-sky-950/40 dark:text-sky-200">
                If it is {FULL_DAY_NAMES[slot.day]} {slot.time}, then I train in the {slot.place || '…'}
                .
              </p>
            </Card>
          )
        })}
      </div>

      <Card>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Each session is <span className="font-semibold text-slate-900 dark:text-slate-100">25 minutes</span>.
        </p>
      </Card>
    </div>
  )
}

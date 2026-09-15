import { useState } from 'react'
import type { RoutineStep } from '../../data/types'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Toggle } from '../ui/Toggle'
import { cn } from '../../lib/cn'
import { StickyBottomBar } from './StickyBottomBar'

const RPE_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const

export interface FinishScreenProps {
  cooldown: RoutineStep[]
  onFinish: (args: { rpe?: number; note?: string; formBreak: boolean }) => Promise<string[]>
  onDone: () => void
}

/** Session flow step 5: RPE + note + form-break toggle, then results and an optional cool-down. */
export function FinishScreen({ cooldown, onFinish, onDone }: FinishScreenProps) {
  const [rpe, setRpe] = useState<number | undefined>(undefined)
  const [note, setNote] = useState('')
  const [formBreak, setFormBreak] = useState(false)
  const [messages, setMessages] = useState<string[] | null>(null)
  const [saving, setSaving] = useState(false)

  const finish = async () => {
    setSaving(true)
    const result = await onFinish({ rpe, note: note.trim() || undefined, formBreak })
    setMessages(result)
    setSaving(false)
  }

  if (messages) {
    return (
      <>
        <Card>
          <h1 className="text-xl font-semibold text-ink">What changed</h1>
          {messages.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-body">
              {messages.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-body">Levels stayed the same today.</p>
          )}
        </Card>
        {cooldown.length > 0 && (
          <Card className="mt-3 divide-y divide-line">
            <h2 className="pb-3 text-sm font-semibold text-ink">Optional cool-down</h2>
            <ul className="flex flex-col divide-y divide-line">
              {cooldown.map((step) => (
                <li key={step.id} className="py-3">
                  <span className="block text-sm font-medium text-ink">{step.name}</span>
                  <span className="block text-xs text-muted">{step.cue}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
        <StickyBottomBar>
          <Button size="xl" className="w-full" onClick={onDone}>
            Back to Today
          </Button>
        </StickyBottomBar>
      </>
    )
  }

  return (
    <>
      <Card>
        <h1 className="text-xl font-semibold text-ink">How was that?</h1>
        <p className="mt-1 text-sm text-body">Rate of perceived exertion, how hard the session felt overall.</p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {RPE_VALUES.map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={rpe === v}
              onClick={() => setRpe(v)}
              className={cn(
                'num flex h-14 items-center justify-center rounded-xl text-lg transition-colors',
                rpe === v ? 'bg-accent text-on-accent' : 'bg-inset text-ink',
              )}
            >
              {v}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-sm text-muted" htmlFor="session-note">
          One-line note (optional)
        </label>
        <input
          id="session-note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="How did it feel?"
          className="mt-1 min-h-12 w-full rounded-xl border border-line bg-inset px-3 text-base text-ink"
        />

        <Toggle
          className="mt-4"
          checked={formBreak}
          onChange={setFormBreak}
          label="Did form break down on any set?"
        />
      </Card>
      <StickyBottomBar>
        <Button size="xl" className="w-full" onClick={finish} disabled={saving}>
          Finish
        </Button>
      </StickyBottomBar>
    </>
  )
}

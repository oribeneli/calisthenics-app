import { useState } from 'react'
import type { RoutineStep } from '../../data/types'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { Toggle } from '../ui/Toggle'
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
          <h1 className="text-xl font-semibold">What changed</h1>
          {messages.length > 0 ? (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-200">
              {messages.map((m, i) => (
                <li key={i}>{m}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Levels stayed the same today.</p>
          )}
        </Card>
        {cooldown.length > 0 && (
          <Card className="mt-3">
            <h2 className="text-sm font-semibold">Optional cool-down</h2>
            <ul className="mt-2 flex flex-col gap-2">
              {cooldown.map((step) => (
                <li key={step.id} className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
                  <span className="block text-sm font-medium">{step.name}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{step.cue}</span>
                </li>
              ))}
            </ul>
          </Card>
        )}
        <StickyBottomBar>
          <Button className="w-full" onClick={onDone}>
            Back to Today
          </Button>
        </StickyBottomBar>
      </>
    )
  }

  return (
    <>
      <Card>
        <h1 className="text-xl font-semibold">How was that?</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Rate of perceived exertion — how hard the session felt overall.
        </p>
        <div className="mt-3 grid grid-cols-5 gap-2">
          {RPE_VALUES.map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={rpe === v}
              onClick={() => setRpe(v)}
              className={
                'flex h-14 items-center justify-center rounded-xl text-lg font-semibold transition-colors ' +
                (rpe === v
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100')
              }
            >
              {v}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-sm text-slate-600 dark:text-slate-400" htmlFor="session-note">
          One-line note (optional)
        </label>
        <input
          id="session-note"
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="How did it feel?"
          className="mt-1 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3 text-base dark:border-slate-700 dark:bg-slate-900"
        />

        <Toggle
          className="mt-4"
          checked={formBreak}
          onChange={setFormBreak}
          label="Did form break down on any set?"
        />
      </Card>
      <StickyBottomBar>
        <Button className="w-full" onClick={finish} disabled={saving}>
          Finish
        </Button>
      </StickyBottomBar>
    </>
  )
}

import { useState } from 'react'
import { logRestDay } from '../../app/coach'
import type { RoutineStep } from '../../data/types'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { StickyBottomBar } from './StickyBottomBar'

/** State B: plan.kind === 'rest'. A 5-step mobility checklist plus "Done". */
export function RestDayCard({ steps, onDone }: { steps: RoutineStep[]; onDone: () => void }) {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  const toggle = (id: string) => {
    setChecked((cur) => {
      const next = new Set(cur)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const finish = async () => {
    setSaving(true)
    await logRestDay()
    onDone()
  }

  return (
    <>
      <Card>
        <h1 className="text-xl font-semibold">Rest day</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Five minutes of easy mobility. Nothing here is meant to be hard.
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {steps.map((step) => (
            <li key={step.id}>
              <button
                type="button"
                onClick={() => toggle(step.id)}
                aria-pressed={checked.has(step.id)}
                className="flex min-h-14 w-full items-start gap-3 rounded-xl bg-slate-100 p-3 text-left dark:bg-slate-800"
              >
                <span
                  aria-hidden="true"
                  className={
                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-sm ' +
                    (checked.has(step.id)
                      ? 'border-sky-600 bg-sky-600 text-white'
                      : 'border-slate-400 dark:border-slate-500')
                  }
                >
                  {checked.has(step.id) ? '✓' : ''}
                </span>
                <span>
                  <span className="block text-sm font-medium">{step.name}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400">{step.cue}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Card>
      <StickyBottomBar>
        <Button className="w-full" onClick={finish} disabled={saving}>
          Done (5 min)
        </Button>
      </StickyBottomBar>
    </>
  )
}

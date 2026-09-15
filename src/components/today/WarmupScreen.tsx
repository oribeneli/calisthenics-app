import { useEffect, useState } from 'react'
import type { RoutineStep } from '../../data/types'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { StickyBottomBar } from './StickyBottomBar'

function StepTimer({ step, active }: { step: RoutineStep; active: boolean }) {
  const [remaining, setRemaining] = useState(step.durationSec)

  useEffect(() => {
    setRemaining(step.durationSec)
  }, [step.id, step.durationSec])

  useEffect(() => {
    if (!active || remaining <= 0) return
    const id = window.setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
    return () => window.clearInterval(id)
  }, [active, remaining])

  return (
    <span className="tabular-nums text-sm font-medium text-slate-500 dark:text-slate-400">
      {active ? `${remaining}s` : `${step.durationSec}s`}
    </span>
  )
}

/** Session flow step 1: warm-up steps with a running per-step countdown. */
export function WarmupScreen({ steps, onDone, onSkip }: { steps: RoutineStep[]; onDone: () => void; onSkip: () => void }) {
  const [index, setIndex] = useState(0)
  const step = steps[index]

  const next = () => {
    if (index < steps.length - 1) setIndex((i) => i + 1)
    else onDone()
  }

  return (
    <>
      <Card>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Warm-up · {index + 1} of {steps.length}
        </p>
        <h1 className="mt-1 text-xl font-semibold">{step.name}</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{step.cue}</p>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
          <span className="text-sm text-slate-500 dark:text-slate-400">Suggested time</span>
          <StepTimer step={step} active={true} />
        </div>
      </Card>
      <StickyBottomBar>
        <div className="flex flex-col gap-2">
          <Button className="w-full" onClick={next}>
            {index < steps.length - 1 ? 'Next' : "I'm warmed up"}
          </Button>
          <Button variant="ghost" className="w-full" onClick={onSkip}>
            Skip warm-up
          </Button>
        </div>
        <p className="mt-1 text-center text-xs text-slate-500 dark:text-slate-400">
          Serratus activation and wrist prep are the two that matter.
        </p>
      </StickyBottomBar>
    </>
  )
}

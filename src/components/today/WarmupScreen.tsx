import { useEffect, useState } from 'react'
import type { RoutineStep } from '../../data/types'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ProgressRing } from '../ui/ProgressRing'
import { SectionLabel } from '../ui/SectionLabel'
import { StickyBottomBar } from './StickyBottomBar'

/** Running countdown ring for one warm-up step; remounted per step via `key`. */
function StepRing({ step }: { step: RoutineStep }) {
  const [remaining, setRemaining] = useState(step.durationSec)

  useEffect(() => {
    if (remaining <= 0) return
    const id = window.setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000)
    return () => window.clearInterval(id)
  }, [remaining])

  const progress = step.durationSec > 0 ? remaining / step.durationSec : 0

  return (
    <ProgressRing progress={progress} size={200}>
      <span className="num text-5xl text-ink">{remaining}</span>
      <span className="text-sm text-muted">seconds</span>
    </ProgressRing>
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
      <Card className="flex flex-col items-center py-8 text-center">
        <SectionLabel>
          Warm-up, {index + 1} of {steps.length}
        </SectionLabel>
        <h1 className="mt-1 text-xl font-semibold text-ink">{step.name}</h1>
        <p className="mt-2 text-sm text-body">{step.cue}</p>
        <div className="mt-4">
          <StepRing key={step.id} step={step} />
        </div>
      </Card>
      <StickyBottomBar>
        <div className="flex flex-col gap-2">
          <Button size="xl" className="w-full" onClick={next}>
            {index < steps.length - 1 ? 'Next' : "I'm warmed up"}
          </Button>
          <Button variant="ghost" size="xl" className="w-full" onClick={onSkip}>
            Skip warm-up
          </Button>
        </div>
        <p className="mt-1 text-center text-xs text-muted">
          Serratus activation and wrist prep are the two that matter.
        </p>
      </StickyBottomBar>
    </>
  )
}

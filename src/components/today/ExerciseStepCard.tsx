import { useEffect, useRef, useState } from 'react'
import type { Level } from '../../data/types'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { NumberStepper } from '../ui/NumberStepper'
import { StickyBottomBar } from './StickyBottomBar'

function HoldTimer({ running, onToggle, seconds }: { running: boolean; onToggle: () => void; seconds: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
      <span className="text-2xl font-semibold tabular-nums">{seconds}s</span>
      <Button size="md" variant={running ? 'danger' : 'primary'} onClick={onToggle}>
        {running ? 'Stop' : 'Start hold'}
      </Button>
    </div>
  )
}

export interface ExerciseStepCardProps {
  patternName: string
  level: Level
  levelNumber: number
  totalLevels: number
  setLabel: string
  target: number
  unit: 'reps' | 'sec'
  perSide: boolean
  note?: string
  /** Assessment attempts skip the too-hard / too-easy escape hatches. */
  assess: boolean
  saving: boolean
  onLog: (done: number) => void
  onTooHard?: () => void
  onTooEasy?: () => void
}

/** Session flow step 2: one exercise, one set. */
export function ExerciseStepCard({
  patternName,
  level,
  levelNumber,
  totalLevels,
  setLabel,
  target,
  unit,
  perSide,
  note,
  assess,
  saving,
  onLog,
  onTooHard,
  onTooEasy,
}: ExerciseStepCardProps) {
  const [value, setValue] = useState(target)
  const [holdRunning, setHoldRunning] = useState(false)
  const [holdSeconds, setHoldSeconds] = useState(0)
  const holdStart = useRef<number | null>(null)

  useEffect(() => {
    setValue(target)
    setHoldRunning(false)
    setHoldSeconds(0)
  }, [level.id, setLabel, target])

  useEffect(() => {
    if (!holdRunning) return
    holdStart.current = Date.now() - holdSeconds * 1000
    const id = window.setInterval(() => {
      setHoldSeconds(Math.round((Date.now() - (holdStart.current ?? Date.now())) / 1000))
    }, 250)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [holdRunning])

  const toggleHold = () => {
    if (holdRunning) {
      setHoldRunning(false)
      setValue(holdSeconds)
    } else {
      setHoldRunning(true)
    }
  }

  const targetLabel = unit === 'sec' ? `${target} s hold` : `${target} ${target === 1 ? 'rep' : 'reps'}`

  return (
    <>
      <Card>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {patternName}
        </p>
        <div className="mt-0.5 flex items-baseline justify-between gap-2">
          <h1 className="text-xl font-semibold">{level.name}</h1>
          <span className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
            L{levelNumber} of {totalLevels}
          </span>
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{level.setup}</p>
        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-slate-700 dark:text-slate-200">
          {level.cues.map((cue) => (
            <li key={cue}>{cue}</li>
          ))}
        </ul>
        <details className="mt-2">
          <summary className="min-h-8 cursor-pointer text-sm font-medium text-slate-500 dark:text-slate-400">
            Common faults
          </summary>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-slate-600 dark:text-slate-300">
            {level.faults.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </details>
        {note && (
          <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            {note}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm font-medium">{setLabel}</span>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            Target: {targetLabel}
            {perSide ? ' per side' : ''}
          </span>
        </div>

        <div className="mt-3">
          {unit === 'sec' ? (
            <HoldTimer running={holdRunning} onToggle={toggleHold} seconds={holdSeconds} />
          ) : (
            <NumberStepper value={value} onChange={setValue} min={0} max={999} />
          )}
        </div>
      </Card>
      <StickyBottomBar>
        <div className="flex flex-col gap-2">
          <Button className="w-full" onClick={() => onLog(value)} disabled={saving}>
            Log set
          </Button>
          {!assess && (
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={onTooHard} disabled={saving}>
                Too hard → easier
              </Button>
              <Button variant="secondary" className="flex-1" onClick={onTooEasy} disabled={saving}>
                Too easy
              </Button>
            </div>
          )}
        </div>
      </StickyBottomBar>
    </>
  )
}

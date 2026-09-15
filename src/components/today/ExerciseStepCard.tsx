import { useEffect, useRef, useState } from 'react'
import type { Level } from '../../data/types'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { NumberStepper } from '../ui/NumberStepper'
import { ProgressRing } from '../ui/ProgressRing'
import { SectionLabel } from '../ui/SectionLabel'
import { StickyBottomBar } from './StickyBottomBar'

/** Read-only ring; the start/stop control lives in the sticky bottom bar so it never
 * competes for space with "Log set". */
function HoldRing({ seconds, target }: { seconds: number; target: number }) {
  const progress = target > 0 ? Math.min(1, seconds / target) : 0
  return (
    <ProgressRing progress={progress} size={200} tone="good" className="mx-auto">
      <span className="num text-5xl text-ink">{seconds}</span>
      <span className="text-sm text-muted">seconds</span>
    </ProgressRing>
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

  const targetUnitLabel = unit === 'sec' ? (target === 1 ? 'second target' : 'seconds target') : target === 1 ? 'rep target' : 'reps target'

  return (
    <>
      <Card>
        <SectionLabel>{patternName}</SectionLabel>
        <div className="mt-0.5 flex items-baseline justify-between gap-2">
          <h1 className="text-xl font-semibold text-ink">{level.name}</h1>
          <span className="num shrink-0 text-xs text-muted">
            L{levelNumber} of {totalLevels}
          </span>
        </div>
        <p className="mt-2 text-sm text-body">{level.setup}</p>
        <ul className="mt-2 list-disc space-y-0.5 pl-5 text-sm text-body">
          {level.cues.map((cue) => (
            <li key={cue}>{cue}</li>
          ))}
        </ul>
        <details className="mt-2">
          <summary className="min-h-8 cursor-pointer text-sm font-medium text-muted">Common faults</summary>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-sm text-muted">
            {level.faults.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </details>
        {note && <p className="mt-2 rounded-lg bg-warn-soft p-2 text-xs text-ink">{note}</p>}

        <div className="mt-4">
          <SectionLabel>{setLabel}</SectionLabel>
          {unit === 'sec' ? (
            <div className="mt-3">
              <p className="text-sm text-muted">
                Target: <span className="num">{target}</span> s{perSide ? ' per side' : ''}
              </p>
              <div className="mt-3">
                <HoldRing seconds={holdSeconds} target={target} />
              </div>
            </div>
          ) : (
            <>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="num text-5xl text-ink">{target}</span>
                <span className="text-sm text-muted">
                  {targetUnitLabel}
                  {perSide ? ' per side' : ''}
                </span>
              </div>
              <div className="mt-3">
                <NumberStepper value={value} onChange={setValue} min={0} max={999} />
              </div>
            </>
          )}
        </div>
      </Card>
      <StickyBottomBar>
        <div className="flex flex-col gap-2">
          {unit === 'sec' && holdRunning ? (
            <Button size="xl" variant="danger" className="w-full" onClick={toggleHold}>
              Stop hold
            </Button>
          ) : unit === 'sec' && holdSeconds === 0 ? (
            <Button size="xl" className="w-full" onClick={toggleHold}>
              Start hold
            </Button>
          ) : (
            <Button size="xl" className="w-full" onClick={() => onLog(value)} disabled={saving}>
              Log set
            </Button>
          )}
          {!assess && (
            <div className="flex gap-2">
              <Button variant="secondary" size="xl" className="flex-1" onClick={onTooHard} disabled={saving}>
                Too hard
              </Button>
              <Button variant="secondary" size="xl" className="flex-1" onClick={onTooEasy} disabled={saving}>
                Too easy
              </Button>
            </div>
          )}
        </div>
      </StickyBottomBar>
    </>
  )
}

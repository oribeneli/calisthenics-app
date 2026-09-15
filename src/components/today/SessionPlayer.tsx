import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { finishSession, logSet, setHardStop } from '../../app/coach'
import { getLadder, getLevel, nextLevel as nextProgramLevel, prevLevel as prevProgramLevel, program } from '../../data/program.ts'
import type { PatternId } from '../../data/types'
import { db } from '../../db/db'
import { useProfile } from '../../db/hooks'
import type { Session, SetLog } from '../../db/types'
import { minTarget, unitOf } from '../../engine/ladders'
import type { PlannedExercise } from '../../engine/types'
import { Button } from '../ui/Button'
import { AssessDecisionCard } from './AssessDecisionCard'
import { EndEarlySheet } from './EndEarlySheet'
import { ExerciseStepCard } from './ExerciseStepCard'
import { FinishScreen } from './FinishScreen'
import { HardStopSheet } from './HardStopSheet'
import { classifyOutcome } from './outcome'
import { PainSheet } from './PainSheet'
import { RestTimer } from './RestTimer'
import { deriveSessionPosition, type SessionExercise, type SessionSetLog } from './sessionPosition'
import { TooHardSheet } from './TooHardSheet'
import { WarmupScreen } from './WarmupScreen'

type Phase = 'warmup' | 'exercise' | 'assess-decision' | 'rest' | 'finish'

function buildSessionExercises(exercises: PlannedExercise[]): SessionExercise[] {
  return exercises.map((ex) =>
    ex.mode === 'assess'
      ? { ladderId: ex.ladderId, sets: 0, assess: true, maxAttempts: getLadder(ex.ladderId).assessmentCap }
      : { ladderId: ex.ladderId, sets: ex.sets },
  )
}

function toSetLogLite(logs: SetLog[]): SessionSetLog[] {
  return logs.map((l) => ({ ladderId: l.ladderId, outcome: l.outcome }))
}

/** Where a session's logs land: the same exercise (next set), the assessment decision
 * for that pattern, or the next exercise / finish screen. */
function resolvePosition(
  exercises: PlannedExercise[],
  logs: SetLog[],
): { exerciseIndex: number; phase: 'exercise' | 'assess-decision' | 'finish' } {
  const pos = deriveSessionPosition(buildSessionExercises(exercises), toSetLogLite(logs))
  if (pos.complete) return { exerciseIndex: pos.exerciseIndex, phase: 'finish' }
  const ex = exercises[pos.exerciseIndex]
  const logsForEx = logs.filter((l) => l.ladderId === ex.ladderId)
  const phase = ex.mode === 'assess' && logsForEx.length > 0 ? 'assess-decision' : 'exercise'
  return { exerciseIndex: pos.exerciseIndex, phase }
}

/** The level a normal exercise's next set should use, derived from its logs (a "too hard"
 * tap logs a 'fail' set at the attempted level; every later set targets the level below it). */
function currentLevelFor(exercise: PlannedExercise, logsForLadder: SetLog[]) {
  if (logsForLadder.length === 0) return exercise.level
  const last = logsForLadder[logsForLadder.length - 1]
  if (last.outcome === 'fail') {
    const prev = prevProgramLevel(exercise.ladderId, last.levelId)
    return prev ?? getLevel(exercise.ladderId, last.levelId)
  }
  return getLevel(exercise.ladderId, last.levelId)
}

export function SessionPlayer({ session, onSessionFinished }: { session: Session; onSessionFinished: () => void }) {
  const plan = session.planSnapshot!
  const sessionId = session.id!
  const { profile } = useProfile()
  const logs = useLiveQuery(() => db.setLogs.where('sessionId').equals(sessionId).sortBy('id'), [sessionId])

  const [phase, setPhase] = useState<Phase>('warmup')
  const [exerciseIndex, setExerciseIndex] = useState(0)
  const [assessAttemptLevelId, setAssessAttemptLevelId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [painPatterns, setPainPatterns] = useState<PatternId[]>([])
  const [painSheetOpen, setPainSheetOpen] = useState(false)
  const [tooHardOpen, setTooHardOpen] = useState(false)
  const [hardStopOpen, setHardStopOpen] = useState(false)
  const [endEarlyOpen, setEndEarlyOpen] = useState(false)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current || logs === undefined) return
    initialized.current = true
    if (logs.length === 0) {
      setPhase('warmup')
      setExerciseIndex(0)
      return
    }
    const resolved = resolvePosition(plan.exercises, logs)
    setExerciseIndex(resolved.exerciseIndex)
    setPhase(resolved.phase)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logs])

  if (logs === undefined || !initialized.current) return null

  const current: PlannedExercise | undefined = plan.exercises[exerciseIndex]
  const logsForCurrent = current ? logs.filter((l) => l.ladderId === current.ladderId) : []

  const afterLogged = () => {
    setSaving(false)
    setAssessAttemptLevelId(null)
    setTooHardOpen(false)
    setPhase('rest')
  }

  const advanceAfterRest = () => {
    db.setLogs
      .where('sessionId')
      .equals(sessionId)
      .sortBy('id')
      .then((freshLogs) => {
        const resolved = resolvePosition(plan.exercises, freshLogs)
        setExerciseIndex(resolved.exerciseIndex)
        setPhase(resolved.phase)
      })
  }

  const advanceToNextExercise = () => {
    setAssessAttemptLevelId(null)
    const next = exerciseIndex + 1
    setExerciseIndex(next)
    setPhase(next >= plan.exercises.length ? 'finish' : 'exercise')
  }

  const handlePainJoint = () => {
    if (!current) return
    setPainPatterns((cur) => (cur.includes(current.ladderId) ? cur : [...cur, current.ladderId]))
    advanceToNextExercise()
  }

  const handleEndEarly = async () => {
    setSaving(true)
    await finishSession({ sessionId, partial: true, painPatterns })
    onSessionFinished()
  }

  const handleHardStop = async () => {
    setSaving(true)
    await finishSession({ sessionId, partial: true, painPatterns })
    await setHardStop(true)
    onSessionFinished()
  }

  const logCurrentSet = async (levelId: string, target: number, unit: 'reps' | 'sec', done: number, outcome: SetLog['outcome']) => {
    if (!current) return
    setSaving(true)
    await logSet({
      sessionId,
      ladderId: current.ladderId,
      levelId,
      setIndex: logsForCurrent.length,
      target,
      done,
      unit,
      outcome,
    })
    afterLogged()
  }

  let body: ReactNode = null
  let tooHardTarget: { level: (typeof plan.exercises)[number]['level']; target: number } | null = null

  if (phase === 'warmup') {
    body = <WarmupScreen steps={program.warmup} onDone={() => setPhase('exercise')} onSkip={() => setPhase('exercise')} />
  } else if (phase === 'finish') {
    body = (
      <FinishScreen
        cooldown={program.cooldown}
        onFinish={async ({ rpe, note, formBreak }) => {
          const out = await finishSession({ sessionId, rpe, note, formBreak, painPatterns })
          return out.messages
        }}
        onDone={onSessionFinished}
      />
    )
  } else if (!current) {
    body = null
  } else if (phase === 'exercise' && current.mode === 'assess') {
    const level = assessAttemptLevelId ? getLevel(current.ladderId, assessAttemptLevelId) : current.level
    const ladder = getLadder(current.ladderId)
    const attemptNumber = logsForCurrent.length + 1
    const target = minTarget(level)
    body = (
      <ExerciseStepCard
        patternName={ladder.name}
        level={level}
        levelNumber={ladder.levels.findIndex((l) => l.id === level.id) + 1}
        totalLevels={ladder.levels.length}
        setLabel={`Attempt ${attemptNumber} · up to level ${ladder.assessmentCap}`}
        target={target}
        unit={unitOf(level)}
        perSide={level.scheme.perSide === true}
        note={current.note}
        assess
        saving={saving}
        onLog={(done) => logCurrentSet(level.id, target, unitOf(level), done, classifyOutcome(done, target))}
      />
    )
  } else if (phase === 'assess-decision' && current) {
    const last = logsForCurrent[logsForCurrent.length - 1]
    const achieved = getLevel(current.ladderId, last.levelId)
    const ladder = getLadder(current.ladderId)
    const next =
      logsForCurrent.length < ladder.assessmentCap
        ? nextProgramLevel(current.ladderId, achieved.id, { week: plan.weekIndex + 1, gatesPassed: profile?.gatesPassed ?? [] })
        : null
    body = (
      <AssessDecisionCard
        patternName={ladder.name}
        achievedLevel={achieved}
        nextLevel={next}
        onTryNext={() => {
          if (!next) return
          setAssessAttemptLevelId(next.id)
          setPhase('exercise')
        }}
        onKeep={advanceToNextExercise}
      />
    )
  } else if (phase === 'exercise' && current) {
    const level = currentLevelFor(current, logsForCurrent)
    const ladder = getLadder(current.ladderId)
    const target = level.id === current.level.id ? current.target : minTarget(level)
    const setNumber = logsForCurrent.length + 1
    tooHardTarget = { level, target }
    body = (
      <ExerciseStepCard
        patternName={ladder.name}
        level={level}
        levelNumber={ladder.levels.findIndex((l) => l.id === level.id) + 1}
        totalLevels={ladder.levels.length}
        setLabel={`Set ${setNumber} of ${current.sets}`}
        target={target}
        unit={unitOf(level)}
        perSide={level.scheme.perSide === true}
        note={current.note}
        assess={false}
        saving={saving}
        onLog={(done) => logCurrentSet(level.id, target, unitOf(level), done, classifyOutcome(done, target))}
        onTooHard={() => setTooHardOpen(true)}
        onTooEasy={() => logCurrentSet(level.id, target, unitOf(level), target, 'too_easy')}
      />
    )
  } else if (phase === 'rest' && current) {
    body = <RestTimer seconds={current.restSec} onDone={advanceAfterRest} />
  }

  const showSafetyBar = phase !== 'finish' && current !== undefined

  return (
    <div>
      {showSafetyBar && (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <Button variant="ghost" size="md" onClick={() => setPainSheetOpen(true)}>
            Pain?
          </Button>
          <div className="flex gap-1">
            <Button variant="ghost" size="md" onClick={() => setEndEarlyOpen(true)}>
              End early
            </Button>
            <Button variant="ghost" size="md" className="text-red-600 dark:text-red-400" onClick={() => setHardStopOpen(true)}>
              Stop — unwell
            </Button>
          </div>
        </div>
      )}
      {body}
      {current && (
        <>
          <PainSheet open={painSheetOpen} onClose={() => setPainSheetOpen(false)} onJointPain={handlePainJoint} />
          <HardStopSheet open={hardStopOpen} onClose={() => setHardStopOpen(false)} onConfirm={handleHardStop} />
          <EndEarlySheet open={endEarlyOpen} onClose={() => setEndEarlyOpen(false)} onConfirm={handleEndEarly} />
          {tooHardTarget && (
            <TooHardSheet
              open={tooHardOpen}
              onClose={() => setTooHardOpen(false)}
              currentLevel={tooHardTarget.level}
              previousLevel={prevProgramLevel(current.ladderId, tooHardTarget.level.id)}
              onConfirm={() => logCurrentSet(tooHardTarget!.level.id, tooHardTarget!.target, unitOf(tooHardTarget!.level), 0, 'fail')}
            />
          )}
        </>
      )}
    </div>
  )
}

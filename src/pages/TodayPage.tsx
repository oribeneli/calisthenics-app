import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { getTodayPlan, startSession } from '../app/coach'
import { program } from '../data/program.ts'
import { db } from '../db/db'
import { useProfile, useTodayCheckin } from '../db/hooks'
import type { PlanOutput } from '../engine/types'
import type { SetLog } from '../db/types'
import { todayKey } from '../lib/dates'
import { Card } from '../components/ui/Card'
import { BlockedCard } from '../components/today/BlockedCard'
import { CheckinBanner } from '../components/today/CheckinBanner'
import { Dashboard } from '../components/today/Dashboard'
import { DoneSummaryCard } from '../components/today/DoneSummaryCard'
import { HabitList } from '../components/checkin/HabitList'
import { RestDayCard } from '../components/today/RestDayCard'
import { ExportReminder } from '../components/today/ExportReminder'
import { SessionPlayer } from '../components/today/SessionPlayer'

export default function TodayPage() {
  const today = todayKey()
  const { profile } = useProfile()
  const checkin = useTodayCheckin()
  const todaySession = useLiveQuery(() => db.sessions.where('date').equals(today).first(), [today])
  const todaySetLogs = useLiveQuery(
    (): Promise<SetLog[]> =>
      todaySession?.id !== undefined ? db.setLogs.where('sessionId').equals(todaySession.id).toArray() : Promise.resolve([]),
    [todaySession?.id],
  )

  const [wantMinimum, setWantMinimum] = useState(false)
  const [plan, setPlan] = useState<PlanOutput | null | undefined>(undefined)
  const [starting, setStarting] = useState(false)
  // Latches onto a session the moment it starts, and keeps the player mounted
  // through finishSession (which flips the row to done/partial) so it can show
  // its own results screen — only onSessionFinished hands control back here.
  const [viewingSessionId, setViewingSessionId] = useState<number | undefined>(undefined)
  // Bumped by every "I'm done looking at this" action (finishing a session,
  // logging a rest day, acknowledging a hard stop) to force a fresh plan —
  // those don't necessarily change any of the effect's other dependencies.
  const [refreshKey, setRefreshKey] = useState(0)
  const refresh = () => setRefreshKey((k) => k + 1)

  useEffect(() => {
    if (todaySession?.status === 'planned' && todaySession.plannedKind !== 'rest' && todaySession.planSnapshot) {
      setViewingSessionId(todaySession.id)
    }
  }, [todaySession?.id, todaySession?.status, todaySession?.plannedKind, todaySession?.planSnapshot])

  useEffect(() => {
    let cancelled = false
    getTodayPlan(today, wantMinimum).then((p) => {
      if (!cancelled) setPlan(p)
    })
    return () => {
      cancelled = true
    }
    // Re-plan whenever today's check-in or session status changes, the short-version
    // toggle flips, or something explicitly asks for a fresh read (see `refresh`).
  }, [today, wantMinimum, checkin, todaySession?.status, refreshKey])

  if (plan === undefined || !profile) return null

  // State F: a session is in progress (or just finished and is showing its
  // results) — the player owns the whole screen until it hands back control.
  if (todaySession && todaySession.id === viewingSessionId && todaySession.planSnapshot) {
    return (
      <SessionPlayer
        session={todaySession}
        onSessionFinished={() => {
          setViewingSessionId(undefined)
          refresh()
        }}
      />
    )
  }

  // State C: a hard stop is pending acknowledgement.
  if (plan && plan.kind === 'blocked') {
    return <BlockedCard onAcknowledged={refresh} />
  }

  const showCheckinBanner = !checkin

  // State B: rest day.
  if (plan && plan.kind === 'rest') {
    const restDone = todaySession?.plannedKind === 'rest' && todaySession.status === 'done'
    return (
      <div className="flex flex-col gap-3">
        {showCheckinBanner && <CheckinBanner />}
        <ExportReminder />
        {restDone ? (
          <Card>
            <h1 className="text-xl font-semibold">Rest day — done</h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Mobility routine logged. See you on your next training day.
            </p>
          </Card>
        ) : (
          <RestDayCard steps={program.restDayMobility} onDone={refresh} />
        )}
        <HabitList date={today} />
      </div>
    )
  }

  // State D: today's session is already logged.
  if (plan && plan.kind === 'done' && todaySession) {
    return (
      <div className="flex flex-col gap-3">
        {showCheckinBanner && <CheckinBanner />}
        <ExportReminder />
        <DoneSummaryCard
          session={todaySession}
          setLogs={todaySetLogs ?? []}
          trainDays={profile.trainDays}
          todayWeekday={new Date().getDay()}
        />
        <HabitList date={today} />
      </div>
    )
  }

  // State E: train / assessment / minimum, not started yet.
  if (plan && (plan.kind === 'train' || plan.kind === 'assessment' || plan.kind === 'minimum')) {
    return (
      <div className="flex flex-col gap-3">
        {showCheckinBanner && <CheckinBanner />}
        <ExportReminder />
        <Dashboard
          plan={plan}
          wantMinimum={wantMinimum}
          onToggleMinimum={() => setWantMinimum((v) => !v)}
          starting={starting}
          onStart={async () => {
            setStarting(true)
            await startSession(plan)
            setStarting(false)
          }}
        />
      </div>
    )
  }

  return null
}

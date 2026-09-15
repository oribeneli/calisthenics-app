import type { Session, SetLog } from '../../db/types'
import { Card } from '../ui/Card'

const WEEKDAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

/** Next scheduled training weekday name after `todayWeekday` (0=Sun..6=Sat). */
function nextTrainWeekdayName(trainDays: number[], todayWeekday: number): string | undefined {
  if (trainDays.length === 0) return undefined
  for (let offset = 1; offset <= 7; offset++) {
    const day = (todayWeekday + offset) % 7
    if (trainDays.includes(day)) return WEEKDAY_NAMES[day]
  }
  return undefined
}

/** State D: plan.kind === 'done' — today's session is already logged. */
export function DoneSummaryCard({
  session,
  setLogs,
  trainDays,
  todayWeekday,
}: {
  session: Session
  setLogs: SetLog[]
  trainDays: number[]
  todayWeekday: number
}) {
  const bullets = (session.adaptationNote ?? '').split(' · ').filter(Boolean)
  const nextDay = nextTrainWeekdayName(trainDays, todayWeekday)

  return (
    <Card>
      <h1 className="text-xl font-semibold">Nice work today</h1>
      <dl className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <dt className="text-xs text-slate-500 dark:text-slate-400">Sets logged</dt>
          <dd className="text-lg font-semibold">{setLogs.length}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500 dark:text-slate-400">RPE</dt>
          <dd className="text-lg font-semibold">{session.rpe ?? '—'}</dd>
        </div>
      </dl>
      {bullets.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            What changed
          </h2>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-200">
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}
      {nextDay && (
        <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">Next session: {nextDay}</p>
      )}
    </Card>
  )
}

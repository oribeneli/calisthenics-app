import type { Session, SetLog } from '../../db/types'
import { Card } from '../ui/Card'
import { SectionLabel } from '../ui/SectionLabel'

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
      <h1 className="text-xl font-semibold text-ink">Nice work today</h1>
      <dl className="mt-3 grid grid-cols-2 gap-3">
        <div>
          <dt className="text-xs text-muted">Sets logged</dt>
          <dd className="num text-2xl text-ink">{setLogs.length}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">RPE</dt>
          <dd className="num text-2xl text-ink">{session.rpe ?? '—'}</dd>
        </div>
      </dl>
      {bullets.length > 0 && (
        <div className="mt-4">
          <SectionLabel>What changed</SectionLabel>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-body">
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}
      {nextDay && <p className="mt-4 text-sm text-body">Next session: {nextDay}</p>}
    </Card>
  )
}

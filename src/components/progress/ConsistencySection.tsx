import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/db'
import { todayKey } from '../../lib/dates'
import { consistency28 } from './stats'

function trainDaysOf(profile: { slots?: { day: number }[]; trainDays: number[] }): number[] {
  if (profile.slots && profile.slots.length > 0) return [...new Set(profile.slots.map((s) => s.day))].sort()
  return profile.trainDays
}

const DOT_CLASSES = {
  done: 'bg-good',
  missed: 'bg-line',
  rest: 'bg-inset',
} as const

export function ConsistencySection() {
  const profile = useLiveQuery(() => db.profile.get('me'), [])
  const sessions = useLiveQuery(() => db.sessions.toArray(), [])

  if (!profile || !sessions) return null

  const result = consistency28(sessions, trainDaysOf(profile), todayKey())

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="num text-[36px] text-ink">{result.pct}%</span>
        <span className="num text-sm text-muted">
          {result.doneCount} of {result.scheduledCount} scheduled sessions, last 28 days
        </span>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {result.dots.map((dot) => (
          <span
            key={dot.date}
            title={dot.date}
            className={`aspect-square max-h-8 rounded-md ${DOT_CLASSES[dot.kind]}`}
          />
        ))}
      </div>

      <p className="num mt-2 text-sm text-body">
        Weeks with 2+ sessions: {result.weeksWithTwoPlus} of {result.totalWeeks}
      </p>
    </div>
  )
}

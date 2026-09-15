import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/db'
import { todayKey } from '../../lib/dates'
import { consistency28 } from './stats'

function trainDaysOf(profile: { slots?: { day: number }[]; trainDays: number[] }): number[] {
  if (profile.slots && profile.slots.length > 0) return [...new Set(profile.slots.map((s) => s.day))].sort()
  return profile.trainDays
}

const DOT_CLASSES = {
  done: 'bg-emerald-500 dark:bg-emerald-500',
  missed: 'bg-slate-300 dark:bg-slate-700',
  rest: 'bg-slate-100 dark:bg-slate-900',
} as const

export function ConsistencySection() {
  const profile = useLiveQuery(() => db.profile.get('me'), [])
  const sessions = useLiveQuery(() => db.sessions.toArray(), [])

  if (!profile || !sessions) return null

  const result = consistency28(sessions, trainDaysOf(profile), todayKey())

  return (
    <div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
          {result.pct}%
        </span>
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {result.doneCount} of {result.scheduledCount} scheduled sessions, last 28 days
        </span>
      </div>

      <div className="mt-3 grid grid-cols-7 gap-1.5">
        {result.dots.map((dot) => (
          <span
            key={dot.date}
            title={dot.date}
            className={`aspect-square rounded-[4px] ${DOT_CLASSES[dot.kind]}`}
          />
        ))}
      </div>

      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
        Weeks with 2+ sessions: {result.weeksWithTwoPlus} of {result.totalWeeks}
      </p>
    </div>
  )
}

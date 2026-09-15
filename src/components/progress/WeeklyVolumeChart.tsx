import { useLiveQuery } from 'dexie-react-hooks'
import { Bar, CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { db } from '../../db/db'
import { parseDateKey, todayKey } from '../../lib/dates'
import { weeklyVolume } from './stats'

function weekLabel(weekStart: string): string {
  return parseDateKey(weekStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function WeeklyVolumeChart() {
  const sessions = useLiveQuery(() => db.sessions.toArray(), [])
  const setLogs = useLiveQuery(() => db.setLogs.toArray(), [])

  if (!sessions || !setLogs) return null

  const points = weeklyVolume(sessions, setLogs, todayKey(), 8).map((p) => ({ ...p, label: weekLabel(p.weekStart) }))

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-slate-500 dark:text-slate-400"
            tickLine={false}
            axisLine={false}
            interval={1}
          />
          <YAxis
            yAxisId="volume"
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-slate-500 dark:text-slate-400"
            tickLine={false}
            axisLine={false}
            width={36}
          />
          <YAxis
            yAxisId="sessions"
            orientation="right"
            allowDecimals={false}
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-slate-500 dark:text-slate-400"
            tickLine={false}
            axisLine={false}
            width={24}
          />
          <Tooltip
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
            formatter={(value: number, name: string) => [value, name === 'volume' ? 'Reps + seconds' : 'Sessions']}
          />
          <Bar yAxisId="volume" dataKey="volume" fill="#0ea5e9" radius={[3, 3, 0, 0]} maxBarSize={14} name="volume" />
          <Bar yAxisId="sessions" dataKey="sessions" fill="#10b981" radius={[3, 3, 0, 0]} maxBarSize={6} name="sessions" />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="mt-1 flex gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-sky-500" /> Reps + seconds logged
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> Sessions
        </span>
      </div>
    </div>
  )
}

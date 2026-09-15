import { useLiveQuery } from 'dexie-react-hooks'
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
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
  const hasVolume = points.some((p) => p.volume > 0)

  if (!hasVolume) {
    return <p className="text-sm text-muted">Log two more sessions to see the trend.</p>
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={points} margin={{ top: 16, right: 4, bottom: 0, left: -4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
            tickLine={false}
            axisLine={false}
            interval={1}
          />
          <YAxis tick={{ fontSize: 12, fill: 'var(--color-muted)' }} tickLine={false} axisLine={false} width={36} />
          <Tooltip
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              backgroundColor: 'var(--color-raised)',
              border: '1px solid var(--color-line)',
              color: 'var(--color-ink)',
            }}
            formatter={(value: number, name: string, item) => [
              `${value} (${item.payload.sessions} session${item.payload.sessions === 1 ? '' : 's'})`,
              name,
            ]}
          />
          <Bar dataKey="volume" fill="var(--color-accent)" radius={[3, 3, 0, 0]} maxBarSize={20} name="Reps + seconds">
            <LabelList
              dataKey="sessions"
              position="top"
              formatter={(v: number) => (v > 0 ? v : '')}
              style={{ fontSize: 11, fill: 'var(--color-muted)' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="num mt-1 text-xs text-muted">Reps + seconds logged per week. Number above a bar is sessions done.</p>
    </div>
  )
}

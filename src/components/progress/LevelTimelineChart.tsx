import { useLiveQuery } from 'dexie-react-hooks'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { program } from '../../data/program'
import { db } from '../../db/db'
import { parseDateKey } from '../../lib/dates'
import { levelTimeline } from './stats'

const COLORS: Record<string, string> = {
  push: '#0ea5e9',
  pull: '#10b981',
  squat: '#f59e0b',
  hinge: '#8b5cf6',
  core: '#f43f5e',
}

function dateLabel(dateKey: string): string {
  return parseDateKey(dateKey).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function LevelTimelineChart() {
  const states = useLiveQuery(() => db.ladderState.toArray(), [])

  if (!states) return null

  const points = levelTimeline(
    states.map((s) => ({ ladderId: s.ladderId, history: s.history })),
    program.ladders,
  ).map((p) => ({ ...p, label: dateLabel(p.date) }))

  const maxLevels = Math.max(...program.ladders.map((l) => l.levels.length))

  if (points.length < 2) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Not enough history yet to chart level changes.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={points} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: 'currentColor' }}
          className="text-slate-500 dark:text-slate-400"
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          domain={[1, maxLevels]}
          allowDecimals={false}
          tick={{ fontSize: 11, fill: 'currentColor' }}
          className="text-slate-500 dark:text-slate-400"
          tickLine={false}
          axisLine={false}
          width={28}
        />
        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {program.ladders.map((ladder) => (
          <Line
            key={ladder.id}
            type="stepAfter"
            dataKey={ladder.id}
            name={ladder.name}
            stroke={COLORS[ladder.id]}
            strokeWidth={2}
            dot={{ r: 2 }}
            connectNulls
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}

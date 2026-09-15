import { useLiveQuery } from 'dexie-react-hooks'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { program } from '../../data/program'
import { db } from '../../db/db'
import { parseDateKey } from '../../lib/dates'
import { levelTimeline } from './stats'

const LINE_STYLE: Record<string, { stroke: string; dash?: string }> = {
  push: { stroke: 'var(--color-accent)' },
  pull: { stroke: 'var(--color-good)' },
  squat: { stroke: 'var(--color-warn)' },
  hinge: { stroke: 'var(--color-muted)' },
  core: { stroke: 'var(--color-accent)', dash: '5 3' },
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
    return <p className="text-sm text-muted">Set or change a ladder level to start charting its history.</p>
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={points} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
          tickLine={false}
          axisLine={false}
          minTickGap={24}
        />
        <YAxis
          domain={[1, maxLevels]}
          allowDecimals={false}
          tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
          tickLine={false}
          axisLine={false}
          width={28}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            borderRadius: 8,
            backgroundColor: 'var(--color-raised)',
            border: '1px solid var(--color-line)',
            color: 'var(--color-ink)',
          }}
        />
        <Legend wrapperStyle={{ fontSize: 11 }} />
        {program.ladders.map((ladder) => (
          <Line
            key={ladder.id}
            type="stepAfter"
            dataKey={ladder.id}
            name={ladder.name}
            stroke={LINE_STYLE[ladder.id].stroke}
            strokeDasharray={LINE_STYLE[ladder.id].dash}
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

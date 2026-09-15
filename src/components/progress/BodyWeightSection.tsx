import { useLiveQuery } from 'dexie-react-hooks'
import { CartesianGrid, Line, ComposedChart, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis } from 'recharts'
import { db } from '../../db/db'
import { parseDateKey } from '../../lib/dates'
import { trailingAverage7 } from './stats'

function dateLabel(dateKey: string): string {
  return parseDateKey(dateKey).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function BodyWeightSection() {
  const checkins = useLiveQuery(() => db.checkins.toArray(), [])

  if (!checkins) return null

  const points = trailingAverage7(checkins).map((p) => ({ ...p, label: dateLabel(p.date) }))

  if (points.length === 0) {
    return (
      <p className="text-sm text-muted">
        No weight entries yet. Log weight on the check-in screen, it is optional.
      </p>
    )
  }

  const latest = points[points.length - 1]
  const first = points[0]
  const change = Math.round((latest.avg7 - first.avg7) * 10) / 10
  const domain = points.flatMap((p) => [p.raw, p.avg7])
  const yMin = Math.floor(Math.min(...domain) - 1)
  const yMax = Math.ceil(Math.max(...domain) + 1)

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span className="num text-[36px] text-ink">{latest.avg7.toFixed(1)} kg</span>
        <span className="text-sm text-muted">7-day average</span>
      </div>
      <p className="num mt-0.5 text-sm text-body">
        {change === 0 ? 'No change' : `${change > 0 ? '+' : ''}${change.toFixed(1)} kg`} since first entry
      </p>

      <ResponsiveContainer width="100%" height={190} className="mt-2">
        <ComposedChart data={points} margin={{ top: 4, right: 8, bottom: 0, left: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
            tickLine={false}
            axisLine={false}
            minTickGap={24}
          />
          <YAxis
            domain={[yMin, yMax]}
            tickCount={4}
            tickFormatter={(v: number) => v.toFixed(1)}
            tick={{ fontSize: 12, fill: 'var(--color-muted)' }}
            tickLine={false}
            axisLine={false}
            width={40}
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
          <Scatter dataKey="raw" fill="var(--color-muted)" fillOpacity={0.5} isAnimationActive={false} name="Daily weight" />
          <Line
            type="monotone"
            dataKey="avg7"
            stroke="var(--color-accent)"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
            name="7-day average"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

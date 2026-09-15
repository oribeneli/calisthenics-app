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
      <p className="text-sm text-slate-500 dark:text-slate-400">
        No weight entries yet. Log weight on the Check-in screen — it&rsquo;s optional.
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
        <span className="text-3xl font-semibold tabular-nums text-slate-900 dark:text-slate-100">
          {latest.avg7.toFixed(1)} kg
        </span>
        <span className="text-sm text-slate-500 dark:text-slate-400">7-day average</span>
      </div>
      <p className="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
        {change === 0 ? 'No change' : `${change > 0 ? '+' : ''}${change.toFixed(1)} kg`} since first entry
      </p>

      <ResponsiveContainer width="100%" height={190} className="mt-2">
        <ComposedChart data={points} margin={{ top: 4, right: 8, bottom: 0, left: -24 }}>
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
            domain={[yMin, yMax]}
            tick={{ fontSize: 11, fill: 'currentColor' }}
            className="text-slate-500 dark:text-slate-400"
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
          <Scatter dataKey="raw" fill="#94a3b8" fillOpacity={0.5} isAnimationActive={false} name="Daily weight" />
          <Line
            type="monotone"
            dataKey="avg7"
            stroke="#0ea5e9"
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

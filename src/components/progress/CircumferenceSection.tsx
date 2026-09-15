import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { NumberStepper } from '../ui/NumberStepper'
import { Sheet } from '../ui/Modal'
import { useToast } from '../ui/toastContext'
import { db } from '../../db/db'
import { parseDateKey, todayKey } from '../../lib/dates'

function dateLabel(dateKey: string): string {
  return parseDateKey(dateKey).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function diffDays(fromKey: string, toKey: string): number {
  return Math.round((parseDateKey(toKey).getTime() - parseDateKey(fromKey).getTime()) / 86_400_000)
}

export function CircumferenceSection() {
  const { showToast } = useToast()
  const rows = useLiveQuery(() => db.bodyMetrics.orderBy('date').toArray(), [])
  const [open, setOpen] = useState(false)
  const latest = rows && rows.length > 0 ? rows[rows.length - 1] : undefined
  const [waist, setWaist] = useState(latest?.waistCm ?? 90)
  const [hip, setHip] = useState(latest?.hipCm ?? 90)
  const [chest, setChest] = useState(latest?.chestCm ?? 90)
  const [arm, setArm] = useState(latest?.armCm ?? 30)

  if (!rows) return null

  const points = rows.map((r) => ({ ...r, label: dateLabel(r.date) }))
  const lastMeasuredDays = latest ? diffDays(latest.date, todayKey()) : undefined
  const torsoValues = points.flatMap((p) => [p.waistCm, p.hipCm, p.chestCm]).filter((v): v is number => v !== undefined)
  const armValues = points.map((p) => p.armCm).filter((v): v is number => v !== undefined)
  const torsoDomain: [number, number] = torsoValues.length
    ? [Math.floor(Math.min(...torsoValues) - 3), Math.ceil(Math.max(...torsoValues) + 3)]
    : [60, 120]
  const armDomain: [number, number] = armValues.length
    ? [Math.floor(Math.min(...armValues) - 3), Math.ceil(Math.max(...armValues) + 3)]
    : [20, 50]

  function openSheet() {
    setWaist(latest?.waistCm ?? 90)
    setHip(latest?.hipCm ?? 90)
    setChest(latest?.chestCm ?? 90)
    setArm(latest?.armCm ?? 30)
    setOpen(true)
  }

  async function save() {
    await db.bodyMetrics.add({ date: todayKey(), waistCm: waist, hipCm: hip, chestCm: chest, armCm: arm })
    setOpen(false)
    showToast('Measurement saved.', 'success')
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          {latest
            ? `Last measured ${lastMeasuredDays === 0 ? 'today' : `${lastMeasuredDays} day${lastMeasuredDays === 1 ? '' : 's'} ago`}`
            : 'No measurements yet'}
          {' '}&middot; suggested every 2 weeks
        </p>
        <Button size="md" onClick={openSheet}>
          Add
        </Button>
      </div>

      {points.length > 0 ? (
        <ResponsiveContainer width="100%" height={200} className="mt-3">
          <LineChart data={points} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
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
              yAxisId="torso"
              domain={torsoDomain}
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-slate-500 dark:text-slate-400"
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <YAxis
              yAxisId="arm"
              orientation="right"
              domain={armDomain}
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-slate-500 dark:text-slate-400"
              tickLine={false}
              axisLine={false}
              width={28}
            />
            <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line yAxisId="torso" type="monotone" dataKey="waistCm" name="Waist" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 2 }} connectNulls isAnimationActive={false} />
            <Line yAxisId="torso" type="monotone" dataKey="hipCm" name="Hip" stroke="#10b981" strokeWidth={2} dot={{ r: 2 }} connectNulls isAnimationActive={false} />
            <Line yAxisId="torso" type="monotone" dataKey="chestCm" name="Chest" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} connectNulls isAnimationActive={false} />
            <Line yAxisId="arm" type="monotone" dataKey="armCm" name="Arm" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 2 }} connectNulls isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Add your first measurement to start the chart.</p>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title="Add measurement">
        <Card className="border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Waist protocol
          </p>
          <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-sm text-slate-600 dark:text-slate-400">
            <li>Tape at the top of the iliac crest (hip bone)</li>
            <li>Keep the tape parallel to the floor, all the way around</li>
            <li>Breathe out normally before reading the tape</li>
          </ol>
        </Card>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <NumberStepper label="Waist (cm)" value={waist} onChange={setWaist} step={0.5} min={0} />
          <NumberStepper label="Hip (cm)" value={hip} onChange={setHip} step={0.5} min={0} />
          <NumberStepper label="Chest (cm)" value={chest} onChange={setChest} step={0.5} min={0} />
          <NumberStepper label="Arm (cm)" value={arm} onChange={setArm} step={0.5} min={0} />
        </div>
        <div className="mt-5 flex flex-col gap-2">
          <Button onClick={save}>Save measurement</Button>
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  )
}

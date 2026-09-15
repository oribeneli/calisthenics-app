import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { NumberStepper } from '../ui/NumberStepper'
import { Sheet } from '../ui/Modal'
import { SectionLabel } from '../ui/SectionLabel'
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
  const tooltipStyle = {
    fontSize: 12,
    borderRadius: 8,
    backgroundColor: 'var(--color-raised)',
    border: '1px solid var(--color-line)',
    color: 'var(--color-ink)',
  }
  const axisTick = { fontSize: 12, fill: 'var(--color-muted)' }

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
        <p className="num text-sm text-body">
          {latest
            ? `Last measured ${lastMeasuredDays === 0 ? 'today' : `${lastMeasuredDays} day${lastMeasuredDays === 1 ? '' : 's'} ago`}`
            : 'No measurements yet'}
          {', suggested every 2 weeks'}
        </p>
        <Button size="md" onClick={openSheet}>
          Add
        </Button>
      </div>

      {points.length > 0 ? (
        <div className="mt-3 flex flex-col gap-4">
          <div>
            <SectionLabel className="text-xs">Waist, hip, chest (cm)</SectionLabel>
            <ResponsiveContainer width="100%" height={170}>
              <LineChart data={points} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
                <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis domain={torsoDomain} tick={axisTick} tickLine={false} axisLine={false} width={32} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="waistCm" name="Waist" stroke="var(--color-accent)" strokeWidth={2} dot={{ r: 2 }} connectNulls isAnimationActive={false} />
                <Line type="monotone" dataKey="hipCm" name="Hip" stroke="var(--color-good)" strokeWidth={2} dot={{ r: 2 }} connectNulls isAnimationActive={false} />
                <Line type="monotone" dataKey="chestCm" name="Chest" stroke="var(--color-muted)" strokeWidth={2} dot={{ r: 2 }} connectNulls isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <SectionLabel className="text-xs">Arm (cm)</SectionLabel>
            <ResponsiveContainer width="100%" height={130}>
              <LineChart data={points} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-line)" vertical={false} />
                <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} minTickGap={24} />
                <YAxis domain={armDomain} tick={axisTick} tickLine={false} axisLine={false} width={32} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="armCm" name="Arm" stroke="var(--color-accent)" strokeWidth={2} dot={{ r: 2 }} connectNulls isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <p className="mt-3 text-sm text-muted">Add your first measurement to start the chart.</p>
      )}

      <Sheet open={open} onClose={() => setOpen(false)} title="Add measurement">
        <Card variant="inset">
          <SectionLabel>Waist protocol</SectionLabel>
          <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-sm text-body">
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

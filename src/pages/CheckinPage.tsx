import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { NumberStepper } from '../components/ui/NumberStepper'
import { Slider1to5 } from '../components/ui/Slider1to5'
import { Toggle } from '../components/ui/Toggle'
import { useToast } from '../components/ui/toastContext'
import { HabitList } from '../components/checkin/HabitList'
import { cn } from '../lib/cn'
import { todayKey } from '../lib/dates'
import { db } from '../db/db'
import { useTodayCheckin } from '../db/hooks'
import type { PatternId } from '../data/types'

const SORE_AREAS: { id: PatternId; label: string }[] = [
  { id: 'push', label: 'Chest & shoulders' },
  { id: 'pull', label: 'Back' },
  { id: 'squat', label: 'Legs' },
  { id: 'hinge', label: 'Hips & hamstrings' },
  { id: 'core', label: 'Core' },
]

const DEFAULT_WEIGHT_KG = 80

export default function CheckinPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const date = todayKey()
  const existing = useTodayCheckin()

  const [sleepHours, setSleepHours] = useState(7)
  const [sleepQuality, setSleepQuality] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [soreness, setSoreness] = useState<1 | 2 | 3 | 4 | 5>(3)
  const [soreAreas, setSoreAreas] = useState<PatternId[]>([])
  const [logWeight, setLogWeight] = useState(false)
  const [weightKg, setWeightKg] = useState(DEFAULT_WEIGHT_KG)

  const lastWeightEntry = useLiveQuery(async () => {
    const rows = await db.checkins.orderBy('date').reverse().toArray()
    return rows.find((c) => c.date < date && c.weightKg !== undefined)
  }, [date])

  const hydrated = useRef(false)
  useEffect(() => {
    if (hydrated.current || !existing) return
    hydrated.current = true
    setSleepHours(existing.sleepHours)
    setSleepQuality(existing.sleepQuality)
    setMood(existing.mood)
    setSoreness(existing.soreness)
    setSoreAreas(existing.soreAreas ?? [])
    if (existing.weightKg !== undefined) {
      setLogWeight(true)
      setWeightKg(existing.weightKg)
    }
  }, [existing])

  function toggleSoreArea(area: PatternId) {
    setSoreAreas((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]))
  }

  function handleLogWeightChange(checked: boolean) {
    setLogWeight(checked)
    if (checked && !existing?.weightKg && lastWeightEntry?.weightKg !== undefined) {
      setWeightKg(lastWeightEntry.weightKg)
    }
  }

  async function handleSave() {
    const payload = {
      date,
      sleepHours,
      sleepQuality,
      mood,
      soreness,
      weightKg: logWeight ? weightKg : undefined,
      soreAreas: soreness >= 4 ? soreAreas : undefined,
    }
    if (existing?.id !== undefined) {
      await db.checkins.update(existing.id, payload)
    } else {
      await db.checkins.add(payload)
    }
    showToast(existing ? 'Check-in updated.' : 'Check-in saved.', 'success')
    navigate('/')
  }

  return (
    <div className="flex flex-col gap-4 pb-2">
      <div>
        <h1 className="text-xl font-semibold">Check-in</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          20 seconds, once a day — it shapes today&rsquo;s plan.
        </p>
      </div>

      <Card className="flex flex-col gap-4">
        <NumberStepper
          label="Sleep (hours)"
          value={sleepHours}
          onChange={setSleepHours}
          min={0}
          max={12}
          step={0.5}
        />
        <Slider1to5
          label="Sleep quality"
          lowLabel="Poor"
          highLabel="Great"
          value={sleepQuality}
          onChange={setSleepQuality}
        />
        <Slider1to5 label="Mood" lowLabel="Low" highLabel="Great" value={mood} onChange={setMood} />
        <Slider1to5
          label="Soreness"
          lowLabel="None"
          highLabel="A lot"
          value={soreness}
          onChange={setSoreness}
        />
        {soreness >= 4 && (
          <div className="flex flex-col gap-2">
            <span className="text-sm text-slate-600 dark:text-slate-400">Where?</span>
            <div className="flex flex-wrap gap-2">
              {SORE_AREAS.map((area) => {
                const active = soreAreas.includes(area.id)
                return (
                  <button
                    key={area.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => toggleSoreArea(area.id)}
                    className={cn(
                      'min-h-12 rounded-xl px-3 text-sm font-medium transition-colors',
                      active
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
                    )}
                  >
                    {area.label}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <Toggle label="Log weight today" checked={logWeight} onChange={handleLogWeightChange} />
        {logWeight ? (
          <NumberStepper value={weightKg} onChange={setWeightKg} min={30} max={250} step={0.1} />
        ) : (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Skipped today
            {lastWeightEntry?.weightKg !== undefined ? ` — last was ${lastWeightEntry.weightKg} kg` : ''}.
          </p>
        )}
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Only the 7-day average is shown on Progress; single days are noise.
        </p>
      </Card>

      <Button onClick={handleSave}>{existing ? 'Update' : 'Save check-in'}</Button>

      <div>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Today&rsquo;s habits</h2>
        <Card className="mt-2">
          <HabitList date={date} />
        </Card>
      </div>
    </div>
  )
}

import { useLiveQuery } from 'dexie-react-hooks'
import { program } from '../../data/program'
import { db } from '../../db/db'
import { addDays, todayKey } from '../../lib/dates'
import { habitRates } from './stats'

const WEEKS = 8

function intensityClass(fraction: number): string {
  if (fraction === 0) return 'bg-slate-100 dark:bg-slate-900'
  if (fraction <= 0.34) return 'bg-sky-200 dark:bg-sky-900'
  if (fraction <= 0.67) return 'bg-sky-400 dark:bg-sky-700'
  return 'bg-sky-600 dark:bg-sky-500'
}

export function HabitsHeatmap() {
  const habits = useLiveQuery(() => db.habits.toArray(), [])

  if (!habits) return null

  const today = todayKey()
  const windowStart = addDays(today, -(WEEKS * 7 - 1))
  const rates = habitRates(habits, program.habits, today)
  const doneSet = new Set(habits.filter((h) => h.done).map((h) => `${h.date}|${h.key}`))

  // 8 week-blocks, oldest first, each 7 days.
  const weekFractions: Record<string, number[]> = {}
  for (const def of program.habits) {
    weekFractions[def.key] = Array.from({ length: WEEKS }, (_, w) => {
      const blockStart = addDays(windowStart, w * 7)
      let done = 0
      for (let d = 0; d < 7; d++) {
        const date = addDays(blockStart, d)
        if (date > today) continue
        if (doneSet.has(`${date}|${def.key}`)) done++
      }
      return done / 7
    })
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px] border-separate border-spacing-1">
          <tbody>
            {program.habits.map((def) => (
              <tr key={def.key}>
                <td className="w-28 pr-2 text-xs text-slate-600 dark:text-slate-400">{def.label}</td>
                {weekFractions[def.key].map((frac, i) => (
                  <td key={i} className="p-0">
                    <span
                      title={`Week ${i + 1}: ${Math.round(frac * 7)}/7 days`}
                      className={`block h-4 w-4 rounded-sm ${intensityClass(frac)}`}
                    />
                  </td>
                ))}
                <td className="pl-2 text-xs tabular-nums text-slate-500 dark:text-slate-400">
                  {rates.find((r) => r.key === def.key)?.pct28}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        Each square is one week (oldest to newest, left to right). Percentage is the last 28 days.
      </p>
    </div>
  )
}

import { useLiveQuery } from 'dexie-react-hooks'
import { Toggle } from '../ui/Toggle'
import { program } from '../../data/program'
import { db } from '../../db/db'

export interface HabitListProps {
  /** 'YYYY-MM-DD' date the habits belong to. */
  date: string
}

/**
 * The six daily habit toggles for a given date. Self-contained: reads and
 * writes db.habits directly (keyed by the &[date+key] unique index), so this
 * can be dropped into both the Check-in and Today screens unchanged.
 */
export function HabitList({ date }: HabitListProps) {
  const rows = useLiveQuery(() => db.habits.where('date').equals(date).toArray(), [date])
  const doneByKey = new Map((rows ?? []).map((r) => [r.key, r.done]))

  async function setDone(key: string, done: boolean) {
    const existing = await db.habits.where('[date+key]').equals([date, key]).first()
    if (existing?.id !== undefined) {
      await db.habits.update(existing.id, { done })
    } else {
      await db.habits.add({ date, key, done })
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {program.habits.map((habit) => (
        <Toggle
          key={habit.key}
          label={habit.label}
          checked={doneByKey.get(habit.key) ?? false}
          onChange={(checked) => setDone(habit.key, checked)}
        />
      ))}
    </div>
  )
}

import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router'
import { db } from '../../db/db'
import { Card } from '../ui/Card'

const DAY_MS = 86_400_000
export const EXPORT_REMINDER_DAYS = 30

/** Shown when no JSON backup has been exported for 30 days (and there is something to lose). */
export function ExportReminder() {
  const state = useLiveQuery(async () => {
    const [last, sessions, profile] = await Promise.all([db.settings.get('lastExportAt'), db.sessions.count(), db.profile.get('me')])
    const lastAt = typeof last?.value === 'string' ? Date.parse(last.value) : NaN
    const since = Number.isNaN(lastAt) ? Date.parse(profile?.onboardedAt ?? '') : lastAt
    const days = Number.isNaN(since) ? 0 : Math.floor((Date.now() - since) / DAY_MS)
    return { due: sessions >= 3 && days >= EXPORT_REMINDER_DAYS, days, never: Number.isNaN(lastAt) }
  }, [])
  if (!state?.due) return null
  return (
    <Card className="border border-amber-300/60 bg-amber-50 dark:border-amber-700/60 dark:bg-amber-950/40">
      <p className="text-sm">
        <span className="font-semibold">Backup reminder.</span>{' '}
        {state.never ? 'No backup has been exported yet.' : `Last backup was ${state.days} days ago.`} Your data lives only on this device.
      </p>
      <Link to="/settings" className="mt-2 inline-block text-sm font-medium text-sky-700 underline dark:text-sky-300">
        Export a backup in Settings
      </Link>
    </Card>
  )
}

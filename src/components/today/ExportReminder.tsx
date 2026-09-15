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
    <Card variant="plain" className="rounded-2xl bg-warn-soft p-4">
      <p className="text-sm text-ink">
        <span className="font-semibold">Backup reminder.</span>{' '}
        {state.never ? 'No backup has been exported yet.' : `Last backup was ${state.days} days ago.`} Your data lives only on this device.
      </p>
      <Link to="/settings" className="mt-2 inline-block text-sm font-medium text-warn underline">
        Export a backup in Settings
      </Link>
    </Card>
  )
}

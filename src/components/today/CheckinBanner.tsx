import { Link } from 'react-router'
import { Card } from '../ui/Card'

/** State A: no check-in logged yet today. The plan still renders below with default assumptions. */
export function CheckinBanner() {
  return (
    <Link to="/checkin">
      <Card className="flex items-center justify-between gap-3 border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/40">
        <div>
          <p className="text-sm font-semibold text-sky-700 dark:text-sky-400">20-second check-in</p>
          <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-400">
            Today's plan below assumes a normal night — tell us how you slept and feel to fine-tune it.
          </p>
        </div>
        <span aria-hidden="true" className="text-xl text-sky-600 dark:text-sky-400">
          →
        </span>
      </Card>
    </Link>
  )
}

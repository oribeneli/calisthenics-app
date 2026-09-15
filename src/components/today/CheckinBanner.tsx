import { Link } from 'react-router'
import { Card } from '../ui/Card'

/** State A: no check-in logged yet today. The plan still renders below with default assumptions. */
export function CheckinBanner() {
  return (
    <Link to="/checkin">
      <Card variant="inset" className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">20-second check-in</p>
          <p className="mt-0.5 text-xs text-body">
            Today's plan below assumes a normal night. Tell us how you slept and feel to fine-tune it.
          </p>
        </div>
        <span aria-hidden="true" className="text-xl text-muted">
          →
        </span>
      </Card>
    </Link>
  )
}

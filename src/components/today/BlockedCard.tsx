import { useState } from 'react'
import { setHardStop } from '../../app/coach'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { StickyBottomBar } from './StickyBottomBar'

/** State C: plan.kind === 'blocked' — a hard stop is pending acknowledgement. Non-dismissable. */
export function BlockedCard({ onAcknowledged }: { onAcknowledged: () => void }) {
  const [saving, setSaving] = useState(false)

  const confirm = async () => {
    setSaving(true)
    await setHardStop(false)
    onAcknowledged()
  }

  return (
    <>
      <Card className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/40">
        <h1 className="text-xl font-semibold text-red-700 dark:text-red-400">Before you train again</h1>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
          You flagged something during your last session that's worth taking seriously.
        </p>
        <p className="mt-3 text-sm font-medium text-slate-800 dark:text-slate-100">
          Stop and seek medical care if you notice any of:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700 dark:text-slate-200">
          <li>Chest pain or pressure</li>
          <li>Faintness or dizziness</li>
          <li>Cold sweat</li>
          <li>Breathlessness that feels out of proportion to the effort</li>
        </ul>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          If none of that applies and you feel fine now, you can continue whenever you're ready.
        </p>
      </Card>
      <StickyBottomBar>
        <Button className="w-full" onClick={confirm} disabled={saving}>
          I'm okay, continue
        </Button>
      </StickyBottomBar>
    </>
  )
}

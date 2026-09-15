import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { StickyBottomBar } from './StickyBottomBar'

/** Session flow step 3: full-width rest countdown; auto-advances at 0. */
export function RestTimer({ seconds, onDone }: { seconds: number; onDone: () => void }) {
  const [remaining, setRemaining] = useState(seconds)

  useEffect(() => {
    setRemaining(seconds)
  }, [seconds])

  useEffect(() => {
    if (remaining <= 0) {
      if (navigator.vibrate) navigator.vibrate(200)
      onDone()
      return
    }
    const id = window.setInterval(() => setRemaining((r) => r - 1), 1000)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remaining])

  return (
    <>
      <Card className="flex flex-col items-center py-10">
        <p className="text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Rest</p>
        <p className="mt-2 text-6xl font-bold tabular-nums">{remaining}</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">seconds</p>
      </Card>
      <StickyBottomBar>
        <div className="flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setRemaining((r) => r + 15)}>
            +15 s
          </Button>
          <Button variant="secondary" className="flex-1" onClick={onDone}>
            Skip
          </Button>
        </div>
      </StickyBottomBar>
    </>
  )
}

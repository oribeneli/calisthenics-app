import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { ProgressRing } from '../ui/ProgressRing'
import { SectionLabel } from '../ui/SectionLabel'
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
        <SectionLabel className="mb-2">Rest</SectionLabel>
        <ProgressRing progress={seconds > 0 ? remaining / seconds : 0} size={200}>
          <span className="num text-5xl text-ink">{remaining}</span>
          <span className="text-sm text-muted">seconds</span>
        </ProgressRing>
      </Card>
      <StickyBottomBar>
        <div className="flex gap-2">
          <Button variant="secondary" size="xl" className="flex-1" onClick={() => setRemaining((r) => r + 15)}>
            +15 s
          </Button>
          <Button variant="secondary" size="xl" className="flex-1" onClick={onDone}>
            Skip
          </Button>
        </div>
      </StickyBottomBar>
    </>
  )
}

import type { Level } from '../../data/types'
import { Button } from '../ui/Button'
import { Sheet } from '../ui/Modal'

/** Confirms swapping the rest of this exercise to an easier level. */
export function TooHardSheet({
  open,
  onClose,
  currentLevel,
  previousLevel,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  currentLevel: Level
  previousLevel: Level | null
  onConfirm: () => void
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Switch to an easier level?">
      <p className="text-sm text-slate-600 dark:text-slate-300">
        {previousLevel
          ? `The rest of ${currentLevel.name} today will use ${previousLevel.name} instead. This is just today's setting — it doesn't erase your progress.`
          : `${currentLevel.name} is already the easiest version of this move. The rest of today, just do fewer reps.`}
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <Button
          className="w-full"
          onClick={() => {
            onConfirm()
            onClose()
          }}
        >
          {previousLevel ? `Switch to ${previousLevel.name}` : 'Okay, fewer reps'}
        </Button>
        <Button variant="ghost" className="w-full" onClick={onClose}>
          Cancel
        </Button>
      </div>
    </Sheet>
  )
}

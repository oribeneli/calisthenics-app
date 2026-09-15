import { Button } from '../ui/Button'
import { Sheet } from '../ui/Modal'

/** "Pain?" ghost button target. Muscle ache is normal and needs no action; joint/sharp pain ends this exercise. */
export function PainSheet({
  open,
  onClose,
  onJointPain,
}: {
  open: boolean
  onClose: () => void
  onJointPain: () => void
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Where does it hurt?">
      <div className="flex flex-col gap-3">
        <button type="button" onClick={onClose} className="min-h-14 rounded-xl bg-inset p-3 text-left">
          <span className="block text-sm font-medium text-ink">Muscle ache</span>
          <span className="block text-xs text-muted">Normal, keep going as planned.</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onJointPain()
            onClose()
          }}
          className="min-h-14 rounded-xl bg-danger-soft p-3 text-left"
        >
          <span className="block text-sm font-medium text-danger">Joint or sharp pain</span>
          <span className="block text-xs text-ink">We'll stop this exercise now and move on to the next one.</span>
        </button>
      </div>
      <Button variant="ghost" size="xl" className="mt-4 w-full" onClick={onClose}>
        Never mind
      </Button>
    </Sheet>
  )
}

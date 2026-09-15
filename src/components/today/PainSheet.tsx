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
        <button
          type="button"
          onClick={onClose}
          className="min-h-14 rounded-xl bg-slate-100 p-3 text-left dark:bg-slate-800"
        >
          <span className="block text-sm font-medium">Muscle ache</span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">Normal — keep going as planned.</span>
        </button>
        <button
          type="button"
          onClick={() => {
            onJointPain()
            onClose()
          }}
          className="min-h-14 rounded-xl bg-red-50 p-3 text-left dark:bg-red-950/40"
        >
          <span className="block text-sm font-medium text-red-700 dark:text-red-400">Joint or sharp pain</span>
          <span className="block text-xs text-slate-500 dark:text-slate-400">
            We'll stop this exercise now and move on to the next one.
          </span>
        </button>
      </div>
      <Button variant="ghost" className="mt-4 w-full" onClick={onClose}>
        Never mind
      </Button>
    </Sheet>
  )
}

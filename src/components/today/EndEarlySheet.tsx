import { Button } from '../ui/Button'
import { Sheet } from '../ui/Modal'

/** Confirms ending the session before all exercises are done. */
export function EndEarlySheet({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="End the session here?">
      <p className="text-sm text-body">Stopping early still counts.</p>
      <div className="mt-4 flex flex-col gap-2">
        <Button
          size="xl"
          className="w-full"
          onClick={() => {
            onConfirm()
            onClose()
          }}
        >
          End session
        </Button>
        <Button variant="ghost" size="xl" className="w-full" onClick={onClose}>
          Keep going
        </Button>
      </div>
    </Sheet>
  )
}

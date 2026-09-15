import { Button } from '../ui/Button'
import { Sheet } from '../ui/Modal'

/** "Stop, I feel unwell" target. Confirms the medical hard-stop and ends the session. */
export function HardStopSheet({ open, onClose, onConfirm }: { open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} title="Stop training now?">
      <p className="text-sm text-body">
        If you're noticing chest pain, faintness, a cold sweat, or breathlessness that feels out of proportion to the
        effort, stop now and seek care if it doesn't pass quickly.
      </p>
      <div className="mt-4 flex flex-col gap-2">
        <Button
          variant="danger"
          size="xl"
          className="w-full"
          onClick={() => {
            onConfirm()
            onClose()
          }}
        >
          Stop the session
        </Button>
        <Button variant="ghost" size="xl" className="w-full" onClick={onClose}>
          I'm okay, keep going
        </Button>
      </div>
    </Sheet>
  )
}

import { Card } from '../components/ui/Card'

export default function CheckinPage() {
  return (
    <Card>
      <h1 className="text-xl font-semibold">Check-in</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        A 20-second daily log of sleep, mood, soreness and weight.
      </p>
    </Card>
  )
}

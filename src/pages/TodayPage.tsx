import { Card } from '../components/ui/Card'

export default function TodayPage() {
  return (
    <Card>
      <h1 className="text-xl font-semibold">Today</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Your session for today, adapted to how you slept and feel.
      </p>
    </Card>
  )
}

import { useParams } from 'react-router'
import { Card } from '../components/ui/Card'

export default function LadderPage() {
  const { ladderId } = useParams<{ ladderId: string }>()

  return (
    <Card>
      <h1 className="text-xl font-semibold">Ladder: {ladderId}</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Levels, form cues, and advance/regress rules for this movement.
      </p>
    </Card>
  )
}

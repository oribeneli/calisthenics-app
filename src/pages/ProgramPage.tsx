import { useLiveQuery } from 'dexie-react-hooks'
import { Link } from 'react-router'
import { LadderRow } from '../components/program/LadderRow'
import { RoutineList } from '../components/program/RoutineList'
import { Card } from '../components/ui/Card'
import { db } from '../db/db'
import { program } from '../data/program'

export default function ProgramPage() {
  const states = useLiveQuery(() => db.ladderState.toArray(), [])
  const currentLevelId = new Map((states ?? []).map((s) => [s.ladderId, s.currentLevelId]))

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Program</h1>

      <Card>
        <Link to="/program/why" className="pressable flex items-center justify-between gap-2">
          <span className="font-medium text-accent">Why this program</span>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent"
            aria-hidden="true"
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
        </Link>
        <div className="num mt-3 space-y-1 text-sm text-body">
          <p>3 sessions a week, 20-25 min each</p>
          <p>Every other day, three fixed day + time + place slots</p>
          <p>1 set to start, up to 3 sets by week 4</p>
        </div>
      </Card>

      <Card className="flex flex-col divide-y divide-line">
        {program.ladders.map((ladder) => (
          <div key={ladder.id} className="py-1 first:pt-0 last:pb-0">
            <LadderRow ladder={ladder} currentLevelId={currentLevelId.get(ladder.id)} />
          </div>
        ))}
      </Card>

      <Card className="flex flex-col divide-y divide-line">
        <div className="pb-3">
          <RoutineList title="Warm-up" steps={program.warmup} />
        </div>
        <div className="py-3">
          <RoutineList title="Cool-down" steps={program.cooldown} />
        </div>
        <div className="pt-3">
          <RoutineList title="Rest-day mobility" steps={program.restDayMobility} />
        </div>
      </Card>
    </div>
  )
}

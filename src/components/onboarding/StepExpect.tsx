import { Card } from '../ui/Card'
import { program } from '../../data/program'

export function StepExpect() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold">What to expect</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          Three things worth knowing before your first session.
        </p>
      </div>

      <Card>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          The session shape
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          A 4-minute warm-up, then five patterns — push, pull, squat, hinge, core — for a total of
          20–25 minutes.
        </p>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Week 0 is a find-your-level week
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          One easy set of each pattern. Step up to the next level only once a level feels easy —
          there&rsquo;s no rush.
        </p>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          Six daily habits
        </h2>
        <ul className="mt-2 flex flex-col gap-2">
          {program.habits.map((h) => (
            <li key={h.key} className="text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium text-slate-900 dark:text-slate-100">{h.label}</span>
              {' — '}
              {h.why}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}

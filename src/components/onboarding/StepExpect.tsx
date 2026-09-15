import { Card } from '../ui/Card'
import { program } from '../../data/program'

export function StepExpect() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">What to expect</h1>
        <p className="mt-1 text-sm text-body">Three things worth knowing before your first session.</p>
      </div>

      <Card className="divide-y divide-line">
        <div className="pb-4">
          <h2 className="text-base font-semibold text-ink">The session shape</h2>
          <p className="mt-1 text-sm text-body">
            A 4-minute warm-up, then five patterns, push, pull, squat, hinge, core, for a total of 20–25 minutes.
          </p>
        </div>

        <div className="py-4">
          <h2 className="text-base font-semibold text-ink">Week 0 is a find-your-level week</h2>
          <p className="mt-1 text-sm text-body">
            One easy set of each pattern. Step up to the next level only once a level feels easy, there&rsquo;s no
            rush.
          </p>
        </div>

        <div className="pt-4">
          <h2 className="text-base font-semibold text-ink">Six daily habits</h2>
          <ul className="mt-2 flex flex-col gap-2">
            {program.habits.map((h) => (
              <li key={h.key} className="text-sm text-body">
                <span className="font-medium text-ink">{h.label}</span>, {h.why}
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  )
}

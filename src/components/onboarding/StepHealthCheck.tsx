import { Card } from '../ui/Card'
import { program } from '../../data/program'
import { screeningVerdict } from './screening'
import { SegmentedYesNo } from './SegmentedYesNo'
import type { OnboardingDraft } from './types'

export interface StepHealthCheckProps {
  draft: OnboardingDraft
  onChange: (patch: Partial<OnboardingDraft>) => void
}

export function StepHealthCheck({ draft, onChange }: StepHealthCheckProps) {
  const verdict = screeningVerdict(draft.screening, program.screening)

  function setAnswer(id: string, value: boolean) {
    onChange({ screening: { ...draft.screening, [id]: value } })
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">Health check</h1>
        <p className="mt-1 text-sm text-body">The PAR-Q+ readiness questions, plus a few we add for this program.</p>
      </div>

      {verdict.blocked && (
        <Card variant="plain" className="rounded-2xl bg-danger-soft p-4">
          <h2 className="text-base font-semibold text-danger">See a doctor before starting</h2>
          <p className="mt-1 text-sm text-ink">You answered yes to:</p>
          <ul className="mt-1 list-disc pl-5 text-sm text-ink">
            {verdict.hardHits.map((q) => (
              <li key={q.id}>{q.text}</li>
            ))}
          </ul>
          <p className="mt-2 text-sm text-ink">
            Get clearance first, this is about that specific answer, not about your weight or fitness level. Body
            weight alone is never a reason to wait. You can flip the answer back once you&rsquo;ve checked with a
            doctor, or once you have their go-ahead.
          </p>
        </Card>
      )}

      <Card className="divide-y divide-line">
        {program.screening.map((q) => {
          const answer = draft.screening[q.id]
          return (
            <div key={q.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
              <p className="text-sm text-ink">{q.text}</p>
              <SegmentedYesNo value={answer} onChange={(v) => setAnswer(q.id, v)} ariaLabel={q.text} />
              {answer === true && q.gate === 'soft' && (
                <p className="rounded-lg bg-warn-soft p-2 text-xs text-ink">
                  Worth getting clearance from a doctor before starting.
                </p>
              )}
              {answer === true && q.gate === 'advisory' && (
                <p className="text-xs text-muted">
                  Worth mentioning next time you see a doctor. This alone won&rsquo;t change your program.
                </p>
              )}
              {answer === true && q.gate === 'adapt' && q.note && (
                <p className="rounded-lg bg-warn-soft p-2 text-xs text-ink">{q.note}</p>
              )}
            </div>
          )
        })}
      </Card>

      <p className="text-xs text-muted">
        If you feel unwell today, or think you might be pregnant, hold off starting until you&rsquo;ve spoken with a
        doctor.
      </p>
      <p className="text-xs text-muted">
        Not medical advice. A hypermobile shoulder with symptomatic winging is worth one physiotherapy assessment
        before starting.
      </p>
    </div>
  )
}

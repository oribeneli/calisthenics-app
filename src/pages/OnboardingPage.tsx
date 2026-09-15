import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { Button } from '../components/ui/Button'
import { ProgressSteps } from '../components/onboarding/ProgressSteps'
import { StepAboutYou } from '../components/onboarding/StepAboutYou'
import { StepHealthCheck } from '../components/onboarding/StepHealthCheck'
import { StepSlots } from '../components/onboarding/StepSlots'
import { StepExpect } from '../components/onboarding/StepExpect'
import { constraintsFromAdaptHits, screeningVerdict } from '../components/onboarding/screening'
import { deriveTrainDays } from '../components/onboarding/slots'
import { defaultDraft, type OnboardingDraft } from '../components/onboarding/types'
import { program } from '../data/program'
import { db } from '../db/db'
import { useProfile } from '../db/hooks'
import { todayKey } from '../lib/dates'

const STEP_LABELS = ['About you', 'Health check', 'Your slots', 'What to expect']
const TOTAL_STEPS = STEP_LABELS.length

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { loading, profile } = useProfile()
  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<OnboardingDraft>(defaultDraft)
  const hydrated = useRef(false)

  // Re-screen case: prefill from the existing profile once, the first time it loads.
  useEffect(() => {
    if (loading || hydrated.current) return
    hydrated.current = true
    if (!profile) return
    setDraft({
      name: profile.name,
      sex: profile.sex,
      birthYear: profile.birthYear,
      heightCm: profile.heightCm,
      weightKg: profile.startWeightKg,
      screening: profile.screening ?? {},
      slots: profile.slots ?? defaultDraft().slots,
    })
  }, [loading, profile])

  const verdict = screeningVerdict(draft.screening, program.screening)
  const nextDisabled = step === 2 && verdict.blocked

  function update(patch: Partial<OnboardingDraft>) {
    setDraft((prev) => ({ ...prev, ...patch }))
  }

  async function finish() {
    const heightM = draft.heightCm / 100
    const goalWeightKg = Math.round(25 * heightM * heightM * 10) / 10
    await db.profile.put({
      id: 'me',
      name: draft.name,
      sex: draft.sex,
      birthYear: draft.birthYear,
      heightCm: draft.heightCm,
      startWeightKg: draft.weightKg,
      trainDays: deriveTrainDays(draft.slots),
      sessionMinutes: 25,
      trainTime: draft.slots[0]?.time ?? '19:30',
      constraints: constraintsFromAdaptHits(verdict.adaptHits),
      notes: profile?.notes ?? '',
      createdAt: profile?.createdAt ?? todayKey(),
      onboardedAt: new Date().toISOString(),
      slots: draft.slots,
      screening: draft.screening,
      gatesPassed: profile?.gatesPassed ?? [],
      goalWeightKg,
      stepBaseline: profile?.stepBaseline,
    })
    navigate('/')
  }

  if (loading) return null

  return (
    <div className="flex flex-col gap-4 pb-2">
      <ProgressSteps step={step} total={TOTAL_STEPS} label={STEP_LABELS[step - 1]} />

      {step === 1 && <StepAboutYou draft={draft} onChange={update} />}
      {step === 2 && <StepHealthCheck draft={draft} onChange={update} />}
      {step === 3 && <StepSlots draft={draft} onChange={update} />}
      {step === 4 && <StepExpect />}

      <div className="flex gap-2">
        {step > 1 && (
          <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
            Back
          </Button>
        )}
        {step < TOTAL_STEPS ? (
          <Button className="flex-1" disabled={nextDisabled} onClick={() => setStep((s) => s + 1)}>
            Next
          </Button>
        ) : (
          <Button className="flex-1" onClick={finish}>
            Start
          </Button>
        )}
      </div>
    </div>
  )
}

import { Card } from '../components/ui/Card'

export default function OnboardingPage() {
  return (
    <Card>
      <h1 className="text-xl font-semibold">Onboarding</h1>
      <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
        Collects your profile and starting levels before your first session.
      </p>
    </Card>
  )
}

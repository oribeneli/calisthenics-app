import { BodyWeightSection } from '../components/progress/BodyWeightSection'
import { CircumferenceSection } from '../components/progress/CircumferenceSection'
import { ConsistencySection } from '../components/progress/ConsistencySection'
import { HabitsHeatmap } from '../components/progress/HabitsHeatmap'
import { LevelHeadline } from '../components/progress/LevelHeadline'
import { LevelTimelineChart } from '../components/progress/LevelTimelineChart'
import { PhotosSection } from '../components/progress/PhotosSection'
import { WeeklyVolumeChart } from '../components/progress/WeeklyVolumeChart'
import { Card } from '../components/ui/Card'

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
      {children}
    </h2>
  )
}

export default function ProgressPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold">Progress</h1>

      <Card>
        <SectionTitle>Levels</SectionTitle>
        <LevelHeadline />
      </Card>

      <Card>
        <SectionTitle>Consistency</SectionTitle>
        <ConsistencySection />
      </Card>

      <Card>
        <SectionTitle>Weekly volume</SectionTitle>
        <WeeklyVolumeChart />
      </Card>

      <Card>
        <SectionTitle>Level over time</SectionTitle>
        <LevelTimelineChart />
      </Card>

      <Card>
        <SectionTitle>Body weight</SectionTitle>
        <BodyWeightSection />
      </Card>

      <Card>
        <SectionTitle>Circumferences</SectionTitle>
        <CircumferenceSection />
      </Card>

      <Card>
        <SectionTitle>Progress photos</SectionTitle>
        <PhotosSection />
      </Card>

      <Card>
        <SectionTitle>Habits</SectionTitle>
        <HabitsHeatmap />
      </Card>
    </div>
  )
}

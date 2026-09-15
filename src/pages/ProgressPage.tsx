import { BodyWeightSection } from '../components/progress/BodyWeightSection'
import { CircumferenceSection } from '../components/progress/CircumferenceSection'
import { ConsistencySection } from '../components/progress/ConsistencySection'
import { HabitsHeatmap } from '../components/progress/HabitsHeatmap'
import { LevelHeadline } from '../components/progress/LevelHeadline'
import { LevelTimelineChart } from '../components/progress/LevelTimelineChart'
import { PhotosSection } from '../components/progress/PhotosSection'
import { WeeklyVolumeChart } from '../components/progress/WeeklyVolumeChart'
import { Card } from '../components/ui/Card'
import { SectionLabel } from '../components/ui/SectionLabel'

export default function ProgressPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-ink">Progress</h1>

      <Card>
        <SectionLabel className="mb-3">Levels</SectionLabel>
        <LevelHeadline />
      </Card>

      <Card>
        <SectionLabel className="mb-3">Consistency</SectionLabel>
        <ConsistencySection />
      </Card>

      <Card>
        <SectionLabel className="mb-3">Weekly volume</SectionLabel>
        <WeeklyVolumeChart />
      </Card>

      <Card>
        <SectionLabel className="mb-3">Level over time</SectionLabel>
        <LevelTimelineChart />
      </Card>

      <Card>
        <SectionLabel className="mb-3">Body weight</SectionLabel>
        <BodyWeightSection />
      </Card>

      <Card>
        <SectionLabel className="mb-3">Circumferences</SectionLabel>
        <CircumferenceSection />
      </Card>

      <Card>
        <SectionLabel className="mb-3">Progress photos</SectionLabel>
        <PhotosSection />
      </Card>

      <Card>
        <SectionLabel className="mb-3">Habits</SectionLabel>
        <HabitsHeatmap />
      </Card>
    </div>
  )
}

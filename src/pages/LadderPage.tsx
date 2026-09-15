import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { Navigate, useParams } from 'react-router'
import { LevelCard } from '../components/program/LevelCard'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Sheet } from '../components/ui/Modal'
import { SectionLabel } from '../components/ui/SectionLabel'
import { useToast } from '../components/ui/toastContext'
import { setLadderLevel } from '../app/coach'
import { program } from '../data/program'
import type { Level, PatternId } from '../data/types'
import { db } from '../db/db'
import { weekIndexOf } from '../engine/week'
import { schemeFloor } from '../components/program/format'
import { todayKey } from '../lib/dates'

export default function LadderPage() {
  const { ladderId } = useParams<{ ladderId: string }>()
  const { showToast } = useToast()
  const [pendingLevel, setPendingLevel] = useState<Level | null>(null)

  const profile = useLiveQuery(() => db.profile.get('me'), [])
  const state = useLiveQuery(() => (ladderId ? db.ladderState.get(ladderId) : undefined), [ladderId])

  const ladder = program.ladders.find((l) => l.id === ladderId)
  if (!ladder) return <Navigate to="/program" replace />

  const currentWeek = profile?.onboardedAt ? weekIndexOf(profile.onboardedAt.slice(0, 10), todayKey()) + 1 : 1
  const gatesPassed = profile?.gatesPassed ?? []

  async function toggleGate(key: string) {
    if (!profile) return
    const has = gatesPassed.includes(key)
    const next = has ? gatesPassed.filter((k) => k !== key) : [...gatesPassed, key]
    await db.profile.update('me', { gatesPassed: next })
  }

  async function confirmSetLevel() {
    if (!pendingLevel || !ladder) return
    await setLadderLevel(ladder.id as PatternId, pendingLevel.id, schemeFloor(pendingLevel.scheme), 'manual')
    showToast(`Set to ${pendingLevel.name}.`, 'success')
    setPendingLevel(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-ink">{ladder.name}</h1>
        <p className="mt-1 text-sm text-body">{ladder.rationale}</p>
      </div>

      {ladder.ceilingNote && (
        <div className="rounded-2xl bg-warn-soft p-4">
          <p className="text-sm text-warn">{ladder.ceilingNote}</p>
        </div>
      )}

      {ladder.specialRegress.length > 0 && (
        <Card>
          <SectionLabel>Special regression triggers</SectionLabel>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-body">
            {ladder.specialRegress.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="flex flex-col divide-y divide-line">
        {ladder.levels.map((level, index) => (
          <div key={level.id} className="py-3 first:pt-0 last:pb-0">
            <LevelCard
              level={level}
              index={index}
              isCurrent={state?.currentLevelId === level.id}
              currentWeek={currentWeek}
              gatePassed={level.gate ? gatesPassed.includes(level.gate.key) : false}
              onToggleGate={toggleGate}
              onSetLevel={() => setPendingLevel(level)}
            />
          </div>
        ))}
      </Card>

      <Sheet open={pendingLevel !== null} onClose={() => setPendingLevel(null)} title="Set as my level?">
        <p className="text-sm text-body">
          This sets {ladder.name} to <span className="font-medium text-ink">{pendingLevel?.name}</span>. Your rep
          target resets to the bottom of that level&rsquo;s range.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Button onClick={confirmSetLevel}>Confirm</Button>
          <Button variant="secondary" onClick={() => setPendingLevel(null)}>
            Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  )
}

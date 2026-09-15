import { useLiveQuery } from 'dexie-react-hooks'
import { program } from '../../data/program'
import { db } from '../../db/db'
import { parseDateKey, todayKey } from '../../lib/dates'

function diffDays(fromKey: string, toKey: string): number {
  const ms = parseDateKey(toKey).getTime() - parseDateKey(fromKey).getTime()
  return Math.round(ms / 86_400_000)
}

const SEGMENTS = 10

function LevelBar({ current, total }: { current: number; total: number }) {
  const filled = Math.round((current / total) * SEGMENTS)
  return (
    <div className="flex gap-0.5" role="img" aria-label={`Level ${current} of ${total}`}>
      {Array.from({ length: SEGMENTS }, (_, i) => (
        <span key={i} className={i < filled ? 'h-1.5 flex-1 rounded-full bg-accent' : 'h-1.5 flex-1 rounded-full bg-line'} />
      ))}
    </div>
  )
}

export function LevelHeadline() {
  const states = useLiveQuery(() => db.ladderState.toArray(), [])
  const profile = useLiveQuery(() => db.profile.get('me'), [])

  if (!states) return null

  const today = todayKey()
  const fallbackStart = profile?.onboardedAt?.slice(0, 10) ?? today

  return (
    <div className="flex flex-col gap-4">
      {program.ladders.map((ladder) => {
        const state = states.find((s) => s.ladderId === ladder.id)
        const total = ladder.levels.length
        if (!state) {
          return (
            <div key={ladder.id}>
              <p className="text-sm text-muted">{ladder.name}: not started yet</p>
            </div>
          )
        }
        const startEntry = state.history[0]
        const startLevelId = startEntry?.levelId ?? state.currentLevelId
        const startIndex = ladder.levels.findIndex((l) => l.id === startLevelId)
        const currentIndex = ladder.levels.findIndex((l) => l.id === state.currentLevelId)
        const weeks = Math.max(0, Math.floor(diffDays(startEntry?.date ?? fallbackStart, today) / 7))
        const startNum = Math.max(1, startIndex + 1)
        const currentNum = Math.max(1, currentIndex + 1)

        return (
          <div key={ladder.id} className="flex items-center gap-3">
            <span className="num w-11 shrink-0 text-right text-[24px] text-ink">L{currentNum}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-body">
                <span className="font-medium text-ink">{ladder.name}</span>{' '}
                {startNum === currentNum ? (
                  <>{weeks === 0 ? 'started this week' : `${weeks} week${weeks === 1 ? '' : 's'} in`}</>
                ) : (
                  <>
                    level {startNum} to {currentNum} in {weeks} week{weeks === 1 ? '' : 's'}
                  </>
                )}
              </p>
              <div className="mt-1.5">
                <LevelBar current={currentNum} total={total} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

import { Link } from 'react-router'
import type { Ladder } from '../../data/types'
import { formatScheme } from './format'

export function LadderRow({ ladder, currentLevelId }: { ladder: Ladder; currentLevelId: string | undefined }) {
  const index = currentLevelId ? ladder.levels.findIndex((l) => l.id === currentLevelId) : -1
  const level = index >= 0 ? ladder.levels[index] : ladder.levels[0]
  const levelNumber = index >= 0 ? index + 1 : 1

  return (
    <Link
      to={`/program/${ladder.id}`}
      className="pressable flex min-h-14 items-center gap-3 rounded-xl px-1 py-2 hover:bg-inset active:bg-line/60"
    >
      <div className="min-w-0 flex-1">
        <p className="font-medium text-ink">{ladder.name}</p>
        <p className="num truncate text-sm text-body">
          L{levelNumber} of {ladder.levels.length}, {level.name}
        </p>
        <p className="num text-xs text-muted">{formatScheme(level.scheme)}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted">{ladder.rationale}</p>
      </div>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 text-muted"
        aria-hidden="true"
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
    </Link>
  )
}

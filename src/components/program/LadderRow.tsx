import { Link } from 'react-router'
import type { Ladder } from '../../data/types'
import { formatScheme } from './format'

function firstSentence(text: string): string {
  const match = text.match(/^[^.]+\./)
  return match ? match[0] : text
}

export function LadderRow({ ladder, currentLevelId }: { ladder: Ladder; currentLevelId: string | undefined }) {
  const index = currentLevelId ? ladder.levels.findIndex((l) => l.id === currentLevelId) : -1
  const level = index >= 0 ? ladder.levels[index] : ladder.levels[0]
  const levelNumber = index >= 0 ? index + 1 : 1

  return (
    <Link
      to={`/program/${ladder.id}`}
      className="flex min-h-14 items-center gap-3 rounded-xl px-1 py-2 hover:bg-slate-100 active:bg-slate-200 dark:hover:bg-slate-800/60 dark:active:bg-slate-800"
    >
      <div className="min-w-0 flex-1">
        <p className="font-medium text-slate-900 dark:text-slate-100">{ladder.name}</p>
        <p className="truncate text-sm text-slate-600 dark:text-slate-400">
          L{levelNumber} of {ladder.levels.length} — {level.name}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{formatScheme(level.scheme)}</p>
        <p className="mt-0.5 text-xs italic text-slate-500 dark:text-slate-500">{firstSentence(ladder.rationale)}</p>
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
        className="shrink-0 text-slate-400"
        aria-hidden="true"
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
    </Link>
  )
}

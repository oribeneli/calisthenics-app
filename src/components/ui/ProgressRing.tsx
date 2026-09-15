import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

export interface ProgressRingProps {
  /** 0..1 */
  progress: number
  /** Diameter in px. */
  size?: number
  strokeWidth?: number
  /** 'accent' for timers that count down to an action, 'good' for holds being completed. */
  tone?: 'accent' | 'good'
  className?: string
  children?: ReactNode
}

/** One ring for every timer in the app: rest countdowns and hold timers. The number sits inside. */
export function ProgressRing({ progress, size = 200, strokeWidth = 10, tone = 'accent', className, children }: ProgressRingProps) {
  const r = (size - strokeWidth) / 2
  const c = 2 * Math.PI * r
  const clamped = Math.min(1, Math.max(0, progress))
  const stroke = tone === 'good' ? 'var(--color-good)' : 'var(--color-accent)'
  return (
    <div className={cn('relative inline-flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-line)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - clamped)}
          style={{ transition: 'stroke-dashoffset 250ms linear' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}

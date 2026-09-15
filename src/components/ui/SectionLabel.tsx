import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/** Sentence-case section label. Replaces the uppercase-tracked eyebrow pattern. */
export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn('text-sm font-medium text-muted', className)}>{children}</p>
}

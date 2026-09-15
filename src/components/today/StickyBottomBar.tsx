import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

/**
 * Pins a primary action within thumb reach, fixed just above the app's
 * bottom nav bar regardless of how much content is above it or how far the
 * page has scrolled. A matching spacer (rendered by the caller's page
 * padding) isn't needed since this floats over content with a gradient fade.
 */
export function StickyBottomBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="fixed inset-x-0 bottom-16 z-30 flex justify-center">
      <div
        className={cn(
          'w-full max-w-md bg-gradient-to-t from-slate-50 from-70% to-transparent px-4 pb-2 pt-6 dark:from-slate-950',
          className,
        )}
      >
        {children}
      </div>
    </div>
  )
}

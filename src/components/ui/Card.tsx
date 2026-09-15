import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

/**
 * raised = the main object or an action (hairline border on a raised surface)
 * inset  = secondary information: notes, explanations, timers' track (fill, no border)
 * plain  = no box; use for lists that separate items with dividers
 */
export type CardVariant = 'raised' | 'inset' | 'plain'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  children: ReactNode
}

const VARIANT_CLASSES: Record<CardVariant, string> = {
  raised: 'rounded-2xl border border-line bg-raised p-4',
  inset: 'rounded-2xl bg-inset p-4',
  plain: '',
}

export function Card({ variant = 'raised', className, children, ...rest }: CardProps) {
  return (
    <div className={cn(VARIANT_CLASSES[variant], className)} {...rest}>
      {children}
    </div>
  )
}

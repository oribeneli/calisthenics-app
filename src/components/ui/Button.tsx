import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'md' | 'lg' | 'xl'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-on-accent hover:brightness-105',
  secondary: 'bg-inset text-ink hover:bg-line/70',
  danger: 'bg-danger-soft text-danger hover:brightness-105',
  ghost: 'bg-transparent text-body hover:bg-inset',
}

const SIZE_CLASSES: Record<ButtonSize, string> = {
  md: 'min-h-12 px-4 text-sm',
  lg: 'min-h-12 px-6 text-base',
  /** In-session actions, tapped while sweaty. */
  xl: 'min-h-14 px-6 text-lg',
}

/** Primary tappable action. Defaults to size="lg" for one-handed phone use. */
export function Button({ variant = 'primary', size = 'lg', className, children, ...rest }: ButtonProps) {
  return (
    <button
      className={cn(
        'pressable inline-flex items-center justify-center gap-2 rounded-xl font-semibold',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-ground',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  )
}

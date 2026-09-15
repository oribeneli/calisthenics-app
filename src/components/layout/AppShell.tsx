import type { ReactNode } from 'react'
import { NavLink } from 'react-router'
import { cn } from '../../lib/cn'

interface NavItem {
  to: string
  label: string
  icon: ReactNode
}

const ICON_PROPS = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    label: 'Today',
    icon: (
      <svg {...ICON_PROPS} aria-hidden="true">
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
      </svg>
    ),
  },
  {
    to: '/checkin',
    label: 'Check-in',
    icon: (
      <svg {...ICON_PROPS} aria-hidden="true">
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="M9 3h6v2H9z" />
        <path d="m9 13 2 2 4-4" />
      </svg>
    ),
  },
  {
    to: '/progress',
    label: 'Progress',
    icon: (
      <svg {...ICON_PROPS} aria-hidden="true">
        <path d="M4 20V10" />
        <path d="M11 20V4" />
        <path d="M18 20v-7" />
      </svg>
    ),
  },
  {
    to: '/program',
    label: 'Program',
    icon: (
      <svg {...ICON_PROPS} aria-hidden="true">
        <path d="M6 4h11a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.7.46L14 18l-4.3 1.96a.5.5 0 0 1-.7-.46V4" />
        <path d="M6 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2" />
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: (
      <svg {...ICON_PROPS} aria-hidden="true">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
      </svg>
    ),
  },
]

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-ground">
      <main className="safe-top mx-auto w-full max-w-md flex-1 px-4 pb-24 pt-4">{children}</main>
      <nav
        aria-label="Primary"
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-raised/95 backdrop-blur"
      >
        <div className="mx-auto flex max-w-md">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex min-h-12 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium',
                  isActive
                    ? 'text-accent'
                    : 'text-muted',
                )
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}

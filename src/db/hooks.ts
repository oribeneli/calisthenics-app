import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect } from 'react'
import { db } from './db'
import type { Checkin, Profile, Setting } from './types'
import { todayKey } from '../lib/dates'
import { applyTheme, THEME_SETTING_KEY, type ThemeSetting } from '../lib/theme'

export interface ProfileQuery {
  /** True until the first read from IndexedDB resolves. */
  loading: boolean
  /** The single local profile row, or undefined once loaded if onboarding hasn't run. */
  profile: Profile | undefined
}

/**
 * The single local profile row. Distinguishes "still loading" from "loaded,
 * no profile yet" so callers (like RequireOnboarded) don't act on a
 * momentarily-undefined value before the first query resolves.
 */
export function useProfile(): ProfileQuery {
  const result = useLiveQuery(async () => ({ profile: await db.profile.get('me') }), [])
  return { loading: result === undefined, profile: result?.profile }
}

/** Today's check-in, or undefined if none has been logged yet. */
export function useTodayCheckin(): Checkin | undefined {
  return useLiveQuery(() => db.checkins.where('date').equals(todayKey()).first(), [])
}

/** All settings as a plain key/value record. */
export function useSettings(): Record<string, unknown> {
  const rows = useLiveQuery(() => db.settings.toArray(), [])
  const result: Record<string, unknown> = {}
  for (const row of rows ?? ([] as Setting[])) {
    result[row.key] = row.value
  }
  return result
}

/**
 * Applies the dark-mode setting to <html> and keeps it in sync with both the
 * stored preference and the OS-level scheme (when set to 'system').
 */
export function useThemeEffect(): void {
  const setting = useLiveQuery(() => db.settings.get(THEME_SETTING_KEY), [])
  const theme = (setting?.value as ThemeSetting | undefined) ?? 'system'

  useEffect(() => {
    applyTheme(theme)
    if (theme !== 'system') return
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => applyTheme(theme)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [theme])
}

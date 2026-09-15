export type ThemeSetting = 'system' | 'light' | 'dark'

export const THEME_SETTING_KEY = 'theme'

function prefersDark(): boolean {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches === true
}

/** Applies (or removes) the 'dark' class on <html> for the given setting. */
export function applyTheme(setting: ThemeSetting): void {
  const isDark = setting === 'dark' || (setting === 'system' && prefersDark())
  document.documentElement.classList.toggle('dark', isDark)
}

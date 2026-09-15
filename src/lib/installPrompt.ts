// Captures the browser's `beforeinstallprompt` event so a UI button
// (SettingsPage) can trigger it later, instead of relying on the browser's
// own install UI. Safari/iOS never fires this event — callers should fall
// back to manual "Add to Home Screen" instructions there.

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

let deferredPrompt: BeforeInstallPromptEvent | null = null
let installed = false
const listeners = new Set<() => void>()

function notify() {
  for (const listener of listeners) listener()
}

/** Call once, early (e.g. from main.tsx), to start capturing the event. */
export function initInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault()
    deferredPrompt = event as BeforeInstallPromptEvent
    notify()
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null
    installed = true
    notify()
  })
}

/** Whether a native install prompt is currently available to trigger. */
export function canPromptInstall(): boolean {
  return deferredPrompt !== null
}

export function isAppInstalled(): boolean {
  return (
    installed ||
    window.matchMedia?.('(display-mode: standalone)').matches === true
  )
}

/** Shows the captured native install prompt. Resolves with the user's choice. */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferredPrompt) return 'unavailable'
  await deferredPrompt.prompt()
  const choice = await deferredPrompt.userChoice
  deferredPrompt = null
  notify()
  return choice.outcome
}

export function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent)
}

/** Subscribes to install-availability changes; returns an unsubscribe fn. */
export function onInstallPromptChange(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

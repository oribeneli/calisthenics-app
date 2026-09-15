import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Sheet } from '../components/ui/Modal'
import { useToast } from '../components/ui/toastContext'
import { db } from '../db/db'
import { exportAll, importAll, resetAll } from '../db/backup'
import {
  canPromptInstall,
  isAppInstalled,
  isIOS,
  onInstallPromptChange,
  promptInstall,
} from '../lib/installPrompt'
import { THEME_SETTING_KEY, type ThemeSetting } from '../lib/theme'

function useInstallAvailability() {
  const [available, setAvailable] = useState(canPromptInstall())

  useEffect(() => onInstallPromptChange(() => setAvailable(canPromptInstall())), [])

  return available
}

export default function SettingsPage() {
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [resetSheetOpen, setResetSheetOpen] = useState(false)
  const [exportUrl, setExportUrl] = useState<string | null>(null)
  const exportLinkRef = useRef<HTMLAnchorElement>(null)

  const themeSetting = useLiveQuery(() => db.settings.get(THEME_SETTING_KEY), [])
  const theme = (themeSetting?.value as ThemeSetting | undefined) ?? 'system'
  const installAvailable = useInstallAvailability()

  async function handleExport() {
    const blob = await exportAll()
    const url = URL.createObjectURL(blob)
    setExportUrl((previous) => {
      if (previous) URL.revokeObjectURL(previous)
      return url
    })
    // Trigger the download on the next tick, once the href is set.
    requestAnimationFrame(() => exportLinkRef.current?.click())
    showToast('Backup exported.', 'success')
  }

  async function handleImportChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    try {
      await importAll(file)
      showToast('Backup imported. Your data has been restored.', 'success')
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Import failed.', 'error')
    }
  }

  async function handleThemeChange(next: ThemeSetting) {
    await db.settings.put({ key: THEME_SETTING_KEY, value: next })
  }

  async function handleReset() {
    await resetAll()
    setResetSheetOpen(false)
    showToast('All local data has been reset.', 'success')
  }

  async function handleInstallClick() {
    const outcome = await promptInstall()
    if (outcome === 'unavailable') {
      showToast('Your browser has no install prompt available right now.', 'info')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-ink">Settings</h1>

      <Card>
        <h2 className="text-base font-semibold text-ink">Profile</h2>
        <p className="mt-1 text-sm text-body">
          Update your details, or re-do the health check after a break.
        </p>
        <Link
          to="/onboarding"
          className="pressable mt-3 inline-flex min-h-12 items-center justify-center rounded-xl bg-inset px-4 text-sm font-medium text-ink hover:bg-line/70"
        >
          Edit profile & health check
        </Link>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-ink">Backup</h2>
        <p className="mt-1 text-sm text-body">
          Export a full JSON backup, or restore from a previous one.
        </p>
        <div className="mt-3 flex flex-col gap-2">
          <Button onClick={handleExport}>Export backup (JSON)</Button>
          {/* Hidden anchor used to trigger the actual file download. */}
          <a
            ref={exportLinkRef}
            href={exportUrl ?? undefined}
            download="calisthenics-coach-backup.json"
            className="hidden"
          >
            download
          </a>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            Import backup (JSON)
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImportChange}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-ink">Appearance</h2>
        <div className="mt-3 flex flex-col gap-1">
          <label htmlFor="theme-select" className="text-sm text-body">
            Dark mode
          </label>
          <select
            id="theme-select"
            value={theme}
            onChange={(event) => handleThemeChange(event.target.value as ThemeSetting)}
            className="min-h-12 rounded-xl border border-line bg-inset px-3 text-base text-ink"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-ink">Units</h2>
        <p className="mt-1 text-sm text-body">Metric (kg, cm), only option for now.</p>
      </Card>

      <Card>
        <h2 className="text-base font-semibold text-ink">Install app</h2>
        {isAppInstalled() ? (
          <p className="mt-1 text-sm text-body">Already installed.</p>
        ) : installAvailable ? (
          <div className="mt-3">
            <Button onClick={handleInstallClick}>Install app</Button>
          </div>
        ) : isIOS() ? (
          <p className="mt-1 text-sm text-body">
            On iPhone/iPad: tap the Share icon in Safari, then &ldquo;Add to Home
            Screen&rdquo;.
          </p>
        ) : (
          <p className="mt-1 text-sm text-body">
            Use your browser&rsquo;s menu and look for &ldquo;Install app&rdquo; or &ldquo;Add
            to Home Screen&rdquo;.
          </p>
        )}
      </Card>

      <Card className="border-danger/30">
        <h2 className="text-base font-semibold text-danger">Danger zone</h2>
        <p className="mt-1 text-sm text-body">
          Permanently deletes all local data on this device. Export a backup first.
        </p>
        <div className="mt-3">
          <Button variant="danger" onClick={() => setResetSheetOpen(true)}>
            Reset all data
          </Button>
        </div>
      </Card>

      <Sheet open={resetSheetOpen} onClose={() => setResetSheetOpen(false)} title="Reset all data?">
        <p className="text-sm text-body">
          This deletes your profile, check-ins, sessions, logs and photos from this device.
          This cannot be undone unless you have an exported backup.
        </p>
        <div className="mt-4 flex flex-col gap-2">
          <Button variant="danger" onClick={handleReset}>
            Yes, delete everything
          </Button>
          <Button variant="secondary" onClick={() => setResetSheetOpen(false)}>
            Cancel
          </Button>
        </div>
      </Sheet>
    </div>
  )
}

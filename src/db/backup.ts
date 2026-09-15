import { db } from './db'
import type {
  AppEvent,
  BodyMetrics,
  Checkin,
  Habit,
  LadderState,
  Photo,
  Profile,
  Session,
  SetLog,
  Setting,
} from './types'

export const BACKUP_SCHEMA_VERSION = 1

interface SerializedPhoto extends Omit<Photo, 'blob'> {
  blobBase64: string
  blobType: string
}

export interface BackupData {
  schemaVersion: number
  exportedAt: string
  profile: Profile[]
  checkins: Checkin[]
  sessions: Session[]
  setLogs: SetLog[]
  ladderState: LadderState[]
  bodyMetrics: BodyMetrics[]
  photos: SerializedPhoto[]
  habits: Habit[]
  settings: Setting[]
  events: AppEvent[]
}

// FileReader is used instead of Blob.prototype.arrayBuffer()/text() because
// jsdom (our test environment) doesn't implement those Blob methods.
function readBlobAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read blob.'))
    reader.readAsDataURL(blob)
  })
}

function readBlobAsText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file.'))
    reader.readAsText(blob)
  })
}

async function blobToBase64(blob: Blob): Promise<string> {
  const dataUrl = await readBlobAsDataUrl(blob)
  const commaIndex = dataUrl.indexOf(',')
  return commaIndex === -1 ? dataUrl : dataUrl.slice(commaIndex + 1)
}

function base64ToBlob(base64: string, type: string): Blob {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new Blob([bytes], { type })
}

export async function exportAll(): Promise<Blob> {
  const [
    profile,
    checkins,
    sessions,
    setLogs,
    ladderState,
    bodyMetrics,
    photos,
    habits,
    settings,
    events,
  ] = await Promise.all([
    db.profile.toArray(),
    db.checkins.toArray(),
    db.sessions.toArray(),
    db.setLogs.toArray(),
    db.ladderState.toArray(),
    db.bodyMetrics.toArray(),
    db.photos.toArray(),
    db.habits.toArray(),
    db.settings.toArray(),
    db.events.toArray(),
  ])

  const serializedPhotos: SerializedPhoto[] = await Promise.all(
    photos.map(async ({ blob, ...rest }) => ({
      ...rest,
      blobBase64: await blobToBase64(blob),
      blobType: blob.type || 'image/jpeg',
    })),
  )

  const data: BackupData = {
    schemaVersion: BACKUP_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    profile,
    checkins,
    sessions,
    setLogs,
    ladderState,
    bodyMetrics,
    photos: serializedPhotos,
    habits,
    settings,
    events,
  }

  await db.settings.put({ key: 'lastExportAt', value: data.exportedAt })

  return new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
}

function isBackupData(value: unknown): value is BackupData {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return typeof record.schemaVersion === 'number' && Array.isArray(record.profile)
}

export async function importAll(file: File | Blob): Promise<void> {
  const text = await readBlobAsText(file)
  const parsed: unknown = JSON.parse(text)

  if (!isBackupData(parsed)) {
    throw new Error('Invalid backup file: missing schemaVersion.')
  }

  if (parsed.schemaVersion > BACKUP_SCHEMA_VERSION) {
    throw new Error(
      `Backup was made with a newer app version (schema ${parsed.schemaVersion}); this app supports up to ${BACKUP_SCHEMA_VERSION}.`,
    )
  }

  const photos: Photo[] = parsed.photos.map(({ blobBase64, blobType, ...rest }) => ({
    ...rest,
    blob: base64ToBlob(blobBase64, blobType),
  }))

  await db.transaction(
    'rw',
    [
      db.profile,
      db.checkins,
      db.sessions,
      db.setLogs,
      db.ladderState,
      db.bodyMetrics,
      db.photos,
      db.habits,
      db.settings,
      db.events,
    ],
    async () => {
      await Promise.all([
        db.profile.clear(),
        db.checkins.clear(),
        db.sessions.clear(),
        db.setLogs.clear(),
        db.ladderState.clear(),
        db.bodyMetrics.clear(),
        db.photos.clear(),
        db.habits.clear(),
        db.settings.clear(),
        db.events.clear(),
      ])

      await Promise.all([
        db.profile.bulkAdd(parsed.profile),
        db.checkins.bulkAdd(parsed.checkins),
        db.sessions.bulkAdd(parsed.sessions),
        db.setLogs.bulkAdd(parsed.setLogs),
        db.ladderState.bulkAdd(parsed.ladderState),
        db.bodyMetrics.bulkAdd(parsed.bodyMetrics),
        db.photos.bulkAdd(photos),
        db.habits.bulkAdd(parsed.habits),
        db.settings.bulkAdd(parsed.settings),
        db.events.bulkAdd(parsed.events),
      ])
    },
  )
}

export async function resetAll(): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.profile,
      db.checkins,
      db.sessions,
      db.setLogs,
      db.ladderState,
      db.bodyMetrics,
      db.photos,
      db.habits,
      db.settings,
      db.events,
    ],
    async () => {
      await Promise.all([
        db.profile.clear(),
        db.checkins.clear(),
        db.sessions.clear(),
        db.setLogs.clear(),
        db.ladderState.clear(),
        db.bodyMetrics.clear(),
        db.photos.clear(),
        db.habits.clear(),
        db.settings.clear(),
        db.events.clear(),
      ])
    },
  )
}

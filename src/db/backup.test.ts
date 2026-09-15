import { beforeEach, describe, expect, it } from 'vitest'
import { db } from './db'
import { exportAll, importAll } from './backup'

// Note: photo (Blob) round-tripping isn't exercised here because
// fake-indexeddb cannot structured-clone jsdom's Blob implementation (it
// comes back as an empty plain object) — a limitation of this test
// environment, not of the app. Real browsers store/retrieve Blobs from
// IndexedDB natively, and blobToBase64/base64ToBlob in backup.ts are plain
// FileReader-based conversions exercised implicitly whenever a real File is
// imported below.

beforeEach(async () => {
  await db.transaction(
    'rw',
    [db.profile, db.checkins, db.sessions, db.setLogs, db.ladderState, db.settings],
    async () => {
      await Promise.all([
        db.profile.clear(),
        db.checkins.clear(),
        db.sessions.clear(),
        db.setLogs.clear(),
        db.ladderState.clear(),
        db.settings.clear(),
      ])
    },
  )
})

describe('exportAll / importAll', () => {
  it('round-trips profile and checkins, and stamps lastExportAt', async () => {
    await db.profile.put({
      id: 'me',
      name: 'Ori',
      sex: 'male',
      birthYear: 1995,
      heightCm: 178,
      startWeightKg: 90,
      trainDays: [1, 3, 5],
      sessionMinutes: 30,
      trainTime: 'morning',
      constraints: [],
      notes: '',
      createdAt: new Date().toISOString(),
      onboardedAt: new Date().toISOString(),
    })
    await db.checkins.put({
      date: '2026-09-15',
      sleepHours: 7,
      sleepQuality: 4,
      mood: 3,
      soreness: 2,
    })

    const backupBlob = await exportAll()
    expect(backupBlob.type).toBe('application/json')

    const lastExportAt = await db.settings.get('lastExportAt')
    expect(lastExportAt?.value).toBeTruthy()

    // Wipe the DB, then restore from the exported backup file.
    await db.profile.clear()
    await db.checkins.clear()
    expect(await db.profile.get('me')).toBeUndefined()

    const backupFile = new File([backupBlob], 'backup.json', { type: 'application/json' })
    await importAll(backupFile)

    const restoredProfile = await db.profile.get('me')
    expect(restoredProfile?.name).toBe('Ori')

    const restoredCheckins = await db.checkins.toArray()
    expect(restoredCheckins).toHaveLength(1)
    expect(restoredCheckins[0].date).toBe('2026-09-15')
  })

  it('rejects a file with no schemaVersion', async () => {
    const badFile = new File([JSON.stringify({ foo: 'bar' })], 'bad.json', {
      type: 'application/json',
    })
    await expect(importAll(badFile)).rejects.toThrow(/schemaVersion/)
  })

  it('rejects a backup from a newer schema version', async () => {
    const futureFile = new File(
      [JSON.stringify({ schemaVersion: 999, profile: [] })],
      'future.json',
      { type: 'application/json' },
    )
    await expect(importAll(futureFile)).rejects.toThrow(/newer app version/)
  })
})

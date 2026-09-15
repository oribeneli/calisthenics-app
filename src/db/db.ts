import Dexie, { type EntityTable } from 'dexie'
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

export class CoachDB extends Dexie {
  profile!: EntityTable<Profile, 'id'>
  checkins!: EntityTable<Checkin, 'id'>
  sessions!: EntityTable<Session, 'id'>
  setLogs!: EntityTable<SetLog, 'id'>
  ladderState!: EntityTable<LadderState, 'ladderId'>
  bodyMetrics!: EntityTable<BodyMetrics, 'id'>
  photos!: EntityTable<Photo, 'id'>
  habits!: EntityTable<Habit, 'id'>
  settings!: EntityTable<Setting, 'key'>
  events!: EntityTable<AppEvent, 'id'>

  constructor() {
    super('calisthenics-coach')

    this.version(1).stores({
      profile: 'id',
      checkins: '++id, &date',
      sessions: '++id, date',
      setLogs: '++id, sessionId, ladderId',
      ladderState: 'ladderId',
      bodyMetrics: '++id, date',
      photos: '++id, date',
      habits: '++id, date, key, &[date+key]',
      settings: 'key',
      events: '++id, ts, type',
    })
  }
}

export const db = new CoachDB()

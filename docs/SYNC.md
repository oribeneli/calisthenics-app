# Phase 3 — cloud sync evaluation

**Decision (2026-09-15): not built in v0.3. The app stays local-first with JSON export/import.** Reasons, then the cheapest path if you want sync later.

## What was evaluated

| Option | Monthly cost | Work | Verdict |
|---|---|---|---|
| **Supabase free tier, magic-link auth, per-row sync** | 0 | > 1 session: every one of the 10 Dexie tables needs `updatedAt` + tombstones, a push/pull loop, and a conflict policy for the same day edited on two devices | Too much for the benefit; the merge logic is where personal-sync apps silently lose data |
| **Supabase free tier, whole-backup sync** (one row per user holding the export JSON, last-write-wins, manual "Sync now" + auto-push after each session) | 0 | ≈ half a session, reuses `exportAll`/`importAll` | **Recommended if sync is wanted.** Coarse but predictable: the newer device wins, and the app already knows how to export and import itself |
| Dexie Cloud | free tier exists, limits to be checked at signup | ≈ 1–2 hours (Dexie is already the DB; sync is a plugin) | Strong candidate; not chosen tonight because it is a hosted product whose free-tier limits I could not verify without an account |
| Google Drive / file-based | 0 | OAuth consent screen setup, token handling | More setup friction than value |

## Why not tonight

1. **It needs your account.** Creating a Supabase (or Dexie Cloud) project and pasting its URL/anon key is something only you can do. Code written against an unverified backend would be shipped untested, which is worse than not shipping it.
2. **Free-tier pausing.** Supabase pauses free projects after about a week without database activity; data survives but the project must be restored by hand from the dashboard, and sync silently stops until then ([Supabase docs](https://supabase.com/docs/guides/platform/free-project-pausing), [SimpleBackups write-up](https://simplebackups.com/blog/supabase-free-tier-paused)). With three sessions a week plus daily check-ins the project would normally stay awake, but any two-week break pauses it. Acceptable for a personal app, but it must be understood, and the app must keep working locally when the backend is asleep (it would: local-first is the design).
3. **Export/import already covers the real need.** Phone is where sessions are logged; the PC is for reading progress. A monthly export from the phone and an import on the PC gives the PC an up-to-date read-only copy with zero infrastructure.

## If you want it: the half-session design

- Supabase project → `auth` with magic link (no password) → one table `backups(user_id uuid primary key, payload jsonb, updated_at timestamptz)` with row-level security `user_id = auth.uid()`.
- App: Settings → "Sync" card: sign in with email link; **Sync now** = compare `updated_at` with the local `lastSyncAt`; if remote is newer, `importAll(remote)`; then `exportAll()` → upsert. Auto-push after `finishSession` and after each check-in when online; never block the UI on the network.
- Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` in GitHub repository secrets, read at build time. Everything else stays as it is.
- Tag: `v0.4-sync`.

Sources: [Supabase project pausing](https://supabase.com/docs/guides/platform/free-project-pausing) · [Supabase pricing](https://supabase.com/pricing) · [SimpleBackups: free tier paused](https://simplebackups.com/blog/supabase-free-tier-paused)

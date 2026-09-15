# Calisthenics Coach — personal PWA. Master build prompt

Talk to me in Hebrew. Code, UI, commit messages and docs in English.
Follow my global CLAUDE.md protocol (alignment batch → plan → TDD → verify rendered output → checkpoint → Obsidian log). This is one long task: use `/ecc:plan` first, work autonomously, and stop only for decisions only I can make.

## 1. Mission

Build me a personal, installable web app (PWA) that gets a completely untrained, overweight adult from zero into calisthenics at home with **no equipment at all** (no pull-up bar, no bands, no dumbbells; only floor, wall, a sturdy chair/table, a towel and a doorframe). It is a daily dashboard: it tells me exactly what to do today, lets me log it in under a minute, adapts when I fail or when I am too tired, and shows my progress over weeks and months.

Before writing any code, do **deep, cited research** and pick the most evidence-based way for someone like me to enter this discipline. I am not looking for a generic workout app. I am looking for the *right* on-ramp, encoded into software.

## 2. Who I am (fill the blanks; ask me in ONE batch for anything still missing)

- Age: [ ] · Height: [ ] cm · Weight: [ ] kg
- Training history: none. Current fitness: none. I get out of breath climbing stairs.
- Injuries / pain / medical constraints (knees, lower back, shoulders, wrists, blood pressure): [ ]
- Days per week I can realistically train: [ ] · Minutes per session I can commit: [ ]
- Time of day I will train: [ ] · Space: a living-room floor, a wall, a chair, a table.
- Goal in my words: take myself in hand, lose fat, build basic strength, eventually do real push-ups, rows and squats without dying.
- Motivation profile: I quit when things are vague or when I fail a workout and feel stupid. The app must make failure a normal, logged, non-shameful event with a built-in easier option.

## 3. Phase 0 — Research (deliverable: `docs/RESEARCH.md`)

Run this in a subagent so the raw reading stays out of the main context; the main thread gets the conclusions. Every claim gets a source link. Rate each source (peer-reviewed / reputable guideline / expert practitioner / community consensus).

Research questions, in priority order:

1. **Best beginner on-ramp for an overweight, untrained adult with zero equipment.** Compare at minimum: Hybrid Calisthenics "Fundamentals" (Hampton), r/bodyweightfitness Recommended Routine plus its Minimalist and Primer routines, Convict Conditioning 10-step progressions, Start Bodyweight, Overcoming Gravity beginner guidance, ACSM and WHO physical-activity guidelines for untrained and obese adults. Decide which progression *ladders* to adopt per movement pattern and why.
2. **Movement patterns and no-equipment progression ladders** for: horizontal push (wall → incline on table → knee → full push-up …), pull (no bar: towel-doorframe rows, table inverted rows, prone Y/T raises; assess what is actually effective and safe), squat (assisted with chair → box squat → full), hinge (glute bridge → single leg), core (dead bug → plank ladder → hollow), and mobility / joint prep. Each ladder: 8–12 explicit levels with rep targets, form cues, common faults, and the *exact* rule for moving up or down.
3. **Overweight-specific safety**: joint loading on knees, wrists and shoulders; which exercises to avoid early (jumping, deep lunges, full push-ups too early, anything that loads wrists before they are ready); warm-up and cool-down that actually matter; heart-rate / RPE ceilings for someone with no aerobic base; when to tell the user to see a doctor first.
4. **Programming**: full-body 3×/week vs other splits for beginners; sets, reps, rest; progressive overload without weights (reps → leverage → tempo → range); "Grease the Groove"; deload rules; how to handle a missed day or a missed week without the "start over" spiral.
5. **Adaptive rules**: how to auto-regress an exercise when the user fails, how to auto-progress, and how sleep, mood and soreness should change today's session (for example: bad sleep → same exercises, one set fewer, no progression today).
6. **Habit and adherence science** for beginners: streaks vs consistency scores, the minimum viable session ("2-minute rule"), realistic weekly fat-loss targets, why body weight should be shown as a 7-day trailing average, evidence on progress photos and circumference tracking.
7. **Basic nutrition and sleep** for fat loss in an untrained adult: protein target per kg, a small set of daily habit checkboxes (not calorie counting), sleep-hours target. Keep it minimal and evidence-based; no diet ideology.

`RESEARCH.md` ends with a **Decisions** section: the chosen program, the chosen ladders, the adaptive rules, and every rejected alternative with one line on why. I will read this section before you build. Present it to me and wait for my approval of the program design. This is the one mandatory stop.

## 4. Phase 1 — Program design (deliverables: `docs/PROGRAM.md` and `src/data/program.json`)

Encode the decisions as data, not prose: movement patterns → ladders → levels (id, name, demo link or text cue, form cues, faults, rep scheme, advance rule, regress rule). Weekly template (which patterns on which day, warm-up, cool-down, session length). A Week 0 "onboarding week" that tests my starting level on every ladder with a safe, gentle assessment. Regression must never bottom out: level 1 of every ladder must be doable by me today.

## 5. Phase 2 — The app

**Stack (default; change only with a stated reason):** Vite + React + TypeScript, Tailwind, Dexie (IndexedDB) for local-first storage, Recharts or Chart.js, `vite-plugin-pwa` for installability and offline. Hosted free on GitHub Pages or Vercel so it opens on my phone and my PC from one URL. Repo at `C:\Users\User\Desktop\calisthenics-app`, git-initialized, with an annotated tag at every verified milestone.

**Storage decision:** cloud sync between phone and PC is what I ideally want. Build local-first plus JSON export/import in the MVP so it is useful on day one. Then evaluate the cheapest reliable sync path (Supabase free tier with magic-link auth is the default candidate) and add it as Phase 3 **only if** it costs less than a session of work and adds no monthly cost. If it is materially harder, keep it local with export/import and tell me why.

**Screens and features (MVP):**

1. **Onboarding**: my profile from section 2, constraints, days and times; runs the Week 0 assessment and sets my starting level per ladder.
2. **Today**: the daily dashboard. Shows today's session, or on rest days a short mobility routine plus habit checkboxes. Each exercise card has: level name, target sets × reps, form cues, a big **"Too hard → easier"** button that swaps in the regression *now* and logs the failure without judgment, a **"Too easy"** button, a rest timer, and one-tap rep logging (planned reps prefilled; edit only if different). The session ends with an RPE 1–10 and a one-line note. Must be usable one-handed on a phone while sweaty.
3. **Check-in**: a 20-second morning check-in: sleep hours and quality (1–5), mood (1–5), soreness (1–5), weight (optional). These feed the adaptive rule that adjusts today's session, and the adjustment is explained in one sentence on the Today screen ("Sleep was 4h, so today is 2 sets instead of 3").
4. **Progress**: per-ladder level over time (the headline metric: "Push-up: level 3 → level 5 in 6 weeks"), total reps and sessions per week, consistency score (sessions done ÷ planned, rolling 4 weeks), body weight with a 7-day trailing average, waist / hip / chest / arm circumferences with charts, progress photos (front and side, stored locally in IndexedDB, side-by-side compare), nutrition and sleep habit adherence heatmap.
5. **Program**: browse all ladders and levels, manually set a level, see the advance and regress rules, read the form cues; a "why this program" page that summarizes the research in plain language.
6. **Settings**: export/import JSON backup, reminders (web push if feasible, otherwise nothing fake), units, danger zone (reset).

**Adaptive engine (a pure, unit-tested TypeScript module with no UI in it):** input = program + history + today's check-in → output = today's session plus a one-sentence explanation. Rules come from Phase 0 (advance after N clean sessions at target, regress after M failures, deload every K weeks, sleep / mood / soreness modifiers, missed-day handling). Every rule is a named, testable function.

**Non-negotiables:** offline-first; installs to a phone home screen; no account required for the MVP; no ads, no tracking, no external calls except the optional sync; dark mode; everything reachable within two taps from Today; data never silently lost (monthly export reminder).

## 6. Quality gates (nothing is "done" until)

- Unit tests on the adaptive engine and on the ladder data (every level has advance and regress rules, no ladder bottoms out, no cycles). Build, type check, lint and tests green.
- **Rendered verification:** open the built app in the browser at a phone viewport (about 390×844) and screenshot every screen; look at the screenshots and fix what is wrong before showing me anything. Also verify that the install prompt appears and that an offline reload works.
- Simulate 8 weeks of use with a script (successes, failures, missed days, bad sleep) and check that the engine's decisions are sane; put the simulation output in `docs/SIMULATION.md`.
- Annotated git tag per milestone: `v0.1-research`, `v0.2-program`, `v0.3-mvp`, `v0.4-sync` (if built).
- Obsidian session log at every handoff, per my CLAUDE.md.

## 7. Delivery order

1. Alignment batch (missing profile fields, anything ambiguous) in one AskUserQuestion.
2. Phase 0 research → `docs/RESEARCH.md` → **stop for my approval of the Decisions section**.
3. Phase 1 program data plus tests.
4. Phase 2 MVP, screen by screen, each screen verified by screenshot before the next.
5. Deploy to a public URL; give me the URL and the "add to home screen" steps for Android and iPhone.
6. Phase 3 sync evaluation (build it, or explain why not).
7. Final report: what was built, what was verified (with evidence), the URL, how to back up, and a continuation prompt if anything remains.

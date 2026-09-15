# Calisthenics Coach

A local-first, installable PWA that runs a home calisthenics program: a daily
dashboard, a check-in flow, progress charts and a program browser. All data
lives in the browser (IndexedDB via Dexie); JSON export/import is the backup
path.

What is inside: the research synthesis and decisions (docs/RESEARCH.md, docs/research/), the program as data (src/data/program.json, prose in docs/PROGRAM.md), a pure adaptive engine with named rules (src/engine/, simulated in docs/SIMULATION.md), the Dexie adapter (src/app/coach.ts) and the six screens (Onboarding, Today, Check-in, Progress, Program, Settings). Install and deploy steps: docs/INSTALL.md. Cloud-sync evaluation: docs/SYNC.md. Verified phone-viewport screenshots: docs/screenshots/.

## Stack

Vite + React 19 + TypeScript (strict) + Tailwind CSS v4 + react-router v7
(hash routing) + Dexie 4 + Recharts + `vite-plugin-pwa`. Tests with Vitest,
React Testing Library and `fake-indexeddb`.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build for production (`dist/`)
- `npm run preview` — serve the production build locally
- `npm run typecheck` — `tsc --noEmit`
- `npm run lint` — ESLint
- `npm run test` / `npm run test:watch` — Vitest
- `npm run check` — typecheck + lint + test (the CI gate)
- `npm run gen:icons` — regenerate `public/icons/*.png` from the SVG sources
  in `scripts/`

## Deploy

Pushing to `main` runs `.github/workflows/deploy.yml`: install, `npm run
check`, build, then deploy `dist/` to GitHub Pages via
`actions/configure-pages` + `actions/deploy-pages`. Enable Pages once for the
repo (Settings → Pages → Source: GitHub Actions) — the workflow's
`enablement: true` also does this automatically on first run.

`vite.config.ts` sets `base: './'`, so the build works from any sub-path
(a GitHub Pages project page included) without further configuration.

## Data & backup

Everything is stored locally in IndexedDB. Settings → Export backup downloads
a JSON file (photos included, base64-encoded); Settings → Import backup
restores from one, replacing local data after validating its schema version.

---
phase: 01-foundation
plan: "02"
subsystem: api
tags: [express, typescript, cors, nodejs, rest-api]

# Dependency graph
requires:
  - phase: 01-foundation plan 01
    provides: "ALL_UNITS (500 units), ANOMALIES subset, SUMMARY aggregate from seed.ts/aggregator.ts"
provides:
  - "server/src/index.ts: Express 5 app with CORS for localhost:3000, routes mounted at /api/units, /api/summary, /api/anomalies"
  - "server/src/routes/units.ts: GET /api/units returning 500-unit JSON array"
  - "server/src/routes/summary.ts: GET /api/summary returning pre-computed ESG aggregate"
  - "server/src/routes/anomalies.ts: GET /api/anomalies returning 32-item anomaly subset"
  - "server/package.json: npm dev/start/build scripts, Express 5 + cors + faker-js dependencies"
  - "server/tsconfig.json: NodeNext module resolution config"
affects:
  - "02-heatmap — fetch from http://localhost:3001/api/units for Unit[] data"
  - "03-dashboard — fetch from http://localhost:3001/api/summary for Summary data"

# Tech tracking
tech-stack:
  added: ["express@5.2.x", "cors@2.8.x", "tsx (watch mode dev server)"]
  patterns:
    - "Route-per-resource pattern: each endpoint in its own router file (units.ts, summary.ts, anomalies.ts)"
    - "ESM import path convention: .js extension in .ts files for NodeNext resolution"
    - "CORS origin whitelist: single allowed origin (NEXT_ORIGIN env or localhost:3000)"
    - "Pre-computed data at module level: routers import SUMMARY/ALL_UNITS/ANOMALIES singletons, zero computation per request"

key-files:
  created:
    - server/package.json
    - server/tsconfig.json
    - server/src/index.ts
    - server/src/routes/units.ts
    - server/src/routes/summary.ts
    - server/src/routes/anomalies.ts

key-decisions:
  - "Express 5 with NodeNext module resolution: .js extensions required in TS import paths even for .ts source files"
  - "CORS configured with single-origin whitelist (localhost:3000) rather than wildcard for demo security posture"
  - "PORT and NEXT_ORIGIN configurable via env vars with sensible defaults (3001, http://localhost:3000)"
  - "Route handlers delegate entirely to pre-computed module-level singletons — no business logic in routes"

patterns-established:
  - "Server pattern: express() + cors middleware + json middleware + route mounts in index.ts"
  - "Route pattern: named export router (unitsRouter/summaryRouter/anomaliesRouter) per resource"
  - "Import pattern: .js extension on all relative imports in NodeNext TypeScript"
  - "Dev workflow: npm run dev uses tsx watch for hot reload without compilation step"

requirements-completed: [DATA-01, DATA-02, DATA-03, DATA-04]

# Metrics
duration: 8min
completed: 2026-02-20
---

# Phase 1 Plan 02: Express API Server Summary

**Express 5 server on port 3001 wiring three read-only JSON endpoints to pre-computed data layer, with CORS enabled for localhost:3000 — 500 units, 32 anomalies, 38.1% savings confirmed deterministic across restarts**

## Performance

- **Duration:** ~8 min
- **Started:** 2026-02-20T08:00:42Z
- **Completed:** 2026-02-20T08:08:00Z
- **Tasks:** 3 (2 auto + 1 checkpoint auto-approved in yolo mode)
- **Files modified:** 6

## Accomplishments
- Created `server/package.json` with Express 5, cors, faker-js, tsx dependencies and npm dev/start/build scripts
- Created `server/tsconfig.json` with NodeNext module resolution for ESM TypeScript compatibility
- Installed 112 npm packages with zero vulnerabilities
- Created `server/src/routes/units.ts`, `summary.ts`, `anomalies.ts` — each a minimal router delegating to pre-computed singletons
- Created `server/src/index.ts` as Express 5 app with CORS middleware, JSON body parser, and all three route mounts
- Verified: units=500, summary savingsPercent=38.1% sptProgress=95.3%, anomalies=32, hero units correct, CORS working, determinism confirmed across 2 restarts

## Task Commits

Each task was committed atomically:

1. **Task 1: Initialize server package with dependencies and TypeScript config** - `a51b92b` (chore)
2. **Task 2: Create Express routes and main server entry point** - `1c3bf4e` (feat)
3. **Task 3: Verify API server delivers correct demo data** - auto-approved (yolo mode, no separate commit)

**Plan metadata:** (see final metadata commit)

## Files Created/Modified
- `server/package.json` - npm package with Express 5, cors, faker-js, tsx dependencies and dev/start/build scripts
- `server/tsconfig.json` - TypeScript config with NodeNext module resolution, ES2022 target
- `server/src/index.ts` - Express 5 app entry: CORS for localhost:3000, JSON middleware, three route mounts
- `server/src/routes/units.ts` - GET /api/units router, serves ALL_UNITS from seed.ts
- `server/src/routes/summary.ts` - GET /api/summary router, serves SUMMARY from aggregator.ts
- `server/src/routes/anomalies.ts` - GET /api/anomalies router, serves ANOMALIES from seed.ts

## Decisions Made
- NodeNext module resolution requires `.js` extensions in import paths even for `.ts` source files — tsx handles the mapping at runtime
- CORS uses single-origin whitelist (`NEXT_ORIGIN` env var, defaults to `http://localhost:3000`) rather than wildcard
- `PORT` and `NEXT_ORIGIN` are env-configurable with sensible defaults so the server works in both dev and any deployment
- Route handlers contain zero business logic — they delegate entirely to pre-computed singletons imported at module load

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None. Node v24.8.0 is well above the 20.19+ minimum requirement. All dependencies installed cleanly. tsx handled NodeNext ESM imports correctly.

## User Setup Required

None - no external service configuration required. Server starts with `npm run dev` from the `server/` directory.

## Next Phase Readiness

- Full Phase 1 complete: data layer (01-01) + API server (01-02)
- Three endpoints live and deterministic:
  - `GET http://localhost:3001/api/units` — 500 units, hero narrative confirmed
  - `GET http://localhost:3001/api/summary` — 38.1% savings, 95.3% SPT progress
  - `GET http://localhost:3001/api/anomalies` — 32 anomaly units
- CORS headers present for localhost:3000 — React dev server can fetch without errors
- Phases 2 and 3 frontend work can now begin in parallel
- Blockers from STATE.md still apply: Tailwind v4 custom grid columns, Tremor v3 compatibility

## Self-Check: PASSED

All 6 files exist at `server/`. Task commits a51b92b and 1c3bf4e verified in git log. SUMMARY.md created at `.planning/phases/01-foundation/01-02-SUMMARY.md`.

---
*Phase: 01-foundation*
*Completed: 2026-02-20*

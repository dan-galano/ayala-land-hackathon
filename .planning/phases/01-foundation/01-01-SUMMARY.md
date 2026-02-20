---
phase: 01-foundation
plan: "01"
subsystem: api
tags: [typescript, faker-js, esg, seed-data, constants]

# Dependency graph
requires: []
provides:
  - "server/src/constants.ts: GRID_EMISSION_FACTOR, SPT_TARGET, SBTI_REDUCTION_TARGET, BASELINE_KWH, CONSUMPTION_RANGES, THRESHOLD_RATIOS"
  - "server/src/types.ts: Unit and Summary TypeScript interfaces (API contract)"
  - "server/src/classifier.ts: pure classifyUnit() function (five threshold bands)"
  - "server/src/seed.ts: ALL_UNITS (500 units, deterministic) and ANOMALIES subset"
  - "server/src/aggregator.ts: SUMMARY pre-computed building aggregate"
affects:
  - "02-server-api — imports ALL_UNITS, ANOMALIES, SUMMARY to build Express routes"
  - "03-heatmap — consumes Unit[] type and status classifications"
  - "04-dashboard — consumes Summary type and sptProgress/sbtiProgress values"

# Tech tracking
tech-stack:
  added: ["@faker-js/faker (seeded deterministic RNG)"]
  patterns:
    - "Shared constants file as single source of truth for all ESG values"
    - "Deterministic seed pattern: faker.seed(42) at module level before any usage"
    - "Post-loop hero unit override pattern: apply overrides as map pass after generation to preserve RNG sequence"
    - "Pre-aggregate at module load: no computation in route handlers"

key-files:
  created:
    - server/src/constants.ts
    - server/src/types.ts
    - server/src/classifier.ts
    - server/src/seed.ts
    - server/src/aggregator.ts

key-decisions:
  - "faker.seed(42) called at module level as very first statement in seed.ts (before imports' side effects)"
  - "Hero unit overrides applied post-loop as map pass to prevent RNG position shifts for non-hero units"
  - "savingsPercent computed from raw totalKwh/totalBaselineKwh totals, not sum of per-unit savingsPercent (prevents float drift)"
  - "Import chain enforced: constants <- classifier <- seed <- aggregator (no circular deps)"

patterns-established:
  - "Constants pattern: all magic numbers banned; every ESG value traces to constants.ts"
  - "Classifier pattern: pure function with no state or side effects"
  - "Seed pattern: faker.seed at module level, hero overrides as post-loop map"
  - "Aggregator pattern: compute once at startup, serve from memory"

requirements-completed: [DATA-01, DATA-02, DATA-03, DATA-04]

# Metrics
duration: 7min
completed: 2026-02-20
---

# Phase 1 Plan 01: Foundation Data Layer Summary

**Five-module TypeScript data layer producing 500 deterministic units with IEA-verified CO2 math, threshold classification, and pre-aggregated ESG summary for Ayala Net-Zero Command Center**

## Performance

- **Duration:** ~7 min
- **Started:** 2026-02-20T07:55:25Z
- **Completed:** 2026-02-20T08:02:00Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Created `constants.ts` as single source of truth for all ESG constants (GRID_EMISSION_FACTOR=0.672, SPT_TARGET=40, SBTI_REDUCTION_TARGET=42, per-type BASELINE_KWH, CONSUMPTION_RANGES, THRESHOLD_RATIOS)
- Created `types.ts` defining Unit and Summary TypeScript interfaces — the API contract consumed by all frontend phases
- Created `classifier.ts` with pure `classifyUnit()` covering five threshold bands (normal/elevated/warning/critical/vampire)
- Created `seed.ts` with `faker.seed(42)` at module level, 500 deterministic units (floors 2-26, 20 per floor), 4% vampire rate, 1.5% spike rate, three hero unit overrides applied post-loop
- Created `aggregator.ts` with `buildSummary()` computing all 10 Summary fields from raw unit totals — no computation at request time

## Task Commits

Each task was committed atomically:

1. **Task 1: Create constants.ts and types.ts** - `6f23fdd` (feat)
2. **Task 2: Create classifier.ts and seed.ts** - `196e9c6` (feat)
3. **Task 3: Create aggregator.ts** - `07d0d95` (feat)

**Plan metadata:** (see final metadata commit)

## Files Created/Modified
- `server/src/constants.ts` - All ESG constants: emission factor, loan targets, baselines, consumption ranges, threshold ratios
- `server/src/types.ts` - Unit and Summary TypeScript interfaces matching API response shapes
- `server/src/classifier.ts` - Pure classifyUnit() function mapping (kWh, baseline, flags) to UnitStatus
- `server/src/seed.ts` - Deterministic 500-unit generator with faker.seed(42) and hero unit overrides
- `server/src/aggregator.ts` - Building-level ESG aggregator, SUMMARY exported at module level

## Decisions Made
- `faker.seed(42)` placed as module-level statement (line 5 of seed.ts) before any faker API usage — ensures determinism survives module system reordering
- Hero unit overrides implemented as post-loop map pass (not as special-cases inside loop) so the RNG sequence for all 500 units is identical whether or not heroes fire their override
- `savingsPercent` in buildSummary() computed from `totalBaselineKwh - totalKwh` raw totals only — not from summing `unit.savingsPercent` values — to prevent floating-point drift
- All import paths use `.js` extension (ESM convention for TypeScript + tsx/ts-node)

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None — all files created cleanly on first attempt. Note: runtime verification with `npx tsx` requires `@faker-js/faker` package install (plan 01-02) — syntax/type correctness confirmed by visual inspection and import chain analysis.

## User Setup Required

None — no external service configuration required. Package install handled in plan 01-02.

## Next Phase Readiness

- Data layer complete. ALL_UNITS, ANOMALIES, SUMMARY are ready to be imported by Express route handlers in plan 01-02.
- TypeScript types (Unit, Summary) define the exact API response shape for frontend teams.
- Hero units locked: 1203=critical/spike, 0815=vampire, 2510=normal — demo narrative is deterministic.
- Note: `@faker-js/faker` must be installed before runtime validation (plan 01-02 will handle package setup).

## Self-Check: PASSED

All 5 source files exist at `server/src/`. All 3 task commits verified in git log (6f23fdd, 196e9c6, 07d0d95). SUMMARY.md created at `.planning/phases/01-foundation/01-01-SUMMARY.md`.

---
*Phase: 01-foundation*
*Completed: 2026-02-20*

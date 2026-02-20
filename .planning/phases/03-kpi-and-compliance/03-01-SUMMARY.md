---
phase: 03-kpi-and-compliance
plan: "01"
subsystem: ui
tags: [typescript, nextjs, tailwind, react, kpi, esg, compliance]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Express API with /api/summary and /api/units endpoints (server/src/types.ts Summary interface)
provides:
  - Summary interface in client/lib/types.ts matching server contract
  - fetchSummary() and fetchUnits() typed API helpers in client/lib/api.ts
  - KpiCard reusable dark metric card component
  - SbtiIndicator SBTi carbon budget progress indicator (Scope 3 Tenant Emissions, 42% target)
  - SptProgressBar green loan SPT covenant progress bar (40% savings threshold)
affects: [03-02, KpiSection, heatmap-dashboard]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Pure Server Component pattern — no use client, no hooks, accept only props
    - NEXT_PUBLIC_API_URL env var pattern for browser-accessible API base URL
    - Progress bar as ratio of actual vs target (barPct = progress, label = savingsPercent)

key-files:
  created:
    - client/lib/types.ts
    - client/lib/api.ts
    - client/components/kpi/KpiCard.tsx
    - client/components/kpi/SbtiIndicator.tsx
    - client/components/kpi/SptProgressBar.tsx
  modified: []

key-decisions:
  - "Plain Tailwind v4 utilities only — no @tremor/react (incompatible with Tailwind v4)"
  - "SbtiIndicator ON TRACK threshold: progress >= 80 (not savingsPercent >= 42)"
  - "SptProgressBar AT RISK threshold: savingsPercent < 40 (raw %, not progress ratio)"
  - "Display savingsPercent for human text, use progress for bar fill width"
  - "Summary interface in client/lib/types.ts mirrors server/src/types.ts exactly (manual copy pattern)"

patterns-established:
  - "KPI cards: slate-800 bg, slate-700 border, white values, slate-400 labels"
  - "Status colors: emerald-500/green-400 = on track, red-500/red-400 = at risk"
  - "Progress bars: h-2 rounded-full, transition-all, bg-slate-700 track"

requirements-completed: [VIZ-01, ESG-01, ESG-02, FIN-01]

# Metrics
duration: 7min
completed: 2026-02-20
---

# Phase 3 Plan 01: KPI Data Layer and Compliance Indicator Components Summary

**Five pure React components and typed API client for KPI metrics: SBTi carbon budget indicator, green loan SPT covenant bar, and reusable KpiCard — all using plain Tailwind v4, no Tremor**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-20T08:33:25Z
- **Completed:** 2026-02-20T08:40:15Z
- **Tasks:** 2
- **Files modified:** 5 (all created)

## Accomplishments
- Summary interface added to client/lib/types.ts matching server's 10-field contract exactly
- Typed API helpers fetchSummary() and fetchUnits() with NEXT_PUBLIC_API_URL env var support
- KpiCard reusable dark metric card (title, value, optional subtitle)
- SbtiIndicator showing Scope 3 Tenant Emissions progress toward 42% Ayala SBTi target, ON TRACK at >= 80%
- SptProgressBar showing green loan SPT covenant, AT RISK when raw savingsPercent < 40%

## Task Commits

Each task was committed atomically:

1. **Task 1: Add Summary interface to client types and create typed API fetch helper** - `c54db50` (feat)
2. **Task 2: Create KpiCard, SbtiIndicator, and SptProgressBar components** - `74d9894` (feat)

**Plan metadata:** (docs commit — see final_commit below)

## Files Created/Modified
- `client/lib/types.ts` - UnitType, UnitStatus, AnomalyType, Unit, and Summary interfaces matching server contract
- `client/lib/api.ts` - fetchSummary() and fetchUnits() typed fetch helpers using NEXT_PUBLIC_API_URL
- `client/components/kpi/KpiCard.tsx` - Reusable dark metric card with title, value, optional subtitle
- `client/components/kpi/SbtiIndicator.tsx` - SBTi carbon budget progress bar with Scope 3 Tenant Emissions label
- `client/components/kpi/SptProgressBar.tsx` - Green loan SPT covenant progress bar with gap-to-target display

## Decisions Made
- Plain Tailwind v4 utilities only — @tremor/react is incompatible with Tailwind v4 (per phase research)
- ON TRACK threshold for SBTi: `progress >= 80` (not raw savingsPercent >= 42) — progress is already the ratio
- AT RISK threshold for SPT: `savingsPercent < 40` — raw savings percentage, not the progress ratio
- Both indicators display `savingsPercent` in human-readable text, use `progress` for bar fill width
- Summary interface manually mirrored from server/src/types.ts (no shared package needed for demo)

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Installed missing npm dependencies**
- **Found during:** Task 1 (TypeScript verification)
- **Issue:** client/node_modules was empty — TypeScript compiler unavailable for verification
- **Fix:** Ran `npm install` in client directory to populate node_modules
- **Files modified:** client/node_modules/ (not committed, in .gitignore)
- **Verification:** `client/node_modules/typescript/bin/tsc --noEmit` ran successfully; zero errors in new files
- **Committed in:** Not committed (gitignored)

---

**Total deviations:** 1 auto-fixed (1 blocking — missing dependencies)
**Impact on plan:** npm install was required to run the TypeScript verification step. No scope creep.

## Issues Encountered
- Pre-existing TypeScript errors in `client/app/layout.tsx` and `client/app/page.tsx` from missing `next-env.d.ts` (generated on first `next dev` run). These are out-of-scope and not caused by this plan's changes. Verified zero errors in the new lib and components files.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- All five visual building blocks complete and ready for KpiSection wiring (plan 03-02)
- Plan 03-02 will import fetchSummary() from client/lib/api.ts to wire live API data
- KpiSection will use KpiCard for four metric cards plus SbtiIndicator and SptProgressBar for compliance
- No blockers for 03-02

---
*Phase: 03-kpi-and-compliance*
*Completed: 2026-02-20*

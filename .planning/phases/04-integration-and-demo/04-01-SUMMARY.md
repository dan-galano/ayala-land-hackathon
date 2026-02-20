---
phase: 04-integration-and-demo
plan: "01"
subsystem: ui
tags: [react, nextjs, typescript, tailwind]

# Dependency graph
requires:
  - phase: 03-kpi-and-compliance
    provides: KpiSection component and Summary type from lib/types.ts
  - phase: 02-heatmap
    provides: Unit type from lib/types.ts

provides:
  - AnomalyPanel presentational component with badge-per-anomaly-type sorting
  - KpiSection upgraded to accept optional server-fetched summary prop

affects:
  - 04-integration-and-demo/04-02 (page.tsx integration will use both components)

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Server-compatible presentational component with no 'use client' directive
    - Optional prop pattern to skip client-side fetch when server data is already available

key-files:
  created:
    - client/components/AnomalyPanel.tsx
  modified:
    - client/components/kpi/KpiSection.tsx

key-decisions:
  - "AnomalyPanel has no 'use client' directive — purely presentational, receives props from page.tsx server component"
  - "Badge color driven by anomalyType field (not status) — spike=red, vampire=orange"
  - "KpiSection initialSummary guard checks the PROP (not state) to prevent re-fetches when server data provided"
  - "Sort order: spike units first (highest severity), then vampire sorted by kWh descending"

patterns-established:
  - "Optional server-prop pattern: useState(initialProp ?? null) + if (initialProp) return in useEffect"
  - "Purely presentational components receive props from server components, require no 'use client'"

requirements-completed:
  - INTEGRATION-SC1
  - INTEGRATION-SC2
  - INTEGRATION-SC3
  - INTEGRATION-SC4

# Metrics
duration: 1min
completed: 2026-02-20
---

# Phase 4 Plan 01: AnomalyPanel component and KpiSection optional summary prop

**AnomalyPanel presentational component with spike/vampire badge sorting plus KpiSection upgraded to skip client fetch when server pre-fetches summary**

## Performance

- **Duration:** 1 min
- **Started:** 2026-02-20T09:49:15Z
- **Completed:** 2026-02-20T09:50:23Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Created AnomalyPanel.tsx as a purely server-compatible component listing flagged units with color-coded badges (spike=red, vampire=orange) driven by anomalyType field
- Upgraded KpiSection.tsx with optional `summary?: Summary | null` prop and useEffect early-return guard to skip redundant client-side fetch when server passes pre-fetched data
- Both files pass TypeScript type check with 0 errors

## Task Commits

Each task was committed atomically:

1. **Task 1: Create AnomalyPanel component** - `6e05270` (feat)
2. **Task 2: Upgrade KpiSection to accept optional summary prop** - `14d04ac` (feat)

## Files Created/Modified

- `client/components/AnomalyPanel.tsx` - New presentational component listing flagged units with SPIKE/VAMPIRE badges, sorting spikes first then vampires by kWh descending, scrollable max-h-[500px] container
- `client/components/kpi/KpiSection.tsx` - Added Props interface with summary?: Summary | null, initialSummary prop, useState initialized from prop, useEffect guarded by if (initialSummary) return

## Decisions Made

- AnomalyPanel has no 'use client' directive because it is purely presentational — page.tsx server component passes anomalies as props
- Badge color driven by unit.anomalyType (not unit.status) to match anomaly narrative
- useEffect guard checks the PROP (initialSummary) not the state variable to correctly detect server-provided data on every render cycle
- Sort order puts spike units first (highest severity) then vampires sorted by kWh descending so most critical units always appear at top

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- AnomalyPanel ready for use in page.tsx server component (Plan 02)
- KpiSection now accepts server-fetched summary via prop, enabling Promise.all pattern in page.tsx
- No blockers — both components compile cleanly

## Self-Check: PASSED

- FOUND: client/components/AnomalyPanel.tsx
- FOUND: client/components/kpi/KpiSection.tsx
- FOUND: .planning/phases/04-integration-and-demo/04-01-SUMMARY.md
- FOUND commit: 6e05270 (AnomalyPanel)
- FOUND commit: 14d04ac (KpiSection)

---
*Phase: 04-integration-and-demo*
*Completed: 2026-02-20*

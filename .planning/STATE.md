# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-20)

**Core value:** Property managers can instantly see which units are exceeding their carbon budget and threatening compliance with Ayala's ₱56B sustainability-linked loans
**Current focus:** Phase 2 — Heatmap (plan 02-02 complete, ready for 02-03)

## Current Position

Phase: 2 of 4 (Heatmap)
Plan: 2 of 3 in current phase (02-02 complete)
Status: In progress — plan 02-02 complete, ready for 02-03 (UnitDetailPanel)
Last activity: 2026-02-20 — Completed plan 02-02: HeatmapGrid and UnitCell components — 500-cell CSS Grid with React.memo leaf cells, STATUS_CLASSES Record, anomaly icons, floor labels

Progress: [████████░░] 75%

## Performance Metrics

**Velocity:**
- Total plans completed: 5
- Average duration: 8 min
- Total execution time: 0.67 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 2 | 15 min | 7.5 min |
| 02-heatmap | 1 | 14 min | 14 min |
| 03-kpi-and-compliance | 2 | 11 min | 5.5 min |

**Recent Trend:**
- Last 5 plans: 01-01 (7 min), 01-02 (8 min), 03-01 (7 min), 02-01 (14 min), 03-02 (4 min)
- Trend: stable

*Updated after each plan completion*
| 02-heatmap P02 | 2 | 7 min | 7 min |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- CSS Grid over chart library for heatmap (performance, bundle size)
- Static seeded data over live ticking (demo reliability)
- Express pre-aggregation pattern (all ESG math server-side, React is purely presentational)
- Shared constants file is critical path — prevents ESG number incoherence across cards
- faker.seed(42) must be at module level before any faker usage (not inside function) to guarantee RNG determinism
- Hero unit overrides applied as post-loop map pass — preserves RNG sequence for all non-hero units
- savingsPercent computed from raw totalKwh/totalBaselineKwh only (never sum of per-unit values) to prevent float drift
- NodeNext module resolution requires .js extensions in TS import paths — tsx handles mapping at runtime
- CORS uses single-origin whitelist (NEXT_ORIGIN env var, default localhost:3000) rather than wildcard
- Route handlers contain zero business logic — delegate entirely to pre-computed module-level singletons
- Plain Tailwind v4 utilities only for KPI components — @tremor/react incompatible with Tailwind v4
- SbtiIndicator ON TRACK threshold: progress >= 80 (not raw savingsPercent vs 42% target)
- SptProgressBar AT RISK threshold: savingsPercent < 40 (raw %, not progress ratio)
- KPI components display savingsPercent for human text, use progress for bar fill width
- KpiSection owns the single /api/summary fetch — no props, no client recomputation of ESG values
- Phase 4 will add optional summary prop to KpiSection when lifting state for Promise.all fetch
- STATUS_CLASSES Record lookup over switch/if-else for UnitCell status colors (per CONTEXT.md anti-patterns)
- Inline style for gridTemplateColumns/gridTemplateRows instead of grid-cols-20 (Tailwind v4 escape hatch)
- UnitDetailPanel added as placeholder import in HeatmapGrid (expected TS2307 error resolved in plan 03)
- React.memo on both UnitCell and HeatmapGrid; isSelected changes for exactly 2 cells per click

### Pending Todos

None yet.

### Blockers/Concerns

- Tailwind v4 custom grid columns: `grid-cols-25` syntax may require custom config — verify `extend.gridTemplateColumns` before building heatmap
- Demo hardware: validate 500-cell render performance on actual demo machine before final rehearsal

## Session Continuity

Last session: 2026-02-20
Stopped at: Completed 02-02-PLAN.md — HeatmapGrid and UnitCell components. 500-cell CSS Grid with React.memo leaf cells, STATUS_CLASSES lookup, anomaly icons, and F26-F2 floor labels. Phase 2 plan 2 of 3 complete. Next: 02-03 (UnitDetailPanel slide-in).
Resume file: None

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-02-20)

**Core value:** Property managers can instantly see which units are exceeding their carbon budget and threatening compliance with Ayala's ₱56B sustainability-linked loans
**Current focus:** Phase 1 — Foundation

## Current Position

Phase: 1 of 4 (Foundation)
Plan: 1 of 2 in current phase
Status: In progress
Last activity: 2026-02-20 — Completed plan 01-01: pure data layer (constants, types, classifier, seed, aggregator)

Progress: [█░░░░░░░░░] 10%

## Performance Metrics

**Velocity:**
- Total plans completed: 1
- Average duration: 7 min
- Total execution time: 0.1 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-foundation | 1 | 7 min | 7 min |

**Recent Trend:**
- Last 5 plans: 01-01 (7 min)
- Trend: —

*Updated after each plan completion*

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

### Pending Todos

None yet.

### Blockers/Concerns

- Tailwind v4 custom grid columns: `grid-cols-25` syntax may require custom config — verify `extend.gridTemplateColumns` before building heatmap
- Tremor v3 + Tailwind v4 compatibility: test `ProgressBar` color threshold props early in Phase 3
- Demo hardware: validate 500-cell render performance on actual demo machine before final rehearsal

## Session Continuity

Last session: 2026-02-20
Stopped at: Completed 01-01-PLAN.md — pure data layer (constants, types, classifier, seed, aggregator). Next: 01-02-PLAN.md (Express 5 server setup and API routes).
Resume file: None

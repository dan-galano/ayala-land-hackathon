# Roadmap: Ayala Land Net-Zero Command Center

## Overview

Four phases that match the natural dependency graph of a 3-hour hackathon build. Phase 1 establishes the data contract that unblocks everyone. Phases 2 and 3 run as parallel workstreams (heatmap vs. KPI cards). Phase 4 wires everything together and validates the demo narrative. No phase can be cut — each delivers a required capability. No phase introduces new features.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Seeded data, shared constants, and Express API endpoints that unblock all parallel workstreams
- [ ] **Phase 2: Heatmap** - 500-unit grid heatmap with anomaly visual indicators (parallel workstream A)
- [ ] **Phase 3: KPI and Compliance** - KPI cards, ESG metrics, and green loan progress bar (parallel workstream B)
- [ ] **Phase 4: Integration and Demo** - Full page assembly, anomaly panel, API wiring, and demo rehearsal

## Phase Details

### Phase 1: Foundation
**Goal**: The Express API serves realistic seeded data for 500+ units with coherent ESG math, unblocking parallel frontend development
**Depends on**: Nothing (first phase)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04
**Success Criteria** (what must be TRUE):
  1. `GET /api/units` returns 500+ unit records with realistic kWh distributions (studio 80-150, 1BR 120-250, 2BR 200-400) and each unit has a pre-classified status field (normal/elevated/warning/critical/vampire)
  2. `GET /api/summary` returns building totals where total CO2e, savings %, and SPT progress all derive from the same shared constants (BASELINE_KWH, GRID_EMISSION_FACTOR=0.672, SPT_TARGET=40)
  3. `GET /api/anomalies` returns a pre-filtered list containing 3-5% vampire load units and 1-2% dangerous spike units matching intentional outliers in the seed
  4. The seed is deterministic — restarting the server returns identical unit data including named hero units (e.g., Unit 1203 always critical)
  5. CORS is configured so the Next.js dev server can call all three endpoints without browser errors
**Plans**: 2 plans

Plans:
- [x] 01-01-PLAN.md — Pure data layer: constants, types, classifier, seed generator (500 units), and building aggregator
- [x] 01-02-PLAN.md — Express 5 server: package setup, CORS, routes for /api/units, /api/summary, /api/anomalies

### Phase 2: Heatmap
**Goal**: Property managers can see all 500+ units on a color-coded grid and click any cell to see unit-level detail
**Depends on**: Phase 1
**Requirements**: VIZ-02, VIZ-03, ANOM-01, ANOM-02
**Success Criteria** (what must be TRUE):
  1. All 500+ units render as a CSS Grid heatmap with distinct color coding: green (normal), yellow (elevated), orange (vampire load), red (dangerous spike), gray (vacant/near-zero)
  2. The heatmap renders without visible jank — scrolling and initial paint complete without perceptible freeze on demo hardware
  3. Clicking any heatmap cell reveals unit-level detail showing unit ID, floor, kWh consumed, CO2e, and anomaly type (if flagged)
  4. Anomalous units display distinct visual treatment: orange for vampire loads (persistent high baseline) and red for dangerous spikes (sudden surge)
**Plans**: 3 plans

Plans:
- [ ] 02-01-PLAN.md — Next.js 16 scaffold in client/, Tailwind v4 globals.css with spike-glow animation, client/lib/types.ts
- [ ] 02-02-PLAN.md — HeatmapGrid (25×20 CSS Grid, floor labels, selectedUnit state) and UnitCell (React.memo, status colors, anomaly icons)
- [ ] 02-03-PLAN.md — UnitDetailPanel (CSS slide panel) + app/page.tsx (server fetch) + human verification checkpoint

### Phase 3: KPI and Compliance
**Goal**: Property managers can read the building's energy performance, Scope 3 carbon exposure, and green loan covenant status from a single screen
**Depends on**: Phase 1
**Requirements**: VIZ-01, ESG-01, ESG-02, FIN-01
**Success Criteria** (what must be TRUE):
  1. Four KPI summary cards display total kWh consumed, total CO2e (labeled explicitly as "Scope 3 Tenant Emissions"), number of units over threshold, and % energy savings vs. baseline — all derived from the single `/api/summary` response
  2. The SBTi progress indicator shows building % of annual carbon budget consumed against Ayala's 42% reduction target with a clear on-track / at-risk label
  3. The green loan SPT progress bar shows current energy savings % against the 40% SPT covenant target with a label that communicates urgency when below target
  4. All numeric values on screen are internally coherent — no card contradicts another (CO2e reconciles with kWh, savings % aligns with loan bar)
**Plans**: TBD

Plans:
- [ ] 03-01: KPI summary cards using Tremor
- [ ] 03-02: ESG compliance indicators and green loan progress bar

### Phase 4: Integration and Demo
**Goal**: The complete dashboard is assembled, all components render real API data, and the team can deliver the scripted demo narrative without hesitation
**Depends on**: Phase 2, Phase 3
**Requirements**: (none new — integrates all prior phases)
**Success Criteria** (what must be TRUE):
  1. Opening the dashboard URL shows the fully assembled page: KPI cards at top, heatmap grid below, anomaly panel alongside — all populated with live API data from a single `Promise.all` fetch on mount
  2. The demo narrative works end-to-end: open dashboard showing 38% of 40% target, identify Unit 1203 on the heatmap as critical, observe vampire load badge in anomaly panel, see loan bar at AT RISK
  3. The anomaly panel lists the top flagged units with orange (vampire) and red (spike) badges and correct kWh values matching the heatmap
  4. ESG numbers on screen are verified consistent — CO2e, savings %, and SPT % do not contradict each other
**Plans**: TBD

Plans:
- [ ] 04-01: Anomaly panel component and full page composition
- [ ] 04-02: API wiring with Promise.all and demo validation

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 (parallel with 3) → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/2 | Complete    | 2026-02-20 |
| 2. Heatmap | 0/3 | Not started | - |
| 3. KPI and Compliance | 0/2 | Not started | - |
| 4. Integration and Demo | 0/2 | Not started | - |

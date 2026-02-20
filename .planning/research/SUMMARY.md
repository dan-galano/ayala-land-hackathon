# Project Research Summary

**Project:** Ayala Land Net-Zero Command Center
**Domain:** Energy management / building sustainability admin dashboard
**Researched:** 2026-02-20
**Confidence:** MEDIUM-HIGH (stack HIGH, features MEDIUM, architecture HIGH, pitfalls MEDIUM)

## Executive Summary

This is a 3-hour hackathon MVP for a building-level energy monitoring and ESG compliance dashboard targeting Ayala Land property managers. The product must visualize energy consumption across 500+ residential condo units, flag anomalies (vampire loads and consumption spikes), and tie building-level efficiency to a ₱56B sustainability-linked loan covenant. The recommended approach is a Next.js (App Router) frontend calling a lightweight Express API, with all 500+ unit records seeded in-memory using Faker.js with a fixed seed for determinism. The visual centerpiece is a CSS Grid heatmap — not a chart library — rendering 500 color-coded cells from pre-classified unit status data. KPI cards are built with Tremor for speed. The entire architecture is pre-aggregate-on-server, meaning Express computes totals and status classifications once before responding, so the React layer is purely presentational.

The recommended approach is dictated by three constraints: (1) a 3-hour build window requiring maximum parallelism, (2) 500+ units requiring DOM performance discipline, and (3) a judge audience requiring a credible ESG narrative with mathematically coherent numbers. The critical path is: define the Unit data schema and seed generator first, then split into parallel workstreams for the heatmap and KPI cards. All ESG calculations must flow from a single server-side constants file to prevent incoherence between cards. The "green loan progress bar" and SBTi target indicators are low-cost differentiators that transform this from a generic energy dashboard into a pitch with financial urgency — they must be in v1.

The primary risks are data quality (flat distributions destroy judge credibility), DOM performance (500 un-memoized cells cause visible jank), and ESG number incoherence (independently computed cards produce contradictory figures). All three are preventable at build-time by establishing shared constants, using React.memo on cell components from day one, and seeding domain-realistic distributions with intentional "hero units" (named outliers that drive the demo narrative). Scope creep in the final hour is the most common hackathon failure mode — the feature list must be locked in writing before coding starts.

---

## Key Findings

### Recommended Stack

The pre-decided framework stack (Next.js 16.1.6 + Express 5.2.1 + TypeScript 5.9.3 + Tailwind 4.2.0) is solid and requires no changes. The critical visualization decision is to use **CSS Grid with Tailwind color classes** for the heatmap (not ECharts or any chart library) — the heatmap is a uniform grid of same-sized colored cells, not a data visualization with axes or scales, and chart libraries add 50-100KB bundle weight for zero benefit here. For trend charts and KPI cards, **@tremor/react 3.18.7** provides production-quality `Card`, `Metric`, and `ProgressBar` components that look polished with copy-paste usage. ESG carbon calculations are inline utility functions in `lib/carbon.ts` using the Philippine IEA grid factor (0.672 kg CO2e/kWh) — no external library needed.

**Core technologies:**
- **Next.js 16.1.6**: Frontend framework (App Router) — pre-decided; server components for fast initial load, client components for interactive heatmap
- **Express 5.2.1**: API server for data seeding and aggregation — pre-decided; clean separation enables parallel frontend/backend development
- **TypeScript 5.9.3**: Type safety across both apps — catches data shape bugs between backend seed schema and frontend chart expectations
- **Tailwind CSS 4.2.0**: Styling — fastest path to polished admin UI; required by shadcn/ui and Tremor
- **CSS Grid + Tailwind color classes**: Heatmap rendering — plain DOM outperforms any chart library for 500 uniform cells
- **@tremor/react 3.18.7**: KPI cards, progress bars, sparklines — domain-specific dashboard primitives, zero configuration overhead
- **@faker-js/faker 10.3.0**: Seeded deterministic data generator — `faker.seed(42)` ensures same 500 units every server restart
- **zod 4.3.6**: API response schema validation — prevents silent type mismatches between Express and Next.js
- **date-fns 4.1.0**: Lightweight timestamp formatting — avoids moment.js bundle weight

See `.planning/research/STACK.md` for version compatibility matrix and what-not-to-use rationale.

### Expected Features

All features are evaluated through the hackathon lens: demoable in 3-5 minutes, visually compelling, parallelizable across 2-3 developers.

**Must have (table stakes — build these, nothing else):**
- Total kWh consumption metric card — every energy dashboard starts here; baseline for all downstream calculations
- CO2e / carbon emissions metric card — mandatory ESG KPI; labeled explicitly as "Scope 3 Tenant Emissions" for narrative power
- 500-unit grid heatmap color-coded by energy status — the visual centerpiece; makes the scale of the problem viscerally visible
- Threshold-based anomaly detection (vampire loads + spikes) — two distinct types with different visual treatments; rule-based, explainable
- Green loan progress bar ("X% of 40% SPT target") — ties the dashboard to Ayala's ₱56B loan covenant; the financial hook
- SBTi progress indicator — anchors pitch to Ayala's public Net Zero 2050 commitments at near-zero build cost
- Summary KPI cards (4 cards: total kWh, CO2e, units over threshold, % toward target)

**Should have (differentiators — add if time permits):**
- Click-to-detail on heatmap unit — unit-level breakdown in a side panel or tooltip — only if heatmap is done early
- 7-day sparkline aggregate — minimal time-series context — only if core features are all stable

**Defer (v2+):**
- Real Modbus/MQTT sub-meter integration — requires vendor access and IoT infrastructure
- Live data pipeline (WebSocket/SSE) — replace static seed with streaming only after infrastructure is proven
- Tenant-facing portal — separate product, separate UX requirements
- PDF/Excel ESG report export — useful operationally, zero demo value
- Multi-building portfolio aggregation — data model supports it; UI complexity is high
- ML anomaly detection — threshold rules are sufficient until labeled anomaly data exists
- User authentication / RBAC — mention verbally; don't build for demo

See `.planning/research/FEATURES.md` for competitor feature analysis and full prioritization matrix.

### Architecture Approach

The architecture follows a strict pre-aggregate-on-server pattern: Express generates all 500+ unit records once at startup (stored in a module-level singleton), classifies each unit's status (`normal | elevated | warning | critical | vampire`) in `server/lib/thresholds.ts`, and exposes three endpoints — `GET /api/summary` (building totals), `GET /api/units` (full classified array), `GET /api/anomalies` (filtered subset). The Next.js frontend fetches all three in parallel via `Promise.all` on mount, then passes pre-aggregated data directly to presentational components. No client-side calculation, no global state manager, no waterfall requests. The heatmap component is a plain CSS Grid — `HeatmapGrid` maps the units array to `UnitCell` components, each receiving a `status` prop and rendering a pre-defined Tailwind color class. No computation in JSX.

**Major components:**
1. **`server/data/seed.ts`** — generates 500+ unit records with domain-realistic energy distributions, baseline kWh, and intentional anomaly outliers; loaded once at startup
2. **`server/lib/thresholds.ts` + `aggregator.ts`** — canonical status classification and all ESG math (kWh totals, CO2 conversion, SPT % progress); single source of truth
3. **Express routes (`/api/summary`, `/api/units`, `/api/anomalies`)** — serve pre-computed data; no calculation in route handlers
4. **`HeatmapGrid` + `UnitCell` (CSS Grid)** — renders 500 cells with `React.memo` on `UnitCell`; pure presentational, zero computation
5. **KPI Stats Cards (Tremor)** — `Card`, `Metric`, `ProgressBar` components; receive pre-aggregated props from summary endpoint
6. **`AnomalyPanel`** — maps pre-filtered anomalies array to list items; no client-side filtering
7. **`frontend/lib/api.ts`** — typed fetch wrappers for all Express endpoints; single place to manage base URL and error handling

Build order: seed.ts + thresholds.ts first (unblocks all teammates), then parallel workstreams for routes (Dev A), heatmap components (Dev B), and KPI/stats components (Dev C).

See `.planning/research/ARCHITECTURE.md` for component diagram, project structure, and anti-pattern examples.

### Critical Pitfalls

1. **Unrealistic seed data collapses the demo** — flat kWh distributions produce a monochrome heatmap and no real anomalies. Avoid by seeding domain-realistic ranges (studio: 80-150 kWh, 1BR: 120-250 kWh, 2BR: 200-400 kWh) with 3-5% vampire outliers (>500 kWh) and 10% near-zero vacant units. Define named "hero units" (e.g., Unit 1203 always critical) that the demo script references.

2. **ESG numbers are mathematically incoherent** — cards built independently produce contradictory figures (CO2 saved doesn't reconcile with kWh consumed). Avoid by defining one canonical `BASELINE_KWH_PER_UNIT`, `GRID_EMISSION_FACTOR = 0.6712`, and `SPT_TARGET = 40` in a shared constants file; all cards read from a single `/api/summary` response.

3. **500 un-memoized heatmap cells cause visible jank** — 500 DOM nodes re-rendering on every state change creates 200-600ms stalls. Avoid by applying `React.memo` to `UnitCell` from day one and pre-computing all status/color values at seed time (never compute colors in JSX).

4. **Demo has no story — judges see charts but miss the stakes** — technically complete dashboard that demos as "feature tour" vs. narrative with urgency. Avoid by scripting the 90-second demo before writing code: open at "38% of 40% target — one bad month from loan breach", click to Unit 1203 critical, point to vampire load, show loan bar. Seed data must support this exact script.

5. **Scope creep eats the last hour** — energy dashboards have infinite natural extensions; every new feature feels small. Avoid by writing the feature list on paper at hour 0 and enforcing a hard cutoff: any new feature after hour 1 requires unanimous agreement AND something gets cut. The last hour is polish and rehearsal only.

6. **Green loan progress bar uses wrong baseline** — comparing current kWh to current kWh shows 0% savings. Avoid by seeding `baselineKwh` per unit at 1.4-1.7x current consumption; the formula is `savingsPct = (baselineKwh - currentKwh) / baselineKwh * 100`. This field must exist in the Unit schema from the start.

---

## Implications for Roadmap

Based on research, the build has a clear dependency graph that maps to 4 execution phases. The data contract (Unit schema) is the critical dependency for all other work; it must be established before any parallel workstreams begin.

### Phase 1: Foundation — Seed Data, Schema, and Server Constants

**Rationale:** Every other component depends on the Unit data schema and the seeded dataset. This cannot be parallelized — it must be done first, and it must produce domain-realistic data. The shared constants file (`BASELINE_KWH`, `GRID_EMISSION_FACTOR`, `SPT_TARGET`) defined here prevents ESG incoherence across all subsequent cards.

**Delivers:** Working Express server with `GET /api/units`, `GET /api/summary`, `GET /api/anomalies` returning realistic seeded data; TypeScript `Unit` and `Summary` types shared with frontend; confirmed CORS configuration; demo narrative with named hero units established in seed data.

**Addresses:** Seeded data generator (P1), Threshold rules engine (P1), shared ESG constants.

**Avoids:** Pitfall 1 (unrealistic data), Pitfall 4 (incoherent ESG numbers), Pitfall 6 (wrong loan baseline), Integration gotcha (CORS), seed data determinism.

**Research flag:** No additional research needed — Faker.js patterns are well-documented, Express aggregation is standard.

### Phase 2: Heatmap Grid (Parallel Workstream A)

**Rationale:** The heatmap is the most complex component and the visual centerpiece of the demo. It must be parallelized as its own workstream after Phase 1 establishes the data contract. CSS Grid approach (not a chart library) is the correct call per architecture research — implement this pattern from the start.

**Delivers:** `HeatmapGrid` + `UnitCell` components rendering 500 color-coded cells; `React.memo` applied; status-to-color lookup table (no JSX computation); unit legend (green/yellow/orange/red/gray); hover tooltip with unit ID, kWh, and status.

**Uses:** CSS Grid, Tailwind color classes, React.memo, pre-classified `status` prop from Phase 1 API response.

**Implements:** HeatmapGrid + UnitCell architecture components.

**Avoids:** Pitfall 2 (DOM performance), Anti-Pattern 1 (computing status in JSX), Anti-Pattern 3 (using chart library for heatmap).

**Research flag:** No additional research needed — CSS Grid heatmap pattern is well-documented.

### Phase 3: KPI Cards, ESG Metrics, and Loan Progress (Parallel Workstream B)

**Rationale:** These components are parallelizable with Phase 2 once Phase 1 establishes the data contract. Each card is a separate file, allowing multiple developers to work without merge conflicts. Tremor components are copy-paste — near-zero configuration overhead.

**Delivers:** Four KPI summary cards (total kWh, CO2e labeled as "Scope 3 Tenant Emissions", units over threshold, % below baseline); green loan progress bar ("X% of 40% SPT target — ON/AT RISK"); SBTi progress indicator; all values derived from single `/api/summary` response; "Data as of: February 2026" timestamp; units labels on every metric.

**Uses:** @tremor/react `Card`, `Metric`, `ProgressBar`, `Text` components; `/api/summary` endpoint from Phase 1.

**Implements:** KPI Stats Cards + LoanProgressBar architecture components.

**Avoids:** Pitfall 4 (incoherent ESG numbers), UX pitfall (cards with no unit labels), UX pitfall (progress bar with no context label).

**Research flag:** No additional research needed — Tremor patterns are well-documented and copy-paste.

### Phase 4: Anomaly Panel, Integration, and Demo Rehearsal

**Rationale:** The anomaly panel consumes the pre-filtered `/api/anomalies` endpoint and is simpler to build after the heatmap and cards are stable. Integration wires `frontend/lib/api.ts` with `Promise.all` fetching. The last 30 minutes must be reserved for demo rehearsal — scripting the 90-second narrative and verifying the hero units appear correctly.

**Delivers:** `AnomalyPanel` listing top anomaly units with vampire/spike classification badges; `frontend/lib/api.ts` with typed fetch wrappers and `Promise.all` parallel fetching; full demo rehearsal with scripted narrative; "looks done but isn't" checklist verification (ESG number reconciliation, heatmap color variance, CORS working in browser).

**Uses:** `/api/anomalies` endpoint; orange (vampire) and red (spike) badge treatments; native fetch.

**Implements:** AnomalyPanel component; full page composition in `app/page.tsx`.

**Avoids:** Pitfall 3 (demo has no story), Pitfall 5 (scope creep), Anti-Pattern 2 (sequential API waterfall), Integration gotcha (CORS blocking API).

**Research flag:** No additional research needed — all patterns are standard React composition.

### Phase Ordering Rationale

- **Phase 1 must be first and cannot be parallelized**: The Unit schema and seed generator are the dependency for all other work. If seed data is unrealistic, every downstream demo collapses.
- **Phases 2 and 3 are parallel workstreams**: Once the data contract is established (shared TypeScript types + working API endpoints), Dev A can build the heatmap while Dev B builds KPI cards and progress bars. This is the core parallelization opportunity.
- **Phase 4 is sequential integration**: Wiring components together and rehearsing the demo must come last, after components are individually stable.
- **No phase should introduce new features**: Each phase delivers what was planned in Phase 0 scope-lock. New features discovered during build go to the parking lot.

### Research Flags

Phases with standard patterns (skip `/gsd:research-phase`):
- **Phase 1 (Seed Data + Server):** Faker.js, Express aggregation, and CORS patterns are well-documented. No gaps.
- **Phase 2 (Heatmap):** CSS Grid heatmap with React.memo is a standard pattern with working code examples in the architecture research.
- **Phase 3 (KPI Cards):** Tremor component usage is copy-paste from official docs. No unknowns.
- **Phase 4 (Integration):** Promise.all fetch pattern and React component composition are standard.

Phases that may need additional research during execution (not before):
- **Philippine grid emission factor**: Two sources give slightly different values (IEA: 0.672 vs. DOE NGEF: 0.7). Use 0.672 for IEA alignment. For a hackathon demo, either value works — judges will not verify the decimal.
- **Tailwind v4 CSS Grid custom columns**: `grid-cols-25` requires custom Tailwind config in v4 (`grid-template-columns: repeat(25, minmax(0, 1fr))`). Verify this works before relying on it in the heatmap.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified via npm registry (2026-02-20); version compatibility confirmed; CSS Grid heatmap approach confirmed by multiple sources; official docs for all libraries |
| Features | MEDIUM | Industry patterns confirmed by multiple sources; Ayala-specific ESG targets (40% SPT, SBTi commitments) verified against public loan disclosures; specific Philippine market adaptations inferred from global best practices |
| Architecture | HIGH | Next.js App Router and Express aggregation patterns verified via official docs; CSS Grid heatmap approach has working code examples; build order dependency graph is unambiguous |
| Pitfalls | MEDIUM | Hackathon-specific pitfalls from community post-mortems (MIT Sloan, serial hackathon winner sources); energy domain pitfalls cross-verified against IEA and GHG Protocol; ESG number incoherence pattern confirmed by multiple dashboard post-mortems |

**Overall confidence:** MEDIUM-HIGH

### Gaps to Address

- **Tailwind v4 custom grid columns**: `grid-cols-25` syntax changed in Tailwind v4 — verify `extend.gridTemplateColumns` configuration before building heatmap. If it adds friction, fall back to `grid-cols-[repeat(25,minmax(0,1fr))]` arbitrary value syntax.
- **Tremor v3 + Tailwind v4 compatibility**: Tremor 3.18.7 is built on Tailwind utility classes; there may be class name changes in Tailwind v4 that affect Tremor components. Test `ProgressBar` color threshold props early.
- **Demo hardware**: The 500-cell DOM performance validation ("Long Task < 100ms") should be tested on the actual demo machine, not just the dev machine. Mid-range hardware with Chrome DevTools open is the worst case.
- **Exact loan covenant details**: The "40% energy savings" SPT target is inferred from Ayala Land's sustainability-linked loan public disclosures. The exact measurement methodology (vs. which baseline year) is not verified — for demo purposes, the narrative is more important than the exact figure.

---

## Sources

### Primary (HIGH confidence)
- npm registry — all package versions verified 2026-02-20
- [Apache ECharts Heatmap Docs](https://echarts.apache.org/) — heatmap series configuration
- [echarts-for-react GitHub](https://github.com/hustcc/echarts-for-react) — SSR/dynamic import configuration
- [Tremor.so](https://www.tremor.so/) — v3.18.7 component API and Tailwind foundation
- [Faker.js](https://fakerjs.dev/) — `faker.seed()` deterministic generation
- [IEA Emissions Factors 2025](https://www.iea.org/data-and-statistics/data-product/emissions-factors-2025) — Philippine grid emission factor
- [Next.js official docs](https://nextjs.org/docs/app/getting-started/project-structure) — project structure and App Router patterns
- [Slaughter and May — 2025 SLL Principles Updates](https://www.slaughterandmay.com/insights/new-insights/2025-updates-to-the-sustainability-linked-loan-principles/) — green loan / SLL compliance requirements
- [SBTi Buildings Criteria FAQs](https://files.sciencebasedtargets.org/production/files/FAQs-SBTi-Buildings-Criteria.pdf) — SBTi target framing
- [GHG Protocol Scope 3 Calculation Guidance](https://ghgprotocol.org/scope-3-calculation-guidance-2) — Scope 3 tenant emissions framing

### Secondary (MEDIUM confidence)
- [LogRocket: Best React Chart Libraries 2025](https://blog.logrocket.com/best-react-chart-libraries-2025/) — Canvas vs SVG performance; ECharts vs Recharts for large datasets
- [Climatiq Philippines emission factor](https://www.climatiq.io/data/emission-factor/1cdd4e1d-8511-4022-9b33-0d96fd3c1b46) — 0.691 kg CO2e/kWh (2019 data, third-party aggregator)
- [LowCarbonPower.org Philippines](https://lowcarbonpower.org/region/Philippines) — 0.672 kg CO2e/kWh (2024 data)
- [Measurabl — Scope 3 Tenant Emissions](https://www.measurabl.com/understanding-measurabls-newest-feature-scope-3-tenant-emissions-trends/) — industry feature benchmark
- [EnergyCAP — Smart Analytics Features](https://www.energycap.com/energy-monitoring-software/features/) — industry feature benchmark
- [React Graph Gallery — heatmap](https://www.react-graph-gallery.com/heatmap) — CSS Grid heatmap implementation pattern
- [Meralco monthly consumption guidance](https://www.meralco.com.ph/residential/bright-ideas/bright-ideas/manage-your-monthly-consumption) — Philippine condo kWh baselines by unit type
- [MIT Sloan — Avoid These Five Pitfalls at Your Next Hackathon](https://sloanreview.mit.edu/article/avoid-these-five-pitfalls-at-your-next-hackathon/) — hackathon failure modes

### Tertiary (LOW confidence)
- [Medium — Designing ESG Dashboards for 2026](https://medium.com/@mokkup/designing-the-future-of-esg-dashboards-how-to-build-sustainability-reporting-tools-for-2026-6106d647c9ed) — single source, needs validation
- WebSearch: building energy dashboard component patterns — no direct energy-domain architecture sources found; patterns inferred from general dashboard architecture literature

---

*Research completed: 2026-02-20*
*Ready for roadmap: yes*

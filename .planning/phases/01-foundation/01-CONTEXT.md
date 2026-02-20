# Phase 1: Foundation - Context

**Gathered:** 2026-02-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Seeded data generator, shared constants file, threshold classifier, and Express API endpoints (`/api/units`, `/api/summary`, `/api/anomalies`). This phase produces the data contract that unblocks all parallel frontend development in Phases 2 and 3. No UI work in this phase.

</domain>

<decisions>
## Implementation Decisions

### Building Structure
- Single building: "Avida Towers Vita" (realistic Ayala brand)
- 25 floors, 20 units per floor = 500 units
- Unit mix: 40% studio, 40% 1BR, 20% 2BR (typical Avida distribution)
- Unit ID format: floor + position, e.g., "Unit 0301" = Floor 3, Position 01
- Ground floor (Floor 1) excluded — lobby/amenities. Units start Floor 2

### Seed Data Realism
- Deterministic seed using Faker.js `faker.seed(42)` — identical data on every server restart
- Philippine consumption ranges: studio 80–150 kWh/mo, 1BR 120–250 kWh/mo, 2BR 200–400 kWh/mo
- Daily values derived from monthly (divide by 30, add ±15% daily variance)
- 3–5% of units flagged as vampire loads (persistent high baseline — e.g., always-on AC in unoccupied unit)
- 1–2% flagged as dangerous spikes (sudden surge — e.g., faulty appliance drawing 3x normal)
- ~5% of units near-zero / vacant (minimal standby power only)

### Hero Units for Demo Narrative
- Unit 1203 (Floor 12, Pos 03) — CRITICAL: dangerous spike, 2BR drawing 3x normal. The "fire hazard" story.
- Unit 0815 (Floor 8, Pos 15) — VAMPIRE: 1BR consuming 24/7 high baseline. The "nobody's home but power's on" story.
- Unit 2510 (Floor 25, Pos 10) — BEST: penthouse-level 2BR with lowest consumption. The "green champion" contrast.
- These units always appear in seed data with fixed values so the demo narrative is repeatable.

### Shared Constants
- `GRID_EMISSION_FACTOR = 0.672` (kg CO₂e/kWh — IEA 2024 Philippine grid factor)
- `SPT_TARGET = 40` (% energy savings required by sustainability-linked loan covenant)
- `SBTI_REDUCTION_TARGET = 42` (% CO₂ reduction by 2030, Ayala's verified SBTi target)
- `BASELINE_KWH` per unit type: studio 180, 1BR 300, 2BR 500 (pre-efficiency 2019 baseline)
- Threshold classification: normal (<80% of baseline), elevated (80–100%), warning (100–120%), critical (>120%), vampire (>60% baseline when flagged unoccupied)

### API Response Design
- `GET /api/units` — Array of all 500 unit objects. No pagination (500 records is small). Fields: `id`, `unitNumber`, `floor`, `position`, `type` (studio/1BR/2BR), `currentKwh`, `baselineKwh`, `co2e`, `savingsPercent`, `status` (normal/elevated/warning/critical/vampire), `anomalyType` (null/vampire/spike), `isOccupied`
- `GET /api/summary` — Single object with building aggregates: `totalKwh`, `totalCo2e`, `totalBaselineKwh`, `savingsPercent`, `sptProgress`, `sbtiProgress`, `unitCount`, `anomalyCount`, `unitsOverThreshold`, `statusBreakdown` (count per status)
- `GET /api/anomalies` — Filtered array of units where `anomalyType` is not null. Same shape as `/api/units` items.
- All values pre-computed on server startup — no computation in route handlers

### Claude's Discretion
- Express server port and CORS configuration
- Exact Faker.js usage patterns for generating realistic distributions
- File/folder structure within the Express server
- Error handling for API routes
- TypeScript types vs JSDoc for the unit schema

</decisions>

<specifics>
## Specific Ideas

- Research confirmed: pre-aggregate everything on Express, not the client. Status classification and building totals computed once at startup, served from memory.
- The demo narrative should flow: "Building is at 38% savings — close to the 40% SPT target but not there yet. Unit 1203 is critical — possible fire hazard. Unit 0815 is a vampire — wasting energy 24/7."
- Use the IEA-verified 0.672 factor — defensible if judges ask about the CO₂ math.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-02-20*

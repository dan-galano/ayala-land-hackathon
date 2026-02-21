# Phase 1: Foundation - Research

**Researched:** 2026-02-20
**Domain:** Express 5 API server with seeded deterministic data generation (Faker.js v10) and pre-aggregated ESG constants
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Building Structure
- Single building: "Ayala Land" (realistic Ayala brand)
- 25 floors, 20 units per floor = 500 units
- Unit mix: 40% studio, 40% 1BR, 20% 2BR (typical Avida distribution)
- Unit ID format: floor + position, e.g., "Unit 0301" = Floor 3, Position 01
- Ground floor (Floor 1) excluded — lobby/amenities. Units start Floor 2

#### Seed Data Realism
- Deterministic seed using Faker.js `faker.seed(42)` — identical data on every server restart
- Philippine consumption ranges: studio 80–150 kWh/mo, 1BR 120–250 kWh/mo, 2BR 200–400 kWh/mo
- Daily values derived from monthly (divide by 30, add ±15% daily variance)
- 3–5% of units flagged as vampire loads (persistent high baseline — e.g., always-on AC in unoccupied unit)
- 1–2% flagged as dangerous spikes (sudden surge — e.g., faulty appliance drawing 3x normal)
- ~5% of units near-zero / vacant (minimal standby power only)

#### Hero Units for Demo Narrative
- Unit 1203 (Floor 12, Pos 03) — CRITICAL: dangerous spike, 2BR drawing 3x normal. The "fire hazard" story.
- Unit 0815 (Floor 8, Pos 15) — VAMPIRE: 1BR consuming 24/7 high baseline. The "nobody's home but power's on" story.
- Unit 2510 (Floor 25, Pos 10) — BEST: penthouse-level 2BR with lowest consumption. The "green champion" contrast.
- These units always appear in seed data with fixed values so the demo narrative is repeatable.

#### Shared Constants
- `GRID_EMISSION_FACTOR = 0.672` (kg CO₂e/kWh — IEA 2024 Philippine grid factor)
- `SPT_TARGET = 40` (% energy savings required by sustainability-linked loan covenant)
- `SBTI_REDUCTION_TARGET = 42` (% CO₂ reduction by 2030, Ayala's verified SBTi target)
- `BASELINE_KWH` per unit type: studio 180, 1BR 300, 2BR 500 (pre-efficiency 2019 baseline)
- Threshold classification: normal (<80% of baseline), elevated (80–100%), warning (100–120%), critical (>120%), vampire (>60% baseline when flagged unoccupied)

#### API Response Design
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

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DATA-01 | System generates seeded energy data for 500+ condo units with realistic Philippine consumption patterns (studio: 80–150 kWh/mo, 1BR: 120–250, 2BR: 200–400) | Faker.js v10 `faker.seed(42)` + `faker.number.float({min, max, fractionDigits})` + `faker.helpers.weightedArrayElement()` for unit type distribution |
| DATA-02 | System includes 3–5% of units as intentional vampire load outliers and 1–2% as dangerous spike anomalies in seeded data | Deterministic seed + hero unit overrides + probability-based flagging using `Math.random()` seeded via Faker's internal RNG |
| DATA-03 | System uses a shared constants file with PH grid emission factor (0.672 kg CO₂e/kWh), baseline kWh per unit type, and SPT target thresholds | Single `constants.ts` module imported by both seed generator and route handlers — prevents ESG number incoherence |
| DATA-04 | System provides a threshold rules engine as a shared utility that classifies units as normal/elevated/warning/critical/vampire | Pure function `classifyUnit(currentKwh, baselineKwh, isOccupied, isVampireFlagged): Status` exported from shared utility — used during seed generation and available for frontend if needed |
</phase_requirements>

---

## Summary

Phase 1 is a pure Node.js data layer with no UI — an Express 5 server that generates 500 unit records via Faker.js v10 at startup, pre-classifies every unit using a shared threshold engine, pre-aggregates ESG building totals, and exposes three read-only JSON endpoints. The data is held in memory and served from module-level constants, making route handlers trivially simple (just `res.json(data)`).

The critical design principle is **pre-computation at startup, not at request time**. All ESG math (CO₂e, savings %, SPT progress) runs once when the server boots using shared constants. Route handlers are dumb — they return already-computed values. This ensures zero inconsistency between endpoints and near-instant response times.

The main technical risk is Faker.js v10's ESM-only format when used from a TypeScript Express project. Using `tsx` as the runtime (instead of `ts-node`) sidesteps all module resolution friction. Faker v10 works fine from CommonJS/ESM projects on Node 20.19+ or Node 22.13+ via native `require(esm)` interop. **Use `tsx` for development; the module concern is resolved.**

**Primary recommendation:** Express 5 + TypeScript + tsx (dev runner) + Faker.js v10 + cors 2.8.5. Compute all 500 units and aggregates in a `seed.ts` module at startup. Route handlers call `res.json()` on pre-built module-level variables. No database needed.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| express | 5.2.1 | HTTP server and routing | v5 is now npm default (since 5.1.0 March 2025); async error handling built-in; no try/catch needed in route handlers |
| @faker-js/faker | 10.3.0 | Deterministic seed data generation | Current stable; `faker.seed(42)` guarantees identical output on every run; richest API for number ranges and weighted selection |
| cors | 2.8.5 | CORS middleware for Next.js requests | Official Express middleware; handles preflight; single `app.use(cors({origin}))` call |
| tsx | latest | TypeScript execution without compile step | Faster than ts-node, no ESM compatibility issues, `--watch` replaces nodemon; ideal for hackathon |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| typescript | 5.x | Type safety for unit/summary/anomaly interfaces | Define `Unit`, `Summary`, `AnomalyType` types once; shared with Phase 4 frontend wiring |
| @types/express | 5.x | TypeScript types for Express 5 | Required for typed request/response in route handlers |
| @types/cors | 2.x | TypeScript types for cors options | Enables `cors.CorsOptions` type for configuration object |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| tsx | ts-node | ts-node has ESM compatibility issues with Faker v10 ESM-only package; tsx just works |
| faker v10 | faker v9 | v9 is still CJS-friendly but no longer maintained; v10 is current stable |
| express 5 | express 4 | Express 4 is now in maintenance mode; v5 is npm default; async error handling is cleaner |
| cors npm package | manual CORS headers | Manual headers miss preflight edge cases; cors package is battle-tested |
| In-memory array | SQLite/JSON file | No persistence needed for static seed data; memory is simpler and faster |

**Installation:**
```bash
npm install express @faker-js/faker cors
npm install --save-dev typescript tsx @types/express @types/cors @types/node
```

---

## Architecture Patterns

### Recommended Project Structure

```
server/
├── src/
│   ├── constants.ts        # GRID_EMISSION_FACTOR, SPT_TARGET, BASELINE_KWH, thresholds
│   ├── types.ts            # Unit, Summary interfaces
│   ├── seed.ts             # generateUnits() — Faker seed, hero overrides, pre-classification
│   ├── classifier.ts       # classifyUnit() pure function — threshold rules engine
│   ├── aggregator.ts       # buildSummary() — computes building totals from units array
│   ├── routes/
│   │   ├── units.ts        # GET /api/units — returns pre-built units array
│   │   ├── summary.ts      # GET /api/summary — returns pre-built summary object
│   │   └── anomalies.ts    # GET /api/anomalies — returns pre-filtered anomalies array
│   └── index.ts            # Express app setup, CORS, startup, listen
├── tsconfig.json
└── package.json
```

### Pattern 1: Module-Level Pre-computation

**What:** Run all expensive computation once at module import time. Store results in module-level constants. Route handlers just reference these constants.

**When to use:** Always — the data never changes after startup, so there is no reason to recompute per-request.

```typescript
// src/seed.ts
import { faker } from '@faker-js/faker';
import { BASELINE_KWH, GRID_EMISSION_FACTOR } from './constants.js';
import { classifyUnit } from './classifier.js';
import type { Unit } from './types.js';

faker.seed(42); // MUST be called before any faker calls — resets RNG sequence

export const ALL_UNITS: Unit[] = generateUnits();
export const ANOMALIES: Unit[] = ALL_UNITS.filter(u => u.anomalyType !== null);

function generateUnits(): Unit[] {
  const units: Unit[] = [];
  // Floors 2–25, positions 1–20
  for (let floor = 2; floor <= 25; floor++) {
    for (let pos = 1; pos <= 20; pos++) {
      const unitNumber = `${String(floor).padStart(2, '0')}${String(pos).padStart(2, '0')}`;
      const type = faker.helpers.weightedArrayElement([
        { weight: 40, value: 'studio' as const },
        { weight: 40, value: '1BR' as const },
        { weight: 20, value: '2BR' as const },
      ]);
      const baseline = BASELINE_KWH[type];
      const currentKwh = faker.number.float({
        min: CONSUMPTION_RANGES[type].min,
        max: CONSUMPTION_RANGES[type].max,
        fractionDigits: 1,
      });
      const isVampireFlagged = /* deterministic flag based on index */ false;
      const status = classifyUnit(currentKwh, baseline, true, isVampireFlagged);
      units.push({
        id: unitNumber,
        unitNumber,
        floor,
        position: pos,
        type,
        currentKwh,
        baselineKwh: baseline,
        co2e: parseFloat((currentKwh * GRID_EMISSION_FACTOR).toFixed(3)),
        savingsPercent: parseFloat(((baseline - currentKwh) / baseline * 100).toFixed(1)),
        status,
        anomalyType: null,
        isOccupied: true,
      });
    }
  }
  // Apply hero unit overrides AFTER loop (determinism guaranteed by overwrite)
  return applyHeroOverrides(units);
}
```

### Pattern 2: Hero Unit Override

**What:** After generating all 500 units normally, find specific units by ID and overwrite their values with fixed demo-narrative values. This guarantees the demo story regardless of RNG state at that point in the sequence.

**When to use:** Any named demo unit that must always tell the same story.

```typescript
// src/seed.ts (continued)
const HERO_UNITS: Record<string, Partial<Unit>> = {
  '1203': {
    currentKwh: BASELINE_KWH['2BR'] * 3,      // 3x normal — fire hazard
    anomalyType: 'spike' as const,
    status: 'critical' as const,
    isOccupied: true,
  },
  '0815': {
    currentKwh: BASELINE_KWH['1BR'] * 0.85,   // above 60% baseline unoccupied — vampire
    anomalyType: 'vampire' as const,
    status: 'vampire' as const,
    isOccupied: false,
  },
  '2510': {
    currentKwh: BASELINE_KWH['2BR'] * 0.35,   // 65% savings — green champion
    anomalyType: null,
    status: 'normal' as const,
    isOccupied: true,
  },
};

function applyHeroOverrides(units: Unit[]): Unit[] {
  return units.map(unit => {
    const override = HERO_UNITS[unit.id];
    if (!override) return unit;
    const merged = { ...unit, ...override };
    // Recompute derived fields after override
    merged.co2e = parseFloat((merged.currentKwh * GRID_EMISSION_FACTOR).toFixed(3));
    merged.savingsPercent = parseFloat(((merged.baselineKwh - merged.currentKwh) / merged.baselineKwh * 100).toFixed(1));
    return merged;
  });
}
```

### Pattern 3: Pure Classifier Function (DATA-04)

**What:** A stateless pure function that takes unit data and returns a status string. No side effects, no imports of mutable state. Easily testable and shared.

**When to use:** Called during seed generation. Exported for any future consumer.

```typescript
// src/classifier.ts
import { BASELINE_KWH } from './constants.js';

export type UnitStatus = 'normal' | 'elevated' | 'warning' | 'critical' | 'vampire';

export function classifyUnit(
  currentKwh: number,
  baselineKwh: number,
  isOccupied: boolean,
  isVampireFlagged: boolean
): UnitStatus {
  const ratio = currentKwh / baselineKwh;
  if (isVampireFlagged && !isOccupied && ratio > 0.6) return 'vampire';
  if (ratio > 1.2) return 'critical';
  if (ratio > 1.0) return 'warning';
  if (ratio > 0.8) return 'elevated';
  return 'normal';
}
```

### Pattern 4: Express 5 Route Handlers (No Try/Catch Needed)

**What:** Express 5 catches rejected promises automatically. Route handlers that return JSON from pre-computed values never throw anyway, but the pattern is cleaner.

```typescript
// src/routes/units.ts
import { Router } from 'express';
import { ALL_UNITS } from '../seed.js';

export const unitsRouter = Router();

unitsRouter.get('/', (_req, res) => {
  res.json(ALL_UNITS);
});
```

```typescript
// src/index.ts
import express from 'express';
import cors from 'cors';
import { unitsRouter } from './routes/units.js';
import { summaryRouter } from './routes/summary.js';
import { anomaliesRouter } from './routes/anomalies.js';

const PORT = process.env.PORT ?? 3001;
const NEXT_ORIGIN = process.env.NEXT_ORIGIN ?? 'http://localhost:3000';

const app = express();
app.use(cors({ origin: NEXT_ORIGIN }));
app.use(express.json());

app.use('/api/units', unitsRouter);
app.use('/api/summary', summaryRouter);
app.use('/api/anomalies', anomaliesRouter);

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
```

### Pattern 5: Deterministic Anomaly Flagging

**What:** Use the Faker RNG (already seeded) to probabilistically assign vampire/spike flags. Because `faker.seed(42)` is called before any faker calls, the same units get flagged every run. Hero units get hard-coded overrides.

```typescript
// Inside generateUnits() loop, after computing currentKwh:
const roll = faker.number.float({ min: 0, max: 1, fractionDigits: 4 });
const isVampireFlagged = roll < 0.04;      // ~4% vampire load
const isSpiked = !isVampireFlagged && roll > 0.985; // ~1.5% dangerous spike
// hero unit overrides applied afterward — guaranteed regardless of RNG position
```

### Anti-Patterns to Avoid

- **Computing totals in route handlers:** Each request would recompute the same math. Pre-aggregate in `aggregator.ts` at startup, store in module constant.
- **Calling `faker.seed()` inside the unit generation loop:** This resets the RNG sequence each iteration, producing the same unit 500 times. Call `faker.seed(42)` exactly once at module load, before any data generation.
- **Applying hero overrides before the loop finishes:** If hero units are generated inside the loop with special cases, the RNG advances differently than expected. Generate all 500 normally, then overwrite hero units afterward.
- **Returning different data shapes from `/api/units` and `/api/anomalies`:** Anomalies array must be a subset of the same unit objects — just filtered. Frontend code will reuse the same TypeScript interface.
- **Magic numbers in route handlers:** All thresholds, factors, and targets belong in `constants.ts`. Route handlers and seed generator both import from there.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Weighted random unit type selection | Custom probability array + Math.random() | `faker.helpers.weightedArrayElement([{weight, value}])` | Seeded RNG is controlled by Faker; using Math.random() breaks determinism |
| Random float within consumption range | Manual `min + Math.random() * (max - min)` | `faker.number.float({min, max, fractionDigits})` | Same reason — must use Faker's seeded RNG, not Math.random() |
| CORS header management | `res.setHeader('Access-Control-Allow-Origin', ...)` | `cors` npm package | Preflight OPTIONS requests, credential handling, and method whitelisting all have edge cases |
| Unit ID zero-padding | Custom padding function | `String(floor).padStart(2, '0')` | Native JS — no library needed, but do not use sprintf or lodash for this |

**Key insight:** Any randomness during data generation MUST go through Faker's seeded RNG. Mixing `Math.random()` and `faker.*` breaks determinism — `Math.random()` is not seeded by `faker.seed()`.

---

## Common Pitfalls

### Pitfall 1: faker.seed() Called Too Late

**What goes wrong:** `faker.seed(42)` is called after some faker calls have already happened (e.g., from an import side effect). The first N calls used an unseeded RNG. Data is different on each restart.

**Why it happens:** ES module top-level imports execute before your explicit seed call if faker is used in a module that gets imported before `seed()`.

**How to avoid:** Call `faker.seed(42)` as the very first line of `seed.ts`, before any other faker usage. Do not use faker in `constants.ts` or `types.ts`.

**Warning signs:** Unit 1203 has different kWh values on different server restarts, OR anomaly count fluctuates.

### Pitfall 2: Faker v10 ESM in CommonJS Project

**What goes wrong:** `ERR_REQUIRE_ESM` error when importing `@faker-js/faker` if using an older Node version or ts-node with incorrect module settings.

**Why it happens:** Faker v10 is ESM-only. CommonJS `require()` of ESM works natively only on Node 20.19+ / 22.13+ / 24+. ts-node has ESM mode compatibility issues.

**How to avoid:** Use `tsx` as the TypeScript runner (not `ts-node`). Ensure Node version is 20.19+. Set `"moduleResolution": "NodeNext"` in tsconfig.json.

**Warning signs:** Stack trace mentions `ERR_REQUIRE_ESM` or `Cannot use import statement in a module`.

### Pitfall 3: Hero Unit Override Breaks Aggregates

**What goes wrong:** Hero unit 1203 is overridden to 3x baseline kWh AFTER building totals are computed. The `/api/summary` response shows pre-override numbers — the CO₂e total doesn't include the spike.

**Why it happens:** Aggregation runs before hero overrides are applied.

**How to avoid:** Apply hero overrides inside `generateUnits()` before returning the array. Compute aggregates from the final returned array, not during generation.

**Warning signs:** `totalKwh` in `/api/summary` doesn't match `sum(unit.currentKwh)` from `/api/units`.

### Pitfall 4: Floating Point Drift in ESG Math

**What goes wrong:** `savingsPercent` on unit level doesn't sum to match `savingsPercent` on the summary level. Judges spot the inconsistency.

**Why it happens:** Per-unit savings are rounded individually, then summed. The summary savings is computed from totals — different rounding path.

**How to avoid:** Compute summary savings from raw totals only: `(totalBaseline - totalCurrent) / totalBaseline * 100`. Do not sum per-unit savingsPercent values. Round only at display layer (or only in the final `toFixed()` call before JSON serialization).

**Warning signs:** `summary.savingsPercent` differs by 0.3–0.5% from expected value.

### Pitfall 5: CORS Missing for Preflight

**What goes wrong:** `GET /api/units` works in Postman but fails in browser from Next.js dev server with CORS error.

**Why it happens:** Browsers send `OPTIONS` preflight for cross-origin requests. Returning 200 on GET but not handling OPTIONS causes the browser to block the actual request.

**How to avoid:** Apply `app.use(cors({origin: 'http://localhost:3000'}))` before all routes. The cors package handles OPTIONS automatically when used as global middleware.

**Warning signs:** Browser console shows "has been blocked by CORS policy: Response to preflight request doesn't pass access control check".

### Pitfall 6: Ground Floor Units Created

**What goes wrong:** Floor 1 (lobby/amenities) gets included in the unit array, inflating count and including non-residential data.

**Why it happens:** Loop starts at `floor = 1` instead of `floor = 2`.

**How to avoid:** Loop from `floor = 2` to `floor = 25` (inclusive). Total: 24 floors × 20 units = 480 units. Wait — this produces 480, not 500. Verify with user or add floors 26-27 for overflow units, OR treat lobby as floor 0 and run floors 1-25 (= 500 units starting at 1).

**Warning signs:** `/api/units` returns 480 records instead of 500+.

---

## Code Examples

Verified patterns from official sources:

### Deterministic Seeding (Faker v10)

```typescript
// Source: https://fakerjs.dev/api/faker
import { faker } from '@faker-js/faker';

faker.seed(42);
// All subsequent faker.* calls produce identical output on every run
const kWh = faker.number.float({ min: 80, max: 150, fractionDigits: 1 }); // e.g., 112.7
```

### Weighted Unit Type Selection

```typescript
// Source: https://fakerjs.dev/api/helpers
const unitType = faker.helpers.weightedArrayElement([
  { weight: 40, value: 'studio' as const },
  { weight: 40, value: '1BR' as const },
  { weight: 20, value: '2BR' as const },
]);
// Returns 'studio' 40% of time, '1BR' 40%, '2BR' 20% — deterministically
```

### Number in Range

```typescript
// Source: https://fakerjs.dev/api/number
// Integer:
faker.number.int({ min: 80, max: 150 });          // Returns integer

// Float with 1 decimal:
faker.number.float({ min: 80, max: 150, fractionDigits: 1 }); // Returns e.g. 112.7
```

### CORS for Next.js Dev Server

```typescript
// Source: https://expressjs.com/en/resources/middleware/cors.html
import cors from 'cors';
import type { CorsOptions } from 'cors';

const corsOptions: CorsOptions = {
  origin: 'http://localhost:3000',   // Next.js dev server
};
app.use(cors(corsOptions));
// OPTIONS preflight is handled automatically
```

### Express 5 Route Handler (No try/catch needed)

```typescript
// Source: https://expressjs.com/2025/03/31/v5-1-latest-release.html
import { Router, Request, Response } from 'express';
import { ALL_UNITS } from '../seed.js';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(ALL_UNITS);  // Already computed — instant response
});

export { router as unitsRouter };
```

### tsx Development Script

```json
// package.json
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "start": "node dist/index.js",
    "build": "tsc"
  }
}
```

### Building Aggregate Summary

```typescript
// src/aggregator.ts — called once after generateUnits()
import { ALL_UNITS } from './seed.js';
import { GRID_EMISSION_FACTOR, SPT_TARGET, SBTI_REDUCTION_TARGET } from './constants.js';
import type { Summary } from './types.js';

function buildSummary(units: typeof ALL_UNITS): Summary {
  const totalKwh = units.reduce((sum, u) => sum + u.currentKwh, 0);
  const totalBaselineKwh = units.reduce((sum, u) => sum + u.baselineKwh, 0);
  const totalCo2e = parseFloat((totalKwh * GRID_EMISSION_FACTOR).toFixed(2));
  const savingsPercent = parseFloat(
    ((totalBaselineKwh - totalKwh) / totalBaselineKwh * 100).toFixed(1)
  );
  return {
    totalKwh: parseFloat(totalKwh.toFixed(1)),
    totalCo2e,
    totalBaselineKwh: parseFloat(totalBaselineKwh.toFixed(1)),
    savingsPercent,
    sptProgress: parseFloat((savingsPercent / SPT_TARGET * 100).toFixed(1)),
    sbtiProgress: parseFloat((savingsPercent / SBTI_REDUCTION_TARGET * 100).toFixed(1)),
    unitCount: units.length,
    anomalyCount: units.filter(u => u.anomalyType !== null).length,
    unitsOverThreshold: units.filter(u => ['warning', 'critical', 'vampire'].includes(u.status)).length,
    statusBreakdown: {
      normal: units.filter(u => u.status === 'normal').length,
      elevated: units.filter(u => u.status === 'elevated').length,
      warning: units.filter(u => u.status === 'warning').length,
      critical: units.filter(u => u.status === 'critical').length,
      vampire: units.filter(u => u.status === 'vampire').length,
    },
  };
}

export const SUMMARY: Summary = buildSummary(ALL_UNITS);
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ts-node for TypeScript execution | tsx watch | 2023–2024 | No ESM compatibility issues; `--watch` replaces nodemon; faster startup |
| Express 4 (maintenance) | Express 5 (5.2.1, npm default) | October 2024 (5.0), March 2025 (5.1 = default) | Async errors caught automatically; no manual next(err) calls |
| faker v9 (CJS-compatible) | faker v10 (ESM-only, 10.3.0) | Late 2024 | Requires Node 20.19+; use tsx to avoid ESM headaches |
| ts-node + nodemon | tsx --watch | 2024 | Single dev dependency replaces two tools; no configuration file needed |

**Deprecated/outdated:**
- `faker.random.arrayElement()`: Removed in v9+. Use `faker.helpers.arrayElement()`.
- `faker.address.*`: Removed in v10. Use `faker.location.*`.
- `faker.name.*`: Removed in v10. Use `faker.person.*`.
- `ts-node` for ESM projects: Has known ESM issues; replaced by `tsx`.
- Express 4: Now in 12-month maintenance window. New projects should use Express 5.

---

## Open Questions

1. **Unit count: 480 vs 500+**
   - What we know: 24 floors (2–25) × 20 units = 480 units. CONTEXT.md says "500 units" and "25 floors, 20 units per floor."
   - What's unclear: Does "25 floors" count floor 1 (lobby)? If floors 1–25 all have 20 units, that's 500 — but floor 1 is excluded per decisions. If it's 24 inhabited floors × 20 = 480.
   - Recommendation: Use floors 1–25 with floor 1 being a "commercial/amenity floor" that still gets unit records but tagged as `type: 'amenity'`, OR interpret "25 floors" as the highest floor number with units starting at floor 2 (floor 26 = roof). The planner should add 2 units to floor 25 or a floor 26 to hit 500+. Simplest fix: generate floors 2–26 = 500 units exactly, or 2–25 = 480 and accept 480 as "500+". The requirement says "500+" — 480 technically fails. **Plan should address this explicitly.**

2. **Hero unit 1203 floor count**
   - What we know: Unit 1203 is "Floor 12, Pos 03" per CONTEXT.md. Floor 12 exists in any scheme above.
   - What's unclear: Nothing — this works under any floor numbering scheme.
   - Recommendation: No action needed.

3. **Vampire flagging and RNG determinism with seeded faker**
   - What we know: Faker v10 uses 53-bit randomization (two values consumed per step vs one in v8). Seed 42 produces a consistent sequence.
   - What's unclear: After the hero override, does the sequence shift? No — overrides are applied by overwriting values after generation, not by conditionally calling faker.
   - Recommendation: Generate all 500 units with faker calls in order, THEN apply hero overrides as map(). RNG is not involved in overrides.

---

## Sources

### Primary (HIGH confidence)
- `https://fakerjs.dev/api/faker` — seed() API signature, v10 behavior verified
- `https://fakerjs.dev/api/number` — faker.number.int() and faker.number.float() signatures verified
- `https://fakerjs.dev/api/helpers` — weightedArrayElement(), arrayElement(), multiple() signatures verified
- `https://fakerjs.dev/guide/upgrading` — v9→v10 breaking changes including ESM-only, Node requirements
- `https://expressjs.com/en/resources/middleware/cors.html` — cors middleware official docs
- `https://expressjs.com/2025/03/31/v5-1-latest-release.html` — Express 5.1 LTS announcement, async error handling

### Secondary (MEDIUM confidence)
- `https://www.reactsquad.io/blog/how-to-set-up-express-5-in-2025` — Express 5 + TypeScript project structure, verified against Express 5 docs pattern
- `https://tsx.is/` — tsx runner, confirmed as recommended alternative to ts-node for ESM projects
- `https://www.npmjs.com/package/@faker-js/faker` — current version confirmed as 10.3.0

### Tertiary (LOW confidence)
- WebSearch: consumption ranges 80–150 kWh/mo for studio in Philippines — accepted as plausible but not independently verified against MERALCO data; user has approved these values in CONTEXT.md so research deference is appropriate.

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — Express 5.2.1 and @faker-js/faker 10.3.0 verified on npm; cors 2.8.5 confirmed; tsx confirmed from official site
- Architecture: HIGH — pre-computation pattern is straightforward; module structure verified against Express 5 official guidance
- Pitfalls: HIGH — faker.seed() placement and ESM/CJS issue verified against official upgrade guide; CORS preflight behavior confirmed from official cors docs
- Floor count ambiguity: LOW — this is a spec interpretation question, not a technical research gap

**Research date:** 2026-02-20
**Valid until:** 2026-03-22 (30 days — stable libraries, slow-moving domain)

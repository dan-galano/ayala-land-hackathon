# Architecture Research

**Domain:** Energy monitoring dashboard — multi-unit building admin view
**Researched:** 2026-02-20
**Confidence:** HIGH (Next.js/Express patterns), MEDIUM (energy-domain specifics)

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     BROWSER (Desktop Admin)                      │
├──────────────────────────┬──────────────────────────────────────┤
│   Next.js App (port 3000)│                                      │
│  ┌───────────────────┐   │  ┌──────────────────────────────┐    │
│  │  Dashboard Page   │   │  │   Heatmap Grid Component     │    │
│  │  (Server Comp.)   │   │  │   (Client Component)         │    │
│  └────────┬──────────┘   │  └──────────────┬───────────────┘    │
│           │              │                 │                     │
│  ┌────────▼──────────┐   │  ┌──────────────▼───────────────┐    │
│  │  KPI Stats Cards  │   │  │   Anomaly Alerts Panel       │    │
│  │  (Client Comp.)   │   │  │   (Client Component)         │    │
│  └────────┬──────────┘   │  └──────────────┬───────────────┘    │
│           │              │                 │                     │
├───────────┼──────────────┴─────────────────┼────────────────────┤
│           │    Data Fetch Layer (fetch/SWR) │                    │
├───────────┴────────────────────────────────┴────────────────────┤
│                  Express API Server (port 4000)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐  │
│  │ GET /summary │  │ GET /units   │  │ GET /anomalies        │  │
│  │ (building    │  │ (all 500+    │  │ (threshold-flagged    │  │
│  │  KPI totals) │  │  units grid) │  │  units only)          │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬────────────┘  │
│         │                 │                      │               │
├─────────┴─────────────────┴──────────────────────┴──────────────┤
│                     In-Memory Data Store                          │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Seeded unit records (500+ objects, loaded at startup)   │    │
│  └──────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Dashboard Page | Route entry point, triggers data fetch, composes layout | Next.js Server Component or top-level Client Component |
| Heatmap Grid | Renders 500+ unit cells color-coded by energy status | CSS Grid + conditional Tailwind classes per status bucket |
| KPI Stats Cards | Shows building-level totals: kWh, CO2, savings %, loan progress | Simple Client Components receiving pre-aggregated props |
| Anomaly Alerts Panel | Lists units breaching thresholds (vampire loads, spikes) | Filtered view of units array from the same API response |
| Express Summary Endpoint | Aggregates all unit data into building totals | `GET /api/summary` — sum kWh, compute CO2, compare against SPT |
| Express Units Endpoint | Returns all 500+ unit records for heatmap rendering | `GET /api/units` — full array with status field pre-computed |
| Express Anomalies Endpoint | Returns only flagged units | `GET /api/anomalies` — filtered subset, threshold applied server-side |
| In-Memory Data Store | Holds seeded dataset, loaded once at server startup | Plain JS array exported from `data/seed.js` |

---

## Recommended Project Structure

```
hackathon/
├── frontend/                        # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           # Root layout (fonts, globals)
│   │   │   ├── page.tsx             # Dashboard page (entry point)
│   │   │   └── loading.tsx          # Skeleton while data loads
│   │   ├── components/
│   │   │   ├── heatmap/
│   │   │   │   ├── HeatmapGrid.tsx  # 500+ unit grid
│   │   │   │   └── UnitCell.tsx     # Single unit cell (color + tooltip)
│   │   │   ├── stats/
│   │   │   │   ├── KpiCard.tsx      # Reusable stat card shell
│   │   │   │   ├── TotalKwhCard.tsx
│   │   │   │   ├── Co2Card.tsx
│   │   │   │   └── LoanProgressBar.tsx
│   │   │   └── alerts/
│   │   │       └── AnomalyPanel.tsx # Flagged units list
│   │   ├── lib/
│   │   │   ├── api.ts               # Typed fetch wrappers for Express endpoints
│   │   │   └── constants.ts         # Threshold values, color buckets
│   │   └── types/
│   │       └── index.ts             # Shared Unit, Summary, Anomaly types
│   ├── next.config.ts
│   └── package.json
│
└── server/                          # Express API server
    ├── src/
    │   ├── index.ts                 # Express app setup, CORS, routes mount
    │   ├── data/
    │   │   └── seed.ts              # Data generator — creates 500+ unit objects
    │   ├── routes/
    │   │   ├── summary.ts           # GET /api/summary
    │   │   ├── units.ts             # GET /api/units
    │   │   └── anomalies.ts         # GET /api/anomalies
    │   └── lib/
    │       ├── thresholds.ts        # Threshold constants and status classifier
    │       └── aggregator.ts        # Computation: totals, CO2 conversion, % savings
    └── package.json
```

### Structure Rationale

- **`components/heatmap/`:** Isolated because the grid is the most complex component and will be the primary parallel workstream. Keeps UnitCell separately testable.
- **`components/stats/`:** Each KPI card is a separate file so two devs can work on different cards simultaneously without merge conflicts.
- **`lib/api.ts`:** Centralizes all fetch calls to Express — single place to change base URL, add error handling, type responses.
- **`server/data/seed.ts`:** Separated from route logic so it can be independently iterated on (realistic vs. extreme data) without touching API handlers.
- **`server/lib/aggregator.ts`:** All math (kWh totals, CO2 factor, SPT % progress) lives here — testable in isolation, not scattered across routes.
- **`server/lib/thresholds.ts`:** Status classification logic (`normal | warning | critical | vampire`) centralized so frontend and backend use the same buckets.

---

## Architectural Patterns

### Pattern 1: Pre-Aggregate on the Server, Not the Client

**What:** Express routes compute building totals and status classifications before responding. The frontend receives ready-to-render data.

**When to use:** Always, in this project. The alternative — returning raw readings and computing in the browser — wastes time and creates rendering delays when processing 500+ records.

**Trade-offs:** Slightly more logic in Express routes, but dramatically simpler React components and faster perceived performance.

**Example:**
```typescript
// server/routes/summary.ts
router.get('/api/summary', (req, res) => {
  const units = getSeededUnits(); // pre-loaded array
  const totalKwh = units.reduce((sum, u) => sum + u.kwh, 0);
  const co2Kg = totalKwh * CO2_FACTOR_KG_PER_KWH; // 0.4921 for PH grid
  const baselineKwh = BUILDING_BASELINE_KWH;
  const savingsPct = ((baselineKwh - totalKwh) / baselineKwh) * 100;
  const sptProgress = Math.min(savingsPct / SPT_TARGET_PCT, 1);

  res.json({ totalKwh, co2Kg, savingsPct, sptProgress, unitCount: units.length });
});
```

### Pattern 2: Status Bucket Classification at Seed/Route Boundary

**What:** Each unit gets a `status` field (`normal | elevated | warning | critical | vampire`) computed once in the aggregator, not inside the React render loop.

**When to use:** Any time you are color-coding or filtering 500+ items. Computing status inside a `.map()` in JSX is wasteful and makes the heatmap component stateful when it should be pure.

**Trade-offs:** Requires consistent threshold constants shared between server and frontend (`constants.ts` / `thresholds.ts`). Easy to keep in sync for a hackathon.

**Example:**
```typescript
// server/lib/thresholds.ts
export function classifyUnit(kwh: number): UnitStatus {
  if (kwh < 50)   return 'vampire';   // suspiciously low — vampire load
  if (kwh < 200)  return 'normal';
  if (kwh < 350)  return 'elevated';
  if (kwh < 500)  return 'warning';
  return 'critical';                  // spike — flag for alert panel
}
```

### Pattern 3: CSS Grid Heatmap, Not a Chart Library

**What:** The 500-unit grid is rendered with CSS Grid and Tailwind color classes, not Recharts or D3. Each cell is a `<div>` with a background color determined by `status`.

**When to use:** When the "chart" is a uniform grid of same-sized cells with color encoding only. Chart libraries add unnecessary overhead and complexity for what is essentially a colored table.

**Trade-offs:** No built-in tooltips, zoom, or pan — but a `title` attribute or a simple hover tooltip via Tailwind hover classes is sufficient for a hackathon demo. Render performance is excellent because it is plain DOM, not SVG or Canvas.

**Example:**
```typescript
// components/heatmap/UnitCell.tsx
const STATUS_COLORS: Record<UnitStatus, string> = {
  normal:   'bg-green-400',
  elevated: 'bg-yellow-300',
  warning:  'bg-orange-400',
  critical: 'bg-red-500',
  vampire:  'bg-blue-300',
};

export function UnitCell({ unit }: { unit: Unit }) {
  return (
    <div
      className={`w-4 h-4 rounded-sm cursor-pointer ${STATUS_COLORS[unit.status]}`}
      title={`Unit ${unit.id}: ${unit.kwh} kWh — ${unit.status}`}
    />
  );
}

// components/heatmap/HeatmapGrid.tsx
export function HeatmapGrid({ units }: { units: Unit[] }) {
  return (
    <div className="grid grid-cols-25 gap-1">
      {units.map(u => <UnitCell key={u.id} unit={u} />)}
    </div>
  );
}
```

---

## Data Flow

### Request Flow

```
User opens dashboard
    ↓
Next.js page.tsx renders
    ↓
fetch('/api/summary') + fetch('/api/units') + fetch('/api/anomalies')
    [run in parallel using Promise.all]
    ↓
Express routes → aggregator.ts → seeded in-memory array
    ↓
JSON responses ← computed totals, classified unit array, filtered anomalies
    ↓
React components receive typed props
    ↓
HeatmapGrid renders 500 cells | KPI cards render totals | AnomalyPanel renders list
```

### State Management

No global state manager needed (no Zustand, no Redux). This is a read-only dashboard with a single fetch on mount. Use:

```
page.tsx (fetch on mount, useState for data)
    ↓ props
HeatmapGrid | KpiCards | AnomalyPanel
```

If filtering is added later (e.g., filter grid by floor), lift state to page-level `useState` — do not reach for a state library for a 3-hour hackathon.

### Key Data Flows

1. **Initial load:** `page.tsx` fetches all three endpoints in parallel on mount → hydrates all components in one pass. No waterfall.
2. **Heatmap render:** Express returns `units[]` with `status` pre-assigned → `HeatmapGrid` maps array directly to `UnitCell` components — zero client-side computation.
3. **KPI cards:** `summary` response provides all aggregated numbers → each card receives one or two props — no calculation in JSX.
4. **Anomaly panel:** Express returns pre-filtered `anomalies[]` → panel maps array to list items — no client-side filtering.

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| Hackathon demo (1 admin) | In-memory array, single Express instance, no caching needed |
| Pilot (10-50 property managers) | Add a real database (PostgreSQL), keep Express aggregation layer |
| Production (1000+ admins, real-time data) | Add Redis for aggregation cache, WebSocket or SSE for live meter pushes, consider time-series DB (TimescaleDB) for historical reads |

### Scaling Priorities

1. **First bottleneck:** Re-computing 500-unit aggregations on every request — fix by memoizing or caching the summary result with a short TTL (30s).
2. **Second bottleneck:** Fetching all 500 unit records on every page load — fix by adding pagination or a floor-based filter parameter to `/api/units`.

---

## Anti-Patterns

### Anti-Pattern 1: Computing Status in JSX

**What people do:** Pass raw `kwh` numbers to the heatmap and compute color inside the render function with `if/else` chains.

**Why it's wrong:** 500 conditional evaluations inside JSX slow the initial render. It also scatters business logic (what counts as "critical"?) into the UI layer, making thresholds hard to change consistently.

**Do this instead:** Classify units in Express before sending the response. Frontend receives `status: 'critical'` — it does not need to know the threshold.

### Anti-Pattern 2: Three Separate Sequential API Calls

**What people do:** Fetch summary, then units, then anomalies in `useEffect` one after another.

**Why it's wrong:** Creates a request waterfall — minimum 3 round-trip latencies before the page is populated. On a demo network this is visually jarring.

**Do this instead:** `Promise.all([fetchSummary(), fetchUnits(), fetchAnomalies()])` — all three fire simultaneously. Page hydrates in one pass after the slowest response resolves.

### Anti-Pattern 3: Using a Chart Library for the Heatmap Grid

**What people do:** Reach for Recharts or ECharts to render the unit grid, treating it like a "chart."

**Why it's wrong:** The heatmap is a uniform grid of color-coded cells, not a data visualization with axes, scales, or transitions. Chart libraries add 50-100KB of bundle weight and complex configuration for something achievable with 20 lines of CSS Grid + Tailwind.

**Do this instead:** CSS Grid with Tailwind color classes. Render time is faster, bundle is smaller, implementation takes 15 minutes instead of 2 hours.

### Anti-Pattern 4: Generating Seed Data on Every API Request

**What people do:** Call the data generator function inside each route handler.

**Why it's wrong:** If the generator uses `Math.random()`, each request produces a different dataset — KPI totals won't match the unit list shown in the heatmap. Also slow.

**Do this instead:** Generate data once at server startup, store in a module-level constant, import that constant into all route handlers. Data is consistent and generation cost is paid once.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| None for hackathon | N/A | All data is seeded in-memory |
| Future: Meralco/sub-meter API | REST polling every 15 min, result cached in Redis | Not in scope for hackathon |
| Future: CO2 factor API (Climatiq) | One-time lookup at startup, store conversion factor locally | PH grid factor ~0.4921 kg CO2/kWh hardcode is fine for demo |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Next.js frontend ↔ Express API | HTTP REST (fetch), CORS enabled for localhost:3000 | Set `NEXT_PUBLIC_API_URL=http://localhost:4000` in `.env.local` |
| Express routes ↔ aggregator | Direct function import | No message queue — simple synchronous call for static data |
| Express routes ↔ seed data | Module-level import (singleton) | Must be loaded once at startup, not re-generated per request |
| HeatmapGrid ↔ UnitCell | React props drilling (one level) | No context needed — grid → cells is a simple parent-to-child relationship |

---

## Build Order (Dependencies Between Components)

Build in this order to avoid blocking teammates:

```
Phase 1 (Unblock all):
  server/data/seed.ts           ← defines Unit shape, generates array
  server/lib/thresholds.ts      ← defines UnitStatus type and classifier
  server/lib/aggregator.ts      ← depends on seed.ts and thresholds.ts
  frontend/types/index.ts       ← mirrors server Unit/Summary/Anomaly types

Phase 2 (Parallel workstreams after Phase 1):
  [Dev A] server/routes/units.ts
          server/routes/summary.ts
          server/routes/anomalies.ts

  [Dev B] frontend/components/heatmap/UnitCell.tsx
          frontend/components/heatmap/HeatmapGrid.tsx

  [Dev C] frontend/components/stats/KpiCard.tsx
          frontend/components/stats/LoanProgressBar.tsx
          frontend/components/alerts/AnomalyPanel.tsx

Phase 3 (Integration):
  frontend/lib/api.ts           ← wire fetch calls to Express endpoints
  frontend/app/page.tsx         ← compose all components, call api.ts
```

The seed data schema is the critical dependency. Define `Unit` type and sample records first — everything else builds from that contract.

---

## Sources

- Next.js official project structure docs (fetched 2026-02-20): https://nextjs.org/docs/app/getting-started/project-structure — HIGH confidence
- Next.js data fetching patterns (SWR vs React Query comparison): https://www.buttercups.tech/blog/react/nextjs-swr-vs-react-query-which-data-fetching-wins — MEDIUM confidence
- Express REST API aggregation patterns: https://treblle.com/blog/egergr — MEDIUM confidence
- React chart library performance comparison 2025: https://blog.logrocket.com/best-react-chart-libraries-2025/ — MEDIUM confidence
- CSS Grid heatmap approach (React Graph Gallery): https://www.react-graph-gallery.com/heatmap — MEDIUM confidence
- WebSearch: building energy dashboard component patterns — LOW confidence (no direct energy-domain architecture sources found; patterns inferred from general dashboard architecture literature)

---
*Architecture research for: Energy monitoring dashboard — Ayala Land Net-Zero Command Center*
*Researched: 2026-02-20*

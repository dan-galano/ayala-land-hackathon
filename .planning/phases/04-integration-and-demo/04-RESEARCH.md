# Phase 4: Integration and Demo - Research

**Researched:** 2026-02-20
**Domain:** Next.js server component data composition, React client component state lifting, anomaly panel component, Promise.all fetch pattern
**Confidence:** HIGH

---

## Summary

Phase 4 is a pure integration phase — no new API endpoints, no new libraries, no new data models. All v1 requirements are already marked complete (see REQUIREMENTS.md traceability table). The work is: (1) build the AnomalyPanel component, (2) lift the `Promise.all` across all three API endpoints into `page.tsx`, and (3) thread props down so every component on the page consumes data from that single coordinated fetch rather than making independent fetches.

The codebase is already in a strong position. `page.tsx` is a Next.js server component that currently fetches only `/api/units`. `KpiSection` is a client component that independently fetches `/api/summary` via `useEffect`. `HeatmapGrid` receives `units` as a prop from `page.tsx`. The integration task is to expand the server-side `page.tsx` fetch to include all three endpoints (`/api/units`, `/api/summary`, `/api/anomalies`) concurrently via `Promise.all`, then pass `summary` and `anomalies` down as props. The `KpiSection` component was explicitly designed for this — the Phase 3 SUMMARY.md documents: "Phase 4 will add optional `summary?: Summary` prop when lifting state for Promise.all."

The demo narrative targets are deterministic from the seed: `savingsPercent=38.1%` (< 40% SPT target = AT RISK), `Unit 1203` is always critical (hardcoded hero override at `BASELINE_KWH['2BR'] * 3 = 1500 kWh`), `Unit 0815` is always the vampire hero (1BR at 255 kWh, unoccupied). The `ANOMALIES` export from `seed.ts` is the pre-filtered array of all units where `anomalyType !== null` — approximately 27-30 units including both heroes.

**Primary recommendation:** Server component `Promise.all` fetch in `page.tsx` is the correct integration point. One coordinated server-side fetch replaces two independent client-side fetches and eliminates race conditions during the demo.

---

## Standard Stack

### Core (already installed — no new packages needed)

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.1.6 | Server component + RSC data fetch | Already installed; `page.tsx` is already async server component |
| react | 19.2.3 | Component model | Already installed |
| tailwindcss | ^4 | Styling | Already installed; Tailwind v4 CSS-first config in globals.css |
| typescript | ^5 | Type safety | Already installed |

### No New Dependencies Required

Phase 4 requires zero new npm installs. All needed libraries are already present. The `AnomalyPanel` component is built with the same plain Tailwind v4 patterns established in Phase 3 (no @tremor/react).

**Installation:**
```bash
# No new packages — Phase 4 uses existing stack only
```

---

## Architecture Patterns

### Current State (What Exists)

```
client/
├── app/
│   ├── page.tsx              # Server component — fetches /api/units ONLY (needs expansion)
│   ├── layout.tsx            # Root layout, bg-slate-900, globals.css import
│   └── globals.css           # Tailwind v4 + spike-glow animation
├── components/
│   ├── HeatmapGrid.tsx       # 'use client' — receives units prop, owns selectedUnit state
│   ├── UnitCell.tsx          # 'use client' — memo, status colors, spike/vampire icons
│   ├── UnitDetailPanel.tsx   # No 'use client' directive — fixed slide-in panel
│   └── kpi/
│       ├── KpiSection.tsx    # 'use client' — independently fetches /api/summary via useEffect
│       ├── KpiCard.tsx       # Pure presentational
│       ├── SbtiIndicator.tsx # Pure presentational
│       └── SptProgressBar.tsx # Pure presentational
└── lib/
    ├── api.ts                # fetchSummary() + fetchUnits() — client-side helpers
    └── types.ts              # Unit, Summary, UnitType, UnitStatus, AnomalyType
```

### Target State (What Phase 4 Builds)

```
client/
├── app/
│   └── page.tsx              # MODIFIED: Promise.all([units, summary, anomalies]) server fetch
├── components/
│   ├── AnomalyPanel.tsx      # NEW: list of flagged units with orange/red badges
│   └── kpi/
│       └── KpiSection.tsx    # MODIFIED: accepts optional summary prop (skips fetch if provided)
└── lib/
    └── api.ts                # OPTIONAL: add fetchAnomalies() helper
```

### Pattern 1: Server Component Promise.all Fetch

**What:** Expand `page.tsx` to fetch all three API endpoints concurrently. Pass results as props to child components. Eliminates the KpiSection independent client fetch during the live demo.

**When to use:** Always for the integration page. Server-side fetch from `localhost:3001` bypasses browser CORS (runs from Node.js process). `cache: 'force-cache'` is appropriate for deterministic seeded data.

**Current page.tsx:**
```typescript
// client/app/page.tsx — CURRENT STATE
import { HeatmapGrid } from '@/components/HeatmapGrid'
import { KpiSection } from '@/components/kpi/KpiSection'
import type { Unit } from '@/lib/types'

export default async function Page() {
  let units: Unit[] = []

  try {
    const res = await fetch('http://localhost:3001/api/units', {
      cache: 'force-cache',
    })
    if (!res.ok) throw new Error(`API error: ${res.status}`)
    units = await res.json()
  } catch (err) {
    console.error('Failed to fetch units from Express API:', err)
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">Avida Towers Vita — Net-Zero Command Center</h1>
      <KpiSection />
      <HeatmapGrid units={units} />
    </main>
  )
}
```

**Target page.tsx (after integration):**
```typescript
// client/app/page.tsx — TARGET STATE
import { HeatmapGrid } from '@/components/HeatmapGrid'
import { KpiSection } from '@/components/kpi/KpiSection'
import { AnomalyPanel } from '@/components/AnomalyPanel'
import type { Unit, Summary } from '@/lib/types'

const API_BASE = 'http://localhost:3001'

export default async function Page() {
  let units: Unit[] = []
  let summary: Summary | null = null
  let anomalies: Unit[] = []

  try {
    const [unitsRes, summaryRes, anomaliesRes] = await Promise.all([
      fetch(`${API_BASE}/api/units`, { cache: 'force-cache' }),
      fetch(`${API_BASE}/api/summary`, { cache: 'force-cache' }),
      fetch(`${API_BASE}/api/anomalies`, { cache: 'force-cache' }),
    ])

    if (!unitsRes.ok) throw new Error(`units: ${unitsRes.status}`)
    if (!summaryRes.ok) throw new Error(`summary: ${summaryRes.status}`)
    if (!anomaliesRes.ok) throw new Error(`anomalies: ${anomaliesRes.status}`)

    ;[units, summary, anomalies] = await Promise.all([
      unitsRes.json(),
      summaryRes.json(),
      anomaliesRes.json(),
    ])
  } catch (err) {
    console.error('Failed to fetch dashboard data:', err)
  }

  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-white">
        Avida Towers Vita — Net-Zero Command Center
      </h1>
      <KpiSection summary={summary} />
      <div className="flex gap-6">
        <div className="flex-1 min-w-0">
          <HeatmapGrid units={units} />
        </div>
        <div className="w-80 shrink-0">
          <AnomalyPanel anomalies={anomalies} />
        </div>
      </div>
    </main>
  )
}
```

### Pattern 2: KpiSection Prop Acceptance (Lift State)

**What:** Modify `KpiSection` to accept an optional `summary` prop. When provided (from the server component), skip the `useEffect` fetch entirely. When not provided, fall back to the existing client-side fetch.

**Why:** Avoids two separate API calls to `/api/summary` (one server-side in page.tsx, one client-side in KpiSection). The server fetch is faster, runs before the page renders, and avoids the loading flash.

**Current KpiSection signature:**
```typescript
export function KpiSection() {  // No props — fetches independently
```

**Target KpiSection signature:**
```typescript
// client/components/kpi/KpiSection.tsx — MODIFIED
"use client"

import { useEffect, useState } from "react"
import type { Summary } from "@/lib/types"
import { fetchSummary } from "@/lib/api"
import { KpiCard } from "./KpiCard"
import { SbtiIndicator } from "./SbtiIndicator"
import { SptProgressBar } from "./SptProgressBar"

interface Props {
  summary?: Summary | null  // optional: when provided by server, skip client fetch
}

export function KpiSection({ summary: initialSummary }: Props) {
  const [summary, setSummary] = useState<Summary | null>(initialSummary ?? null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Skip client fetch if server already provided summary
    if (initialSummary) return
    fetchSummary()
      .then(setSummary)
      .catch((e) => setError(e.message))
  }, [initialSummary])

  if (error) {
    return (
      <div className="rounded-lg border border-red-800 bg-red-900/20 p-4 text-red-400">
        Failed to load KPI data: {error}
      </div>
    )
  }

  if (!summary) {
    return <div className="text-slate-500 text-sm">Loading KPI data...</div>
  }

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <KpiCard title="Total Consumption" value={`${summary.totalKwh.toLocaleString()} kWh`} />
        <KpiCard title="Scope 3 Tenant Emissions" value={`${summary.totalCo2e.toLocaleString()} kg CO₂e`} />
        <KpiCard title="Units Over Threshold" value={`${summary.unitsOverThreshold}`} subtitle={`of ${summary.unitCount} total units`} />
        <KpiCard title="Energy Savings vs Baseline" value={`${summary.savingsPercent.toFixed(1)}%`} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <SbtiIndicator progress={summary.sbtiProgress} savingsPercent={summary.savingsPercent} />
        <SptProgressBar progress={summary.sptProgress} savingsPercent={summary.savingsPercent} />
      </div>
    </section>
  )
}
```

### Pattern 3: AnomalyPanel Component

**What:** A new right-sidebar panel listing flagged units from `/api/anomalies`. Shows orange badge for vampire loads, red badge for dangerous spikes. Sorts hero units to top (Unit 1203 critical, Unit 0815 vampire). Pure presentational component — receives `anomalies: Unit[]` as a prop from page.tsx.

**Structure:**
```typescript
// client/components/AnomalyPanel.tsx — NEW FILE
import type { Unit } from '@/lib/types'

interface Props {
  anomalies: Unit[]
}

const BADGE_STYLES: Record<string, string> = {
  spike: 'bg-red-600 text-white',
  vampire: 'bg-orange-500 text-white',
}

const BADGE_LABELS: Record<string, string> = {
  spike: 'SPIKE',
  vampire: 'VAMPIRE',
}

function AnomalyRow({ unit }: { unit: Unit }) {
  const badgeStyle = unit.anomalyType ? BADGE_STYLES[unit.anomalyType] : ''
  const badgeLabel = unit.anomalyType ? BADGE_LABELS[unit.anomalyType] : ''

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{unit.unitNumber}</p>
        <p className="text-xs text-slate-400">F{unit.floor} · {unit.currentKwh.toFixed(0)} kWh</p>
      </div>
      <span className={`text-xs font-bold px-2 py-0.5 rounded ${badgeStyle}`}>
        {badgeLabel}
      </span>
    </div>
  )
}

export function AnomalyPanel({ anomalies }: Props) {
  // Sort: critical/spike first, then vampire; heroes bubble to top naturally
  const sorted = [...anomalies].sort((a, b) => {
    if (a.anomalyType === 'spike' && b.anomalyType !== 'spike') return -1
    if (b.anomalyType === 'spike' && a.anomalyType !== 'spike') return 1
    return b.currentKwh - a.currentKwh
  })

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-4 h-fit">
      <h2 className="text-sm font-semibold text-white mb-1">Anomaly Report</h2>
      <p className="text-xs text-slate-400 mb-3">{anomalies.length} units flagged</p>
      <div className="overflow-y-auto max-h-[500px]">
        {sorted.map((unit) => (
          <AnomalyRow key={unit.id} unit={unit} />
        ))}
      </div>
    </div>
  )
}
```

### Layout Pattern: Heatmap + Anomaly Panel Side by Side

**What:** The success criteria require "KPI cards at top, heatmap grid below, anomaly panel alongside." Use a flex row to place the heatmap and anomaly panel side by side below the KPI section.

**Implementation in page.tsx:**
```typescript
<div className="flex gap-6">
  <div className="flex-1 min-w-0">   {/* Heatmap takes remaining space */}
    <HeatmapGrid units={units} />
  </div>
  <div className="w-80 shrink-0">    {/* Anomaly panel fixed 320px width */}
    <AnomalyPanel anomalies={anomalies} />
  </div>
</div>
```

**Why this layout works:** The heatmap is 25 rows × 20 columns of 28px cells with 2px gaps. Total heatmap width ≈ 20 × 30px = 600px. The page has `p-6` (24px sides), so available width at 1280px wide monitor is ~1232px. The anomaly panel at 320px leaves ~900px for the heatmap — well above 600px minimum. No overflow issues.

### Anti-Patterns to Avoid

- **Keeping KpiSection's independent useEffect when summary prop is provided:** Results in a double fetch — one server fetch in page.tsx AND one client-side useEffect fetch. On the demo, both render fine but the client fetch is redundant and creates a brief loading flash.
- **Making AnomalyPanel a 'use client' component:** It receives static props from a server component — no interactivity needed. No client boundary required.
- **Fetching anomalies from the client:** The `/api/anomalies` endpoint is CORS-restricted to `localhost:3000`. A server-side fetch in page.tsx bypasses CORS entirely (Node.js process, not browser). Client-side fetch works too but adds network latency visible during demo.
- **Duplicate title "Avida Towers Vita" on page:** `HeatmapGrid` renders its own `<h1>Avida Towers Vita</h1>` (line 48 of HeatmapGrid.tsx). `page.tsx` also renders the same title (line 21). This is a duplicate heading that should be resolved — either remove from HeatmapGrid or from page.tsx.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Concurrent API fetching | Sequential awaits or custom parallel utility | `Promise.all([...])` natively | Built-in JS; handles concurrent resolution and single rejection; already idiomatic for this codebase |
| Badge/pill styling | Custom badge component system | Plain Tailwind `px-2 py-0.5 rounded` utilities | Already used throughout (KpiCard, SptProgressBar patterns) — consistent with Tailwind v4 approach |
| Sorting anomalies | Custom sort utility function | Inline `.sort()` comparator in AnomalyPanel | Simple two-criterion sort; 5 lines max; no library needed |
| Conditional fetch in KpiSection | SWR or React Query with `enabled` flag | `if (initialSummary) return` early in `useEffect` | Zero dependencies; matches existing useEffect pattern in KpiSection |

**Key insight:** Phase 4 is wiring, not building. Every sub-problem is solved with patterns already established in Phases 2 and 3.

---

## Common Pitfalls

### Pitfall 1: Promise.all with JSON parsing — Two-Step Await

**What goes wrong:** Calling `Promise.all` for both the fetch AND the `.json()` parsing incorrectly.

**Why it happens:** `fetch()` returns a Response, not data. `response.json()` is also async and returns a Promise. You need two rounds of `Promise.all` (or chain correctly).

**How to avoid:** Pattern is:
```typescript
// Step 1: fetch all (wait for headers/status)
const [unitsRes, summaryRes, anomaliesRes] = await Promise.all([
  fetch(url1), fetch(url2), fetch(url3)
])
// Step 2: check status, then parse all bodies concurrently
const [units, summary, anomalies] = await Promise.all([
  unitsRes.json(), summaryRes.json(), anomaliesRes.json()
])
```
Do NOT try to chain `.then(r => r.json())` inside the first Promise.all — the pattern above is clearer and avoids timing confusion.

**Warning signs:** TypeScript error "Property 'id' does not exist on type Response" — you forgot the second `.json()` step.

### Pitfall 2: Duplicate Title Heading

**What goes wrong:** The page shows "Avida Towers Vita — Net-Zero Command Center" twice — once from `page.tsx` line 21 and once from `HeatmapGrid.tsx` line 48.

**Why it happens:** Phase 3 plan says page.tsx renders the building header. Phase 2 put the same heading inside HeatmapGrid. Both are currently live.

**How to avoid:** Remove the `<h1 className="text-white text-2xl font-bold mb-4">Avida Towers Vita</h1>` from `HeatmapGrid.tsx` (line 48). The page-level heading in `page.tsx` is authoritative. HeatmapGrid should not own the page title.

**Warning signs:** Two identical headings visible at the top of the page stacked vertically.

### Pitfall 3: KpiSection Renders Loading State Briefly Even With Server Data

**What goes wrong:** Even when `summary` prop is passed from server, the initial render shows "Loading KPI data..." for one frame before `useState` initializes.

**Why it happens:** `useState(initialSummary ?? null)` — if `initialSummary` is provided and non-null, the initial state IS the summary. No loading flash. However, if the `useEffect` check is wrong (e.g., `if (!summary)` instead of `if (initialSummary)`), it may re-fetch anyway.

**How to avoid:** Use `useState<Summary | null>(initialSummary ?? null)` so the initial render already has data. The `useEffect` guard must be `if (initialSummary) return` — checking the PROP, not the state, to prevent re-fetches when the prop changes identity between renders.

**Warning signs:** KPI section flashes "Loading KPI data..." for 200ms even after server pre-fetched the data.

### Pitfall 4: AnomalyPanel Shows Wrong Badge Color for 'spike' Units

**What goes wrong:** Status `critical` and anomalyType `spike` are different fields. Unit 1203 has `status: 'critical'` AND `anomalyType: 'spike'`. The badge should show red (spike), not rely on `status` field.

**Why it happens:** UnitCell uses the `status` field for color (red = critical). AnomalyPanel should use `anomalyType` for badge color (spike = red, vampire = orange). Confusing the two fields leads to wrong badge colors.

**How to avoid:** Always drive AnomalyPanel badge color from `unit.anomalyType` (not `unit.status`). The badge label should say "SPIKE" or "VAMPIRE" (from anomalyType), not "CRITICAL" or "WARNING" (from status).

**Warning signs:** A vampire unit (orange dashed on heatmap) shows a red badge in the anomaly panel — means you're using `status` (which could be 'critical') instead of `anomalyType` ('vampire').

### Pitfall 5: Server-Side Fetch Fails Silently During Demo

**What goes wrong:** Express server not running → `page.tsx` catch block swallows the error → page renders with empty data → all KPI cards blank → heatmap empty → disaster during demo.

**Why it happens:** Current `page.tsx` has a try/catch that logs to console but renders empty arrays gracefully. This is correct for development but the demo needs the server running.

**How to avoid:** Verify Express server is running (`cd server && npm run dev`) BEFORE starting the Next.js dev server. Add a pre-demo checklist step: `curl http://localhost:3001/api/summary` must return JSON before proceeding.

**Warning signs:** Page loads but all components show empty/loading states. Open browser DevTools Network tab — fetch to `localhost:3001` returns connection refused.

---

## Known Values for Demo Narrative Verification

These are deterministic from the seed and must appear exactly as listed during demo validation:

| Demo Beat | Value | Source |
|-----------|-------|--------|
| Energy savings % | 38.1% | `summary.savingsPercent` from aggregator.ts |
| SPT loan bar label | AT RISK | `savingsPercent (38.1) < SPT_TARGET (40)` |
| SBTi indicator label | ON TRACK | `sbtiProgress (90.7) >= 80` threshold |
| Unit 1203 status | critical | Hero override: `BASELINE_KWH['2BR'] * 3 = 1500 kWh` |
| Unit 1203 anomalyType | spike | Hero override in seed.ts |
| Unit 0815 status | vampire | Hero override: `BASELINE_KWH['1BR'] * 0.85 = 255 kWh`, unoccupied |
| Unit 0815 anomalyType | vampire | Hero override in seed.ts |
| Total anomaly count | ~27-30 units | `ANOMALIES` export = `ALL_UNITS.filter(u => u.anomalyType !== null)` |
| Total kWh | 91,242.6 kWh | Confirmed in 03-02-SUMMARY.md |
| Total CO2e | 61,315.03 kg CO2e | Confirmed in 03-02-SUMMARY.md |
| Units over threshold | varies | `unitsOverThreshold` from summary |

**Demo narrative sequence:**
1. Open dashboard → see KPI cards: "38.1% savings" → AT RISK on loan bar
2. Look at heatmap → spot red glowing cell on floor 12 → hover shows "Unit 1203 — critical"
3. Click Unit 1203 → UnitDetailPanel slides in → shows 1500 kWh, spike anomaly
4. Look at anomaly panel → Unit 1203 at top with red SPIKE badge, Unit 0815 with orange VAMPIRE badge
5. Point to loan bar → "We are 1.9% below the 40% covenant — ₱56B loan at risk"

---

## Code Examples

### Adding fetchAnomalies to lib/api.ts

```typescript
// client/lib/api.ts — ADD THIS FUNCTION
import type { Summary, Unit } from './types'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export async function fetchSummary(): Promise<Summary> {
  const res = await fetch(`${API_BASE}/api/summary`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

export async function fetchUnits(): Promise<Unit[]> {
  const res = await fetch(`${API_BASE}/api/units`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

// NEW:
export async function fetchAnomalies(): Promise<Unit[]> {
  const res = await fetch(`${API_BASE}/api/anomalies`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}
```

Note: `fetchAnomalies()` is for potential client-side use. The server component in `page.tsx` fetches directly with `fetch()` — it does not use these helpers (they use `NEXT_PUBLIC_API_URL` which is undefined server-side).

### Promise.all Error Handling Pattern

```typescript
// Two-phase Promise.all: fetch then parse
// Phase 1: Initiate all requests concurrently
const [unitsRes, summaryRes, anomaliesRes] = await Promise.all([
  fetch('http://localhost:3001/api/units', { cache: 'force-cache' }),
  fetch('http://localhost:3001/api/summary', { cache: 'force-cache' }),
  fetch('http://localhost:3001/api/anomalies', { cache: 'force-cache' }),
])

// Check status codes before parsing
if (!unitsRes.ok || !summaryRes.ok || !anomaliesRes.ok) {
  throw new Error('One or more API endpoints returned an error')
}

// Phase 2: Parse all response bodies concurrently
const [units, summary, anomalies] = await Promise.all([
  unitsRes.json() as Promise<Unit[]>,
  summaryRes.json() as Promise<Summary>,
  anomaliesRes.json() as Promise<Unit[]>,
])
```

### Duplicate Title Fix in HeatmapGrid

```typescript
// client/components/HeatmapGrid.tsx — REMOVE this line (line 48):
// <h1 className="text-white text-2xl font-bold mb-4">Avida Towers Vita</h1>

// The flex wrapper that contained it:
// BEFORE:
<div className="flex flex-col gap-4">
  <h1 className="text-white text-2xl font-bold mb-4">Avida Towers Vita</h1>  // REMOVE
  <div className="flex gap-4">
    ...
  </div>
  <UnitDetailPanel unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
</div>

// AFTER:
<div className="flex flex-col gap-4">
  <div className="flex gap-4">
    ...
  </div>
  <UnitDetailPanel unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
</div>
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Sequential fetch + await in server component | `Promise.all` concurrent fetch | All 3 endpoints resolve in parallel — total latency = slowest endpoint (~1 response time, not 3) |
| KpiSection fetches independently client-side | KpiSection accepts server-pre-fetched `summary` prop | Eliminates double fetch; eliminates loading flash in KPI section |
| Page renders only heatmap | Page renders KPI + heatmap + anomaly panel | Satisfies success criterion 1: "fully assembled page" |

---

## Open Questions

1. **Should AnomalyPanel show all anomalies or just top N?**
   - What we know: `ANOMALIES` array is ~27-30 units. At `max-h-[500px]` with scrolling, all fit. The success criteria say "lists the top flagged units."
   - Recommendation: Show all anomalies sorted (spikes first, then vampires, then by kWh descending). Add a scrollable container. "Top" just means sorted — no truncation needed for 27-30 items.

2. **Does `UnitDetailPanel` need to be co-located with the heatmap or can it be at page level?**
   - What we know: `UnitDetailPanel` is currently rendered inside `HeatmapGrid` and uses `fixed` positioning (`fixed top-0 right-0`). With the anomaly panel now occupying the right side, the fixed panel will overlap the anomaly panel.
   - Recommendation: The UnitDetailPanel uses `z-50` and `fixed` positioning, so it renders above the anomaly panel on click. This is acceptable behavior — clicking a heatmap cell opens the detail overlay on top of the anomaly panel. No refactoring needed; the overlay behavior is intentional.

3. **Should the duplicate heading in HeatmapGrid.tsx be fixed?**
   - What we know: HeatmapGrid line 48 renders `<h1>Avida Towers Vita</h1>`. page.tsx line 21 also renders the same title. Both are currently live.
   - Recommendation: Yes, remove the heading from HeatmapGrid.tsx. It is a component-level concern, not a page concern — the component should not own the page title.

---

## Sources

### Primary (HIGH confidence)

- `client/app/page.tsx` (project file) — current server component structure; existing fetch pattern
- `client/components/kpi/KpiSection.tsx` (project file) — confirmed `useEffect` fetch pattern; no props currently accepted
- `client/lib/types.ts` (project file) — `Unit`, `Summary`, `AnomalyType` types confirmed
- `client/lib/api.ts` (project file) — `fetchSummary()`, `fetchUnits()` helpers; `NEXT_PUBLIC_API_URL` pattern
- `server/src/seed.ts` (project file) — hero unit overrides: Unit 1203 = critical/spike/1500kWh; Unit 0815 = vampire/255kWh
- `server/src/aggregator.ts` (project file) — `savingsPercent` formula: `((totalBaselineKwh - totalKwh) / totalBaselineKwh) * 100`
- `.planning/phases/03-kpi-and-compliance/03-02-SUMMARY.md` — confirmed live values: `totalKwh=91242.6`, `totalCo2e=61315.03`, `savingsPercent=38.1`, `sptProgress=95.3`
- `.planning/STATE.md` — decision: "Phase 4 will add optional summary prop to KpiSection when lifting state for Promise.all fetch"
- `client/components/HeatmapGrid.tsx` — duplicate title found at line 48; `UnitDetailPanel` uses `fixed top-0 right-0 z-50`

### Secondary (MEDIUM confidence)

- Next.js 16 server component patterns — `async function Page()` with `fetch()` is standard RSC data fetching; no new APIs introduced in Next.js 16 vs 15 for this pattern

### Tertiary (LOW confidence)

- Estimated anomaly count (~27-30 units) — computed from seed logic (4% vampire + 1.5% spike of 500 units = ~27.5); not verified by running the server

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — no new packages; all existing; versions confirmed from package.json
- Architecture patterns: HIGH — all patterns derived from reading actual source code; no assumptions
- Demo values: HIGH — derived from server/src/seed.ts hero overrides and confirmed summary values from 03-02-SUMMARY.md
- AnomalyPanel design: HIGH — pure Tailwind v4 components matching established Phase 3 patterns
- Pitfalls: HIGH — identified from direct code inspection (duplicate heading, Promise.all two-step, badge field confusion)
- Anomaly count estimate: LOW — not run against live server; ~27-30 is a calculated estimate

**Research date:** 2026-02-20
**Valid until:** 2026-03-20 (30 days — stable stack, no fast-moving dependencies)

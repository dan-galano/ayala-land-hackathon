# Phase 3: KPI and Compliance - Research

**Researched:** 2026-02-20
**Domain:** React KPI dashboard cards, ESG progress indicators, Next.js client data fetching from Express API
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VIZ-01 | Property manager can view KPI summary cards showing total kWh consumed, total CO₂ saved vs baseline, number of units over threshold, and % energy savings vs baseline | All four values are pre-computed in `/api/summary` response: `totalKwh`, `totalCo2e`, `unitsOverThreshold`, `savingsPercent`. Cards are pure display components — no client computation needed. |
| ESG-01 | Property manager can view a CO₂ emissions card explicitly labeled "Scope 3 Tenant Emissions" showing total tenant CO₂e for the building | `summary.totalCo2e` is the value; the label "Scope 3 Tenant Emissions" is a hardcoded string on the card. Scope 3 is correct: tenant kWh consumption upstream of building ownership. |
| ESG-02 | Property manager can view an SBTi progress indicator showing % of annual carbon budget consumed against Ayala's verified 42% reduction target | `summary.sbtiProgress` = `savingsPercent / 42 * 100`. At 38.1% savings, `sbtiProgress` = 90.7%. On-track threshold should be >= 80% (within striking distance); at-risk < 80%. This field is already computed by the server. |
| FIN-01 | Property manager can view a green loan SPT progress bar showing building's current energy savings % against the 40% target required by sustainability-linked loan covenants | `summary.sptProgress` = `savingsPercent / 40 * 100`. At 38.1% savings, `sptProgress` = 95.3%. The bar fills to 95.3% with a 40% target line. Urgency label when savings < 40% (current state — AT RISK). |
</phase_requirements>

---

## Summary

Phase 3 builds the KPI and compliance section of the dashboard as a Next.js React component that fetches one endpoint — `GET /api/summary` — and renders four summary cards plus two compliance progress indicators. The server (Phase 1) already computes every needed value: `totalKwh`, `totalCo2e`, `unitsOverThreshold`, `savingsPercent`, `sptProgress`, and `sbtiProgress`. Phase 3 React code is purely presentational — no math, no derivations.

The critical decision is the UI library. The ROADMAP specifies Tremor for KPI cards. However, `@tremor/react` v3.18.7 requires **Tailwind CSS v3.4+** and is **not confirmed compatible with Tailwind v4**. Since the project has no frontend directory yet (only `server/` exists), the frontend stack must be initialized in Phase 2 or 3. If Phase 2 initializes the Next.js app with Tailwind v4, Tremor v3 will likely fail to render correctly. The safest path is: use Tailwind v3 if Tremor is required, OR use plain Tailwind v4 with custom card components. The ROADMAP specifically names Tremor, so this decision warrants explicit validation before Phase 3 planning locks a stack.

The actual data values from Phase 1 are known and deterministic: `savingsPercent = 38.1%`, `sptProgress = 95.3%`, `sbtiProgress = 90.7%`, `totalCo2e` ≈ 41,000 kg. At 38.1% savings vs the 40% SPT target, the loan bar should show AT RISK. At 90.7% of the SBTi 42% target, the indicator should show ON TRACK. These known values allow designing the thresholds now.

**Primary recommendation:** Initialize the Next.js frontend with Tailwind v3 (not v4) if Tremor is required per ROADMAP. If Phase 2 has already initialized with Tailwind v4, use plain Tailwind card components and a native `<div>` progress bar rather than `@tremor/react`. Do not mix Tailwind v4 with `@tremor/react` without first testing compatibility.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 14.x or 15.x | React framework with app router | CORS-compliant client fetch from localhost:3001; `"use client"` directive for data fetching component |
| react | 18.2+ | Component model | Required by @tremor/react v3 |
| @tremor/react | 3.18.7 | KPI Card, ProgressBar, BadgeDelta components | Named in ROADMAP plan 03-01; purpose-built for dashboards; ships ProgressBar with `percentageValue` prop |
| tailwindcss | 3.4+ (NOT v4 if using Tremor) | Utility CSS | @tremor/react peer dependency is Tailwind v3.4+; v4 compatibility is unconfirmed |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @headlessui/react | 2.2.0 | Accessible primitives (Tremor dependency) | Auto-installed as Tremor peer dep |
| @tailwindcss/forms | 0.5.9 | Form reset styles (Tremor dependency) | Add to tailwind plugins per Tremor docs |
| @remixicon/react | 4.5.0 | Icon set recommended by Tremor | Optional but matches Tremor's icon vocabulary |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @tremor/react | Plain Tailwind div + CSS progress bar | More work but Tailwind v4 compatible; no external library risk; choose this if Phase 2 already initialized Tailwind v4 |
| @tremor/react | shadcn/ui Progress + Card components | shadcn/ui fully supports Tailwind v4 + Next.js 15; more setup but future-proof; use if Tremor is dropped |
| useEffect + fetch | SWR or React Query | SWR adds caching and revalidation; overkill for static seeded data; useEffect + fetch is simpler for a hackathon |
| Next.js app router server component | Client component "use client" | Server component fetch would be simpler but requires server-side CORS handling; client component is more predictable for the demo |

**Installation (Tremor path — assumes Tailwind v3):**
```bash
# Initialize Next.js app (if not done in Phase 2)
npx create-next-app@latest web --typescript --tailwind --app --src-dir

# Install Tremor and its deps
npm install @tremor/react @headlessui/react @tailwindcss/forms @remixicon/react
```

**Installation (Tailwind v4 path — no Tremor):**
```bash
# Use shadcn/ui Progress component instead
npx shadcn@latest init
npx shadcn@latest add card progress badge
```

---

## Architecture Patterns

### Recommended Project Structure

```
web/src/
├── app/
│   ├── page.tsx              # Dashboard page — assembles KPI section + heatmap (Phase 4)
│   ├── layout.tsx            # Root layout with Tailwind + Tremor CSS import
│   └── globals.css           # Tailwind directives
├── components/
│   ├── kpi/
│   │   ├── KpiSection.tsx    # Fetch /api/summary, pass data to cards
│   │   ├── KpiCard.tsx       # Single metric card (reusable)
│   │   ├── SbtiIndicator.tsx # SBTi progress circle/bar with on-track label
│   │   └── SptProgressBar.tsx # Green loan SPT bar with urgency label
│   └── ui/                   # Shared primitives if not using Tremor
├── lib/
│   └── api.ts                # Typed fetch helpers for all three endpoints
└── types/
    └── api.ts                # Copy of server types.ts (Summary, Unit, etc.)
```

### Pattern 1: Single Fetch, Multiple Consumers

**What:** `KpiSection` fetches `/api/summary` once and passes the single `Summary` object as props to all four KPI cards and both compliance indicators. No prop drilling through the page — the section component owns the data fetch.

**When to use:** Phase 3 is a self-contained section. Phase 4 will lift state to the page level for a `Promise.all` across all three endpoints. Design `KpiSection` to accept `summary: Summary` as a prop so Phase 4 can pass it down without refactoring.

```typescript
// web/src/components/kpi/KpiSection.tsx
"use client";

import { useEffect, useState } from "react";
import type { Summary } from "@/types/api";
import { KpiCard } from "./KpiCard";
import { SbtiIndicator } from "./SbtiIndicator";
import { SptProgressBar } from "./SptProgressBar";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function KpiSection() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE}/api/summary`)
      .then((r) => r.json())
      .then((data: Summary) => {
        setSummary(data);
        setLoading(false);
      });
  }, []);

  if (loading || !summary) return <KpiSectionSkeleton />;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        <KpiCard title="Total Consumption" value={`${summary.totalKwh.toLocaleString()} kWh`} />
        <KpiCard title="Scope 3 Tenant Emissions" value={`${summary.totalCo2e.toLocaleString()} kg CO₂e`} />
        <KpiCard title="Units Over Threshold" value={`${summary.unitsOverThreshold}`} />
        <KpiCard title="Energy Savings vs Baseline" value={`${summary.savingsPercent}%`} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <SbtiIndicator progress={summary.sbtiProgress} savingsPercent={summary.savingsPercent} />
        <SptProgressBar progress={summary.sptProgress} savingsPercent={summary.savingsPercent} />
      </div>
    </div>
  );
}
```

### Pattern 2: Tremor KPI Card with ProgressBar (Tremor path)

**What:** `@tremor/react` Card + Metric + ProgressBar combination. Standard Tremor dashboard card pattern.

**When to use:** When Next.js app was initialized with Tailwind v3.

```typescript
// web/src/components/kpi/KpiCard.tsx (Tremor version)
import { Card, Text, Metric } from "@tremor/react";

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
}

export function KpiCard({ title, value, subtitle }: KpiCardProps) {
  return (
    <Card>
      <Text>{title}</Text>
      <Metric>{value}</Metric>
      {subtitle && <Text className="mt-2 text-xs text-gray-500">{subtitle}</Text>}
    </Card>
  );
}
```

```typescript
// web/src/components/kpi/SptProgressBar.tsx (Tremor version)
// Source: https://npm.tremor.so/ — @tremor/react ProgressBar docs
import { Card, Text, ProgressBar } from "@tremor/react";

interface SptProgressBarProps {
  progress: number;      // sptProgress — % of 40% target achieved (e.g., 95.3)
  savingsPercent: number; // raw savings % (e.g., 38.1)
}

export function SptProgressBar({ progress, savingsPercent }: SptProgressBarProps) {
  const isAtRisk = savingsPercent < 40;
  const barValue = Math.min(progress, 100); // cap at 100 for display

  return (
    <Card>
      <Text className="font-semibold">Green Loan SPT Covenant</Text>
      <Text className="text-xs text-gray-500 mt-1">
        Target: 40% energy savings vs 2019 baseline
      </Text>
      <div className="mt-4 flex justify-between text-sm">
        <Text>{savingsPercent.toFixed(1)}% current savings</Text>
        <Text className={isAtRisk ? "text-red-600 font-bold" : "text-green-600 font-bold"}>
          {isAtRisk ? "AT RISK" : "ON TRACK"}
        </Text>
      </div>
      <ProgressBar
        percentageValue={barValue}
        color={isAtRisk ? "red" : "emerald"}
        className="mt-2"
      />
      <Text className="text-xs text-gray-400 mt-1">
        40% SPT threshold — {(40 - savingsPercent).toFixed(1)}% gap to covenant
      </Text>
    </Card>
  );
}
```

```typescript
// web/src/components/kpi/SbtiIndicator.tsx (Tremor version)
import { Card, Text, ProgressBar } from "@tremor/react";

interface SbtiIndicatorProps {
  progress: number;      // sbtiProgress — % of 42% SBTi target achieved (e.g., 90.7)
  savingsPercent: number; // raw savings % (e.g., 38.1)
}

export function SbtiIndicator({ progress, savingsPercent }: SbtiIndicatorProps) {
  const isOnTrack = progress >= 80; // within 80% of target = on track for demo
  const barValue = Math.min(progress, 100);

  return (
    <Card>
      <Text className="font-semibold">SBTi Carbon Budget (Ayala 42% Target)</Text>
      <Text className="text-xs text-gray-500 mt-1">
        Scope 3 Tenant Emissions — annual carbon budget consumed
      </Text>
      <div className="mt-4 flex justify-between text-sm">
        <Text>{savingsPercent.toFixed(1)}% CO₂ reduction achieved</Text>
        <Text className={isOnTrack ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
          {isOnTrack ? "ON TRACK" : "AT RISK"}
        </Text>
      </div>
      <ProgressBar
        percentageValue={barValue}
        color={isOnTrack ? "emerald" : "red"}
        className="mt-2"
      />
      <Text className="text-xs text-gray-400 mt-1">
        Ayala verified SBTi: 42% CO₂ reduction by 2030
      </Text>
    </Card>
  );
}
```

### Pattern 3: Plain Tailwind Progress Bar (Tailwind v4 fallback — no Tremor)

**What:** If Tremor is incompatible with the frontend's Tailwind version, use a native HTML div progress bar styled with Tailwind utilities. No library dependency. Identical visual outcome.

**When to use:** If Phase 2 initializes the Next.js app with Tailwind v4. In this case, drop `@tremor/react` entirely.

```typescript
// web/src/components/kpi/SptProgressBar.tsx (plain Tailwind version)
interface SptProgressBarProps {
  progress: number;
  savingsPercent: number;
}

export function SptProgressBar({ progress, savingsPercent }: SptProgressBarProps) {
  const isAtRisk = savingsPercent < 40;
  const barPct = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
      <p className="text-sm font-semibold text-white">Green Loan SPT Covenant</p>
      <p className="text-xs text-slate-400 mt-1">Target: 40% energy savings vs 2019 baseline</p>
      <div className="mt-4 flex justify-between text-sm">
        <span className="text-slate-300">{savingsPercent.toFixed(1)}% current savings</span>
        <span className={isAtRisk ? "text-red-400 font-bold" : "text-green-400 font-bold"}>
          {isAtRisk ? "AT RISK" : "ON TRACK"}
        </span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-slate-700">
        <div
          className={`h-2 rounded-full transition-all ${isAtRisk ? "bg-red-500" : "bg-emerald-500"}`}
          style={{ width: `${barPct}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 mt-1">
        {(40 - savingsPercent).toFixed(1)}% gap to 40% SPT covenant
      </p>
    </div>
  );
}
```

### Pattern 4: Typed API Client

**What:** Centralize all API fetches in `lib/api.ts` with proper TypeScript return types matching server-side `Summary` and `Unit` interfaces. Copy server types to `web/src/types/api.ts` to share the contract without creating a shared package.

**When to use:** Always. Prevents scattered `fetch()` calls and type mismatches.

```typescript
// web/src/lib/api.ts
import type { Summary, Unit } from "@/types/api";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function fetchSummary(): Promise<Summary> {
  const res = await fetch(`${API_BASE}/api/summary`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export async function fetchUnits(): Promise<Unit[]> {
  const res = await fetch(`${API_BASE}/api/units`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
```

### Anti-Patterns to Avoid

- **Recomputing ESG math on the client:** Never recompute `totalCo2e` or `savingsPercent` from raw units on the frontend. The server pre-computes everything coherently. Client-side math risks floating point drift producing numbers that contradict the server.
- **Mixing Tailwind v4 with @tremor/react v3:** `@tremor/react` declares Tailwind v3.4+ as a peer dependency. Tailwind v4 changed the configuration model (CSS-first, no `tailwind.config.js`). Tremor v3 expects the old config format. Using both together without a compatibility shim will produce unstyled components or build errors.
- **Four separate fetches for four cards:** Do one fetch to `/api/summary` and distribute fields. Multiple fetches waste requests and can produce momentarily inconsistent values if the server were to change data between requests.
- **Hardcoding numbers (38.1%, 95.3%):** All values must come from the live API fetch. Do not hardcode any of the seeded values into JSX — the demo requires the live API to prove the data is real.
- **Using `progress` (0–100) as the raw value for display text:** `sptProgress = 95.3` means 95.3% of the 40% target achieved. The display text should say "38.1% savings" (the actual `savingsPercent`), not "95.3%" — that would confuse judges. Show `savingsPercent` as text; show `sptProgress` as the bar fill.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Progress bar with threshold coloring | Custom `<progress>` element or SVG arc | Tremor `ProgressBar` (Tailwind v3) OR plain Tailwind div (v4) | Tremor handles border-radius, color transitions, and accessibility; plain Tailwind version is 5 lines and bulletproof |
| KPI card layout | Custom CSS card with shadow, padding | Tremor `Card` (v3) OR `rounded-lg border bg-slate-800 p-4` (v4) | Identical outcome; do not build a card component system from scratch |
| API type sharing | Monorepo package or REST codegen | Copy `server/src/types.ts` to `web/src/types/api.ts` | Hackathon context — shared npm package is over-engineering; copy is explicit and fast |
| Loading skeleton | Custom animated skeleton | Single `if (loading) return <div>Loading...</div>` | Demo starts from a loaded state; judges don't care about the 200ms loading flash |

**Key insight:** Every value needed by Phase 3 already exists in the `/api/summary` JSON response. The entire phase is a rendering problem, not a data problem.

---

## Common Pitfalls

### Pitfall 1: Tremor + Tailwind v4 Incompatibility

**What goes wrong:** Tremor components render without styling — plain unstyled HTML elements — or Tailwind build fails with configuration errors.

**Why it happens:** `@tremor/react` v3.18.7 was built against Tailwind v3's `tailwind.config.ts` plugin and content array model. Tailwind v4 is CSS-first with no `tailwind.config.js`. Tremor's styles never get purged/included correctly.

**How to avoid:** Determine the Tailwind version before choosing Tremor. If the frontend was initialized with Tailwind v4 (the default in Next.js 15 + `create-next-app` as of late 2024), use plain Tailwind card components. If starting fresh and Tremor is required, pin to `tailwindcss@^3.4`.

**Warning signs:** Card components render with no background, borders, or padding. `ProgressBar` shows as a plain horizontal line.

### Pitfall 2: sptProgress vs savingsPercent Confusion in Display

**What goes wrong:** The SPT bar label shows "95.3%" next to a bar that's also 95.3% full — confusing because the target is 40%, not 100%.

**Why it happens:** `sptProgress` is a percentage-of-target value (95.3% of the 40% goal). Displaying this number as the primary metric misleads viewers into thinking the building is at 95.3% savings.

**How to avoid:** Display `savingsPercent` (38.1%) as the primary human-readable value. Use `sptProgress` (95.3) only as the `percentageValue` prop on the progress bar to control fill width. Label the bar as "40% covenant target" so context is clear.

**Warning signs:** The bar is nearly full but the label says AT RISK — judges will ask why the bar is 95% full but at risk. Fix by explaining the bar = progress toward 40% target, not 40% savings achieved.

### Pitfall 3: CO₂e Card Not Labeled as Scope 3

**What goes wrong:** ESG-01 requirement explicitly says "labeled as Scope 3 Tenant Emissions." If the card is labeled "Total CO₂e" or "Carbon Emissions," it fails the requirement check even if the value is correct.

**Why it happens:** Scope 3 labeling is a regulatory/ESG reporting convention, not obvious to a developer who sees `totalCo2e` in the JSON.

**How to avoid:** The card title string must be exactly "Scope 3 Tenant Emissions" or equivalent explicit Scope 3 reference. This is the card label, not a tooltip.

**Warning signs:** The success criteria for ESG-01 reads "labeled explicitly as Scope 3 Tenant Emissions" — missing this label causes Phase 3 verification to fail.

### Pitfall 4: Internal Incoherence Between Cards

**What goes wrong:** The CO₂e card shows a value that, when divided by 0.672 (the emission factor), does not match the total kWh card. Judges can spot this.

**Why it happens:** If any card independently recomputes a value rather than using the server's pre-computed fields, floating point rounding differences appear.

**How to avoid:** All four KPI cards and both compliance indicators must pull from the same single `summary` object fetched once. Never re-derive any value in the frontend. The server's `aggregator.ts` already guarantees `totalCo2e = round(totalKwh * 0.672, 2)` — trust that.

**Warning signs:** `totalCo2e / totalKwh` does not equal approximately 0.672.

### Pitfall 5: Missing NEXT_PUBLIC_ Prefix on API URL

**What goes wrong:** `process.env.API_URL` returns `undefined` in the browser bundle.

**Why it happens:** Next.js only exposes env variables to the client bundle when prefixed with `NEXT_PUBLIC_`. Server-only env vars are stripped from client bundles at build time.

**How to avoid:** Use `NEXT_PUBLIC_API_URL=http://localhost:3001` in `.env.local`. In code: `const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001"`.

**Warning signs:** Browser console shows `fetch("undefined/api/summary")` — fetch URL is literally "undefined/api/summary".

---

## Code Examples

Verified patterns from official sources:

### Tremor ProgressBar Usage

```typescript
// Source: https://npm.tremor.so — @tremor/react docs
// Source: https://blog.logrocket.com/build-react-dashboard-tremor/
import { Card, Text, Metric, ProgressBar } from "@tremor/react";

// percentageValue: number 0-100 — controls bar fill width
// color: Tremor color name — controls bar color
<ProgressBar percentageValue={95.3} color="emerald" className="mt-2" />
<ProgressBar percentageValue={95.3} color="red" className="mt-2" />
```

### Tremor Card + Metric

```typescript
// Source: https://npm.tremor.so — @tremor/react docs
import { Card, Text, Metric } from "@tremor/react";

<Card>
  <Text>Scope 3 Tenant Emissions</Text>
  <Metric>41,234 kg CO₂e</Metric>
</Card>
```

### Next.js "use client" data fetch pattern

```typescript
// Source: https://nextjs.org/docs/app/getting-started/fetching-data
// Client component fetches from external API (localhost:3001)
"use client";

import { useEffect, useState } from "react";

export function KpiSection() {
  const [data, setData] = useState<Summary | null>(null);

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_API_URL + "/api/summary")
      .then(r => r.json())
      .then(setData);
  }, []);

  if (!data) return null;
  // render with data
}
```

### Tailwind v4 (no Tremor) card primitive

```typescript
// Source: Tailwind CSS v4 utility patterns
// Dark-bg card matching heatmap aesthetic from Phase 2 CONTEXT.md
<div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
  <p className="text-xs text-slate-400 uppercase tracking-wider">Scope 3 Tenant Emissions</p>
  <p className="mt-1 text-2xl font-bold text-white">41,234 kg CO₂e</p>
</div>
```

### On-track / At-risk label logic

```typescript
// Based on known seeded values: savingsPercent=38.1, SPT_TARGET=40, SBTI_TARGET=42
// SPT: at risk when below 40% savings
const sptAtRisk = summary.savingsPercent < 40;  // true at 38.1%

// SBTi: on-track when >= 80% of 42% target achieved (design decision)
const sbtiOnTrack = summary.sbtiProgress >= 80;  // true at 90.7%
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| @tremor/react with Tailwind v3 | @tremor/react v3.18.7 still uses Tailwind v3.4+ as peer dep | Jan 2025 (v3.18.7 release) | Tailwind v4 projects cannot use @tremor/react without compatibility work |
| Tailwind v3 `tailwind.config.js` | Tailwind v4 CSS-first config (`@import "tailwindcss"`) | Jan 2025 (Tailwind v4.0) | Tremor and other v3-era libraries may not work without the old config file |
| Create Next App defaults Tailwind v3 | Create Next App 15+ defaults Tailwind v4 | Late 2024 / 2025 | New Next.js projects are Tailwind v4 by default — Tremor v3 incompatibility is the default state |
| CSS `@tremor/react/dist/esm/tremor.css` import | No separate CSS import needed in v3.18+ | v3.x | Modern Tremor relies solely on Tailwind classes; no separate CSS file import needed |

**Deprecated/outdated:**
- `Flex` component from older Tremor examples: Some older blog posts use `<Flex>` — verify current Tremor v3 API before using
- `percentageValue` prop naming: Older Tremor versions (pre-v2) used `value`. Current v3.18.x uses `percentageValue`. Confirm from current docs.
- `marginTop="mt-4"` prop strings: Older Tremor used string-based spacing props. Tremor v3 uses standard className/Tailwind class approach. Verify before using string spacing props.

---

## Open Questions

1. **Which Tailwind version does Phase 2 use?**
   - What we know: Phase 2 will initialize the Next.js frontend (no frontend exists yet). Phase 2 CONTEXT.md does not specify Tailwind version explicitly, only that CSS Grid + Tailwind is the approach.
   - What's unclear: Whether Phase 2 uses Tailwind v3 or v4. The ROADMAP says "03-01: KPI summary cards using Tremor" — but this requires Tailwind v3. If Phase 2 uses v4, Tremor cannot be used.
   - Recommendation: Phase 3 planner must check what Tailwind version Phase 2 installed. If v4: use plain Tailwind card pattern. If v3: use Tremor as planned. Create a `03-01` task that begins with a Tailwind version check and branches accordingly.

2. **What is the on-track threshold for SBTi?**
   - What we know: `sbtiProgress = savingsPercent / 42 * 100`. At 38.1% savings, `sbtiProgress = 90.7%`. The success criteria says "clear on-track / at-risk label" but does not define the threshold.
   - What's unclear: Is 90.7% "on track"? What's the cutoff for "at risk"?
   - Recommendation: Use 80% as the on-track threshold (80% of SBTi 42% target = 33.6% actual savings). This matches a defensible interpretation: if you're 80% to your decarbonization target, you're on track. At 90.7%, the building shows ON TRACK, which is the right demo message.

3. **Does Phase 2 create the Next.js app directory, or does Phase 3?**
   - What we know: Only `server/` exists. No `web/` or Next.js frontend directory exists. Phase 2 CONTEXT.md describes building the heatmap, which requires a Next.js app.
   - What's unclear: Whether Phase 2 creates the Next.js app (likely) or whether each phase creates it independently.
   - Recommendation: Assume Phase 2 creates the Next.js `web/` app. Phase 3 plan should add components into the existing `web/src/components/` structure. If Phase 2 does not create the app, Phase 3 plan's first task is `npx create-next-app`.

---

## Sources

### Primary (HIGH confidence)

- `https://npm.tremor.so/docs/getting-started/installation` — @tremor/react v3.18.0+ requirements: Tailwind v3.4+, React v18.2+, Headless UI v2.2.0
- `npm info @tremor/react` — confirmed latest version 3.18.7, peer deps: react ^18.0.0
- `server/src/types.ts` (project file) — definitive `Summary` interface: `totalKwh`, `totalCo2e`, `savingsPercent`, `sptProgress`, `sbtiProgress`, `unitsOverThreshold`
- `server/src/aggregator.ts` (project file) — confirms `sptProgress = savingsPercent / SPT_TARGET * 100`, `sbtiProgress = savingsPercent / SBTI_REDUCTION_TARGET * 100`
- `server/src/constants.ts` (project file) — `SPT_TARGET = 40`, `SBTI_REDUCTION_TARGET = 42`, `GRID_EMISSION_FACTOR = 0.672`
- `.planning/phases/01-foundation/01-02-SUMMARY.md` — confirms live seeded values: `savingsPercent=38.1%`, `sptProgress=95.3%`, `anomalies=32`, `units=500`
- `https://nextjs.org/docs/app/getting-started/fetching-data` — Next.js client-side data fetching patterns with `"use client"`, `useEffect`, `fetch`

### Secondary (MEDIUM confidence)

- `https://blog.logrocket.com/build-react-dashboard-tremor/` — Tremor KPI card pattern with `Card`, `Text`, `Metric`, `ProgressBar`, `percentageValue` prop confirmed from article code
- `https://github.com/tremorlabs/tremor-npm/discussions/1010` — Tremor + Tailwind v4 compatibility: open question with no official resolution from Tremor team (April 2024 discussion, unanswered)
- `https://npm.tremor.so/docs/getting-started/installation` — Tremor peer dep: Tailwind v3.4+ explicitly stated

### Tertiary (LOW confidence)

- `sptProgress >= 80` as "on track" threshold for SBTi — derived from project design intent; no official source; needs team alignment
- Tremor `ProgressBar` current `percentageValue` prop name — confirmed in multiple blog posts but should be verified against Tremor v3.18.x changelog before coding

---

## Metadata

**Confidence breakdown:**
- Standard stack: MEDIUM — @tremor/react v3.18.7 confirmed; Tailwind v3/v4 compatibility risk is real and documented; plain Tailwind fallback is HIGH confidence
- Architecture: HIGH — pattern is standard React/Next.js client component with single fetch; no novel patterns
- API contract: HIGH — `Summary` interface and all field values verified from actual server source code
- Tremor-specific component API: MEDIUM — `percentageValue` prop confirmed in multiple sources but Tremor docs are partially behind paywalled/fetching-blocked pages; verify before coding
- Pitfalls: HIGH — Tremor/Tailwind v4 incompatibility is documented in official GitHub; others are standard React/Next.js patterns

**Research date:** 2026-02-20
**Valid until:** 2026-03-06 (14 days — fast-moving library ecosystem, Tremor v4 may release)

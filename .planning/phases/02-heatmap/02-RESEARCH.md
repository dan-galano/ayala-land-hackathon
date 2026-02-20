# Phase 2: Heatmap - Research

**Researched:** 2026-02-20
**Domain:** Next.js 16 App Router + Tailwind CSS v4 + CSS Grid + React Client Components
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Grid Layout**
- Floor-based rows: 25 rows (Floor 2 at bottom to Floor 26 at top) × 20 columns (unit positions)
- Floor labels on the left axis ("F2", "F3", ... "F26") — bottom-to-top like a real building
- Cell size: small enough that all 500 cells fit on screen without scrolling (approx 24-32px per cell)
- Row/column gap: 2px — tight grid, building feel
- Building name "Avida Towers Vita" as header above the grid

**Color Scheme**
- Dark background (slate-900 or similar) — makes colored cells pop for demo impact
- Status colors (Tailwind classes):
  - Normal: green-500
  - Elevated: yellow-400
  - Warning: orange-500
  - Critical: red-600
  - Vampire: orange-400 with dashed border
  - Vacant/near-zero: gray-600
- High contrast between adjacent status levels for instant visual scanning

**Click-to-Detail**
- Click a cell → side panel slides in from the right (not a modal — keeps grid visible for context)
- Panel shows: Unit number (e.g., "Unit 1203"), Floor, Unit type (Studio/1BR/2BR), Current kWh, Baseline kWh, CO₂e, Savings %, Status badge, Anomaly type if flagged
- Clicking another cell updates the panel without closing/reopening
- Clicking outside or an "×" button closes the panel
- Selected cell gets a white/bright border ring to show which unit is active

**Anomaly Visual Treatment**
- Vampire loads: orange cell + dashed border (2px) — visually distinct "leaking energy" feel
- Dangerous spikes: red cell + pulsing glow effect (CSS animation, subtle) — draws attention to hazards
- Both types: small icon overlay in corner of cell (⚡ for spike, 🔌 for vampire — or simple SVG icons)
- Hero units (1203, 0815) should be visually findable in the grid without clicking

### Claude's Discretion
- Exact Tailwind color shades and CSS animation keyframes
- Panel slide animation timing and easing
- Whether to use Framer Motion or pure CSS transitions
- Cell hover state design
- Responsive behavior (desktop-first, but basic tablet support acceptable)
- Grid container max-width and centering

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| VIZ-02 | Property manager can view a grid heatmap of 500+ units color-coded green/yellow/orange/red by energy status | CSS Grid with Tailwind v4 `grid-cols-20` (no config needed), `grid-rows-25` (no config needed), React.memo per cell |
| VIZ-03 | Property manager can click a heatmap cell to see unit-level detail (unit ID, floor, kWh consumed, CO₂e, anomaly type if any) | Client component with useState for selected unit, fixed right panel with CSS translate transition |
| ANOM-01 | System flags units exceeding energy thresholds with visual indicators on the heatmap grid | Tailwind conditional class mapping from unit.status field, dashed border for vampire, pulsing glow for spike |
| ANOM-02 | System classifies anomalies into two types: vampire loads (orange) and dangerous spikes (red) | Custom @keyframes glow animation in globals.css @theme, distinct border/animation per anomalyType |
</phase_requirements>

---

## Summary

This is the first frontend phase. The Express API is already running at `http://localhost:3001`. A Next.js 16 app needs to be scaffolded in a `client/` directory alongside the existing `server/`. The current stable Next.js version is 16.1.6 (Turbopack default bundler, React 19.2, React Compiler stable). Tailwind CSS v4 is the standard pairing and `create-next-app` configures it automatically.

The heatmap itself is a pure CSS Grid implementation — no chart library. Tailwind v4 supports `grid-cols-<any-number>` and `grid-rows-<any-number>` natively with no configuration required (confirmed in official docs). The 25×20 grid renders 500 cells. Each `UnitCell` must be a `memo`-wrapped Client Component to prevent cascade re-renders when the selected cell state changes. React 16 has a stable React Compiler option that can replace manual memoization, but it is off by default — explicit `React.memo` is the safe, zero-config choice for this build.

The side panel uses pure CSS transitions (`translate-x-0` / `translate-x-full` toggled by state) rather than Framer Motion. This avoids the `"use client"` wrapper complexity that Motion requires in Next.js App Router and keeps the bundle minimal. Custom pulsing glow for spike anomalies is defined via `@theme` + `@keyframes` in `globals.css` — no third-party animation library needed.

**Primary recommendation:** Scaffold Next.js 16 in `client/` with `create-next-app --yes`, implement HeatmapGrid as a single "use client" component tree (page fetches data, passes to grid), use `React.memo` on UnitCell, and drive the detail panel with `useState` + CSS translate transition.

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next | 16.1.6 | App framework, file-based routing, Turbopack | Current stable; React Compiler stable; default for new projects |
| react | 19.2 | UI rendering | Shipped with Next.js 16 App Router |
| react-dom | 19.2 | DOM rendering | Required peer of react |
| tailwindcss | ^4.0 | Utility CSS, grid, colors, transitions | Built-in v4 features (arbitrary grid-cols, @theme) eliminate all custom config |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| typescript | ^5.1 | Type safety | Auto-configured by create-next-app |
| @tailwindcss/postcss | ^4.0 | PostCSS integration for Tailwind v4 | Required for Tailwind v4 build |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Pure CSS transitions | motion (v12, was framer-motion) | Motion adds ~50KB, requires "use client" wrappers for every animated element; pure CSS is sufficient for a single slide panel |
| React.memo | React Compiler (reactCompiler: true in next.config) | Compiler is stable but off by default, adds Babel compilation cost; React.memo is explicit, zero config, and zero risk |
| Inline className mapping | clsx or classnames | For this scale clsx is a tiny improvement; include only if conditional class logic gets noisy |

**Installation:**
```bash
npx create-next-app@latest client --yes
# creates: TypeScript, Tailwind v4, ESLint, App Router, Turbopack, @/* alias
cd client
npm install
```

No additional packages required for the heatmap or detail panel.

---

## Architecture Patterns

### Recommended Project Structure
```
client/
├── app/
│   ├── layout.tsx           # Root layout, dark bg (bg-slate-900), html/body
│   ├── page.tsx             # Server Component — fetches /api/units, passes to HeatmapPage
│   └── globals.css          # @import "tailwindcss"; custom @theme (glow animation)
├── components/
│   ├── HeatmapGrid.tsx      # "use client" — receives Unit[], owns selectedUnit state
│   ├── UnitCell.tsx         # "use client" — React.memo, single cell render
│   └── UnitDetailPanel.tsx  # "use client" — receives selectedUnit, CSS slide-in
├── lib/
│   └── types.ts             # Copy/re-export Unit, UnitStatus, AnomalyType from server
└── next.config.ts           # Minimal config
```

### Pattern 1: Server Component Data Fetch → Client Component Interaction

**What:** The page (`app/page.tsx`) is a Server Component (async function) that fetches unit data from the Express API at render time. It passes the array to a Client Component (`HeatmapGrid`) via props. This minimizes client-side JS — data fetching stays on the server.

**When to use:** Any time you need to fetch data once on load with no real-time updates. Seeded data never changes, so no polling or SWR needed.

**Example:**
```typescript
// Source: https://nextjs.org/docs/app/getting-started/server-and-client-components
// app/page.tsx — Server Component
import { HeatmapGrid } from '@/components/HeatmapGrid'
import { Unit } from '@/lib/types'

export default async function Page() {
  const res = await fetch('http://localhost:3001/api/units', {
    // Static data — cache forever in dev
    cache: 'force-cache',
  })
  const units: Unit[] = await res.json()
  return (
    <main className="min-h-screen bg-slate-900 p-6">
      <h1 className="text-white text-2xl font-bold mb-4">Avida Towers Vita</h1>
      <HeatmapGrid units={units} />
    </main>
  )
}
```

### Pattern 2: HeatmapGrid as Single Client Boundary

**What:** `HeatmapGrid` is the single "use client" entry point. It owns `useState` for `selectedUnit`. All child components (UnitCell, UnitDetailPanel) inherit the client context and do NOT need their own "use client" directive — but they DO need to be in separate files to enable React.memo effectively.

**When to use:** When you need interactivity (click handlers, state) but want to keep the server component tree as large as possible.

**Example:**
```typescript
// components/HeatmapGrid.tsx
'use client'

import { useState, useMemo } from 'react'
import { UnitCell } from './UnitCell'
import { UnitDetailPanel } from './UnitDetailPanel'
import { Unit } from '@/lib/types'

interface Props {
  units: Unit[]
}

export function HeatmapGrid({ units }: Props) {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)

  // Sort units into grid order: floor asc (bottom-to-top via CSS), position asc
  const grid = useMemo(() => {
    // Group by floor, sorted floor 2..26, position 1..20
    const byFloor = new Map<number, Unit[]>()
    for (const unit of units) {
      if (!byFloor.has(unit.floor)) byFloor.set(unit.floor, [])
      byFloor.get(unit.floor)!.push(unit)
    }
    // Rows ordered floor 26..2 for visual bottom-to-top layout
    return Array.from({ length: 25 }, (_, i) => {
      const floor = 26 - i  // Row 0 = floor 26 (top), row 24 = floor 2 (bottom)
      const floorUnits = byFloor.get(floor) ?? []
      return { floor, units: floorUnits.sort((a, b) => a.position - b.position) }
    })
  }, [units])

  return (
    <div className="flex gap-4">
      <div className="flex gap-1">
        {/* Floor labels */}
        <div className="flex flex-col gap-[2px]">
          {grid.map(row => (
            <div
              key={row.floor}
              className="h-7 w-8 flex items-center justify-end pr-1 text-slate-400 text-xs"
            >
              F{row.floor}
            </div>
          ))}
        </div>
        {/* Grid */}
        <div
          className="grid grid-cols-20 gap-[2px]"
          style={{ gridTemplateRows: 'repeat(25, 28px)' }}
        >
          {grid.flatMap(row =>
            row.units.map(unit => (
              <UnitCell
                key={unit.id}
                unit={unit}
                isSelected={selectedUnit?.id === unit.id}
                onClick={() => setSelectedUnit(unit)}
              />
            ))
          )}
        </div>
      </div>
      <UnitDetailPanel unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
    </div>
  )
}
```

### Pattern 3: React.memo on UnitCell

**What:** Wrap UnitCell with `React.memo` so cells only re-render when their own `unit` prop or `isSelected` changes. Without this, clicking one cell triggers a re-render of all 500 cells on every state update.

**When to use:** Any list/grid with many items where parent state changes frequently.

**Example:**
```typescript
// components/UnitCell.tsx
'use client'
import { memo } from 'react'
import { Unit } from '@/lib/types'

// STATUS_CLASSES maps unit.status → Tailwind color class
const STATUS_CLASSES: Record<string, string> = {
  normal:   'bg-green-500',
  elevated: 'bg-yellow-400',
  warning:  'bg-orange-500',
  critical: 'bg-red-600',
  vampire:  'bg-orange-400 border-2 border-dashed border-orange-200',
  gray:     'bg-gray-600',  // vacant/near-zero
}

interface Props {
  unit: Unit
  isSelected: boolean
  onClick: () => void
}

export const UnitCell = memo(function UnitCell({ unit, isSelected, onClick }: Props) {
  const baseClass = STATUS_CLASSES[unit.status] ?? 'bg-gray-600'
  const selectedRing = isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900' : ''
  const isSpike = unit.anomalyType === 'spike'

  return (
    <div
      onClick={onClick}
      title={`${unit.unitNumber} — ${unit.status}`}
      className={`
        relative w-full h-full rounded-sm cursor-pointer
        hover:brightness-125 transition-[filter] duration-100
        ${baseClass}
        ${selectedRing}
        ${isSpike ? 'animate-spike-glow' : ''}
      `}
    >
      {unit.anomalyType === 'spike' && (
        <span className="absolute top-0 right-0 text-[8px] leading-none">⚡</span>
      )}
      {unit.anomalyType === 'vampire' && (
        <span className="absolute top-0 right-0 text-[8px] leading-none">🔌</span>
      )}
    </div>
  )
})
```

### Pattern 4: CSS Slide Panel (no Framer Motion)

**What:** Use `translate-x-0` / `translate-x-full` with `transition-transform` to slide the panel. Conditionally apply the translate class based on whether a unit is selected. The panel is always in the DOM (`fixed`, `right-0`) — CSS handles show/hide via transform.

**When to use:** Single slide direction, no complex orchestration. Pure CSS is more performant and avoids the "use client" wrapper complexity of Framer Motion.

**Example:**
```typescript
// components/UnitDetailPanel.tsx
import { Unit } from '@/lib/types'

interface Props {
  unit: Unit | null
  onClose: () => void
}

export function UnitDetailPanel({ unit, onClose }: Props) {
  const open = unit !== null

  return (
    <div
      className={`
        fixed top-0 right-0 h-full w-72 bg-slate-800 text-white shadow-2xl z-50
        transform transition-transform duration-300 ease-in-out
        ${open ? 'translate-x-0' : 'translate-x-full'}
      `}
    >
      <div className="p-4 flex justify-between items-center border-b border-slate-700">
        <h2 className="font-bold text-lg">{unit?.unitNumber ?? ''}</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">×</button>
      </div>
      {unit && (
        <div className="p-4 space-y-3 text-sm">
          <Row label="Floor" value={`Floor ${unit.floor}`} />
          <Row label="Type" value={unit.type} />
          <Row label="Current kWh" value={`${unit.currentKwh.toFixed(1)} kWh`} />
          <Row label="Baseline kWh" value={`${unit.baselineKwh} kWh`} />
          <Row label="CO₂e" value={`${unit.co2e.toFixed(2)} kg`} />
          <Row label="Savings" value={`${unit.savingsPercent.toFixed(1)}%`} />
          <Row label="Status" value={unit.status} highlight />
          {unit.anomalyType && (
            <Row label="Anomaly" value={unit.anomalyType} highlight />
          )}
        </div>
      )}
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className={highlight ? 'font-semibold text-orange-400' : ''}>{value}</span>
    </div>
  )
}
```

### Pattern 5: Custom Glow Animation via @theme

**What:** Define a custom `animate-spike-glow` utility in `globals.css` using Tailwind v4's `@theme` + `@keyframes` syntax.

**Example:**
```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  --animate-spike-glow: spike-glow 1.5s ease-in-out infinite;

  @keyframes spike-glow {
    0%, 100% {
      box-shadow: 0 0 4px 1px rgb(239 68 68 / 0.6);
    }
    50% {
      box-shadow: 0 0 10px 3px rgb(239 68 68 / 0.9);
    }
  }
}
```

This makes `animate-spike-glow` available as a Tailwind utility class everywhere.

### Anti-Patterns to Avoid

- **Single large Client Component for everything:** Marking `page.tsx` as "use client" to fetch data means all 500 units fetch on the client, blocking initial paint. Keep page as Server Component.
- **Passing new object/array references on each render:** If the parent renders a new `onClick` function per cell every render, `React.memo` provides no benefit. Use a stable handler identity: the UnitCell receives its unit as a stable prop; the onClick should be a simple inline arrow or stable callback.
- **Using `grid-cols-[20]` arbitrary syntax when `grid-cols-20` works:** Tailwind v4 supports plain numeric `grid-cols-20` without brackets or configuration. Use the clean syntax.
- **Floor label alignment:** The labels (F2 to F26) must be vertically aligned to their grid rows. Use the same `gap-[2px]` and row height as the grid cells to keep them in sync.
- **Rendering all 500 cells as Server Components:** The entire grid requires `onClick` on cells — must be a Client Component. Attempting to make individual cells Server Components will fail.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Slide animation | Custom JS animation loop | CSS `transition-transform` | Browser-native, 60fps guaranteed, zero JS cost |
| Color mapping | Switch/if-else in JSX | `Record<UnitStatus, string>` lookup object | O(1), typed, easy to maintain |
| Grid layout | Custom flexbox "grid" | `grid grid-cols-20` | CSS Grid handles gaps, rows, overflow correctly without math |
| Custom keyframes | Inline `style` animation | `@theme @keyframes` in globals.css | Generates utility class, works with Tailwind's purge/JIT |

**Key insight:** For a fixed 500-cell static grid with no sorting/filtering, CSS Grid + lookup tables + React.memo is all you need. Adding a grid library or virtualization is over-engineering.

---

## Common Pitfalls

### Pitfall 1: grid-cols-20 requires Tailwind v4 (not v3)
**What goes wrong:** In Tailwind v3, `grid-cols-20` does not exist out of the box and silently produces no CSS. The grid renders as a single column.
**Why it happens:** Tailwind v3 had a hard-coded list of supported column counts (1-12 by default).
**How to avoid:** Verify Tailwind version is v4+ before using arbitrary numeric grid-cols. `create-next-app --yes` with Next.js 16 installs Tailwind v4 automatically.
**Warning signs:** Grid renders as a vertical list instead of a 20-column layout.

### Pitfall 2: React.memo with inline onClick breaks memoization
**What goes wrong:** All 500 cells re-render on every click despite `React.memo`.
**Why it happens:** `onClick={() => setSelectedUnit(unit)}` is a new function reference every parent render. React.memo's shallow comparison sees a changed prop.
**How to avoid:** The cells' `unit` prop is the stable identity. The onClick handler passed from `HeatmapGrid` should be a `useCallback` or the cell should receive a generic `onSelect` with the unit object — since the unit object itself is stable (from useMemo), any closure that captures `unit` (a stable object from the memo'd grid array) will be stable across re-renders that don't change that specific unit.
**Warning signs:** React DevTools profiler shows all 500 cells highlighted on each click.

### Pitfall 3: Floor order is visually reversed vs data order
**What goes wrong:** Floor 2 renders at the top of the grid and Floor 26 at the bottom — opposite of a real building.
**Why it happens:** Natural array order (ascending floor) renders top-to-bottom in CSS Grid, but the building should show higher floors at the top.
**How to avoid:** Sort rows as floor 26..2 (descending) when building the grid array. Floor 26 row renders first (visually top), Floor 2 renders last (visually bottom).
**Warning signs:** Floor labels read "F2, F3... F26" top to bottom instead of bottom to top.

### Pitfall 4: CORS error from Next.js dev server calling Express
**What goes wrong:** `fetch('http://localhost:3001/api/units')` fails in the browser with CORS error.
**Why it happens:** The Express CORS config uses `NEXT_ORIGIN` env var defaulting to `http://localhost:3000`. If the Next.js app runs on a different port, the browser request is blocked.
**How to avoid:** Server-side fetch from `page.tsx` (Server Component) bypasses CORS entirely — the request originates from the Node.js server process, not the browser. This is the correct pattern regardless.
**Warning signs:** Network tab shows a preflight OPTIONS request being blocked.

### Pitfall 5: Tailwind v4 globals.css syntax change
**What goes wrong:** `@tailwind base; @tailwind components; @tailwind utilities;` directives produce no output or errors.
**Why it happens:** Tailwind v4 uses `@import "tailwindcss";` — the old v3 directive syntax is removed.
**How to avoid:** `create-next-app` generates the correct `globals.css` for v4. Do not copy v3 templates.
**Warning signs:** No Tailwind styles applied anywhere; all classes produce no output.

### Pitfall 6: Cell height/width not explicitly set
**What goes wrong:** Grid cells collapse to zero height even with `grid-cols-20`.
**Why it happens:** CSS Grid distributes columns but doesn't auto-set row heights unless content or explicit `grid-template-rows` is provided.
**How to avoid:** Set explicit row heights via `style={{ gridTemplateRows: 'repeat(25, 28px)' }}` on the grid container, or set `h-7` (28px) on each cell. Both approaches work; inline style on the container is cleaner.
**Warning signs:** Grid renders as a single horizontal strip of zero-height rows.

---

## Code Examples

### Next.js 16 Async params pattern (breaking change)
```typescript
// Source: https://nextjs.org/blog/next-16 (Breaking Changes)
// In Next.js 16, params are now async
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params  // Must await
  // ...
}
```

### Tailwind v4 globals.css
```css
/* Source: https://nextjs.org/docs/app/getting-started/css */
@import "tailwindcss";

@theme {
  --animate-spike-glow: spike-glow 1.5s ease-in-out infinite;

  @keyframes spike-glow {
    0%, 100% {
      box-shadow: 0 0 4px 1px rgb(239 68 68 / 0.6);
    }
    50% {
      box-shadow: 0 0 10px 3px rgb(239 68 68 / 0.9);
    }
  }
}
```

### CSS Grid 25×20 with explicit row height
```tsx
// Source: tailwindcss.com/docs/grid-template-columns (v4 numeric grid-cols)
<div
  className="grid grid-cols-20 gap-[2px]"
  style={{ gridTemplateRows: 'repeat(25, 28px)' }}
>
  {cells}
</div>
```

### Floor order (building visual: top = highest floor)
```typescript
// Floors 26 down to 2 = 25 floors
const rows = Array.from({ length: 25 }, (_, i) => 26 - i)
// rows[0] = 26 (top of DOM = top of screen = top of building)
// rows[24] = 2  (bottom of DOM = bottom of screen = ground floor)
```

### Type-safe status color map
```typescript
import type { UnitStatus } from '@/lib/types'

const STATUS_BG: Record<UnitStatus | 'vacant', string> = {
  normal:   'bg-green-500',
  elevated: 'bg-yellow-400',
  warning:  'bg-orange-500',
  critical: 'bg-red-600',
  vampire:  'bg-orange-400',
  vacant:   'bg-gray-600',
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `tailwind.config.js` for custom grid-cols | `@theme` in CSS, no config file | Tailwind v4 (2025) | `grid-cols-20`, `grid-cols-25` just work |
| `@tailwind base/components/utilities` directives | `@import "tailwindcss"` | Tailwind v4 | Old directives removed; must use new import |
| `next.config.js` (CommonJS) | `next.config.ts` (TypeScript-native) | Next.js 16 | Native TS support with `--experimental-next-config-strip-types` flag |
| `middleware.ts` for request interception | `proxy.ts` | Next.js 16 | middleware.ts deprecated (still works, will be removed) |
| `framer-motion` package | `motion` package (v12) | 2024 | Rebranded; `npm install motion`. framer-motion still works as legacy |
| Manual `React.memo`, `useMemo`, `useCallback` | React Compiler 1.0 (opt-in) | React Compiler 1.0 / Next.js 16 | Automatic memoization when `reactCompiler: true` in next.config; off by default |

**Deprecated/outdated:**
- `framer-motion` package name: Rebranded as `motion`. Both currently installable; new projects should use `motion`.
- Tailwind v3 `extend.gridTemplateColumns` config: Replaced by CSS-native `@theme` in v4.

---

## Open Questions

1. **Next.js app runs on port 3000, but server fetch needs CORS bypass**
   - What we know: Server Component fetch from `page.tsx` goes node-to-node (not browser-to-server), bypassing CORS. Express CORS is only needed for browser-initiated requests.
   - What's unclear: In development, does Next.js Server Component fetch to `http://localhost:3001` work reliably without additional config?
   - Recommendation: Use server-side fetch in `page.tsx`. If issues arise, add `NEXT_ORIGIN=http://localhost:3000` to the server `.env`. Do NOT use client-side fetch for the units data.

2. **`grid-cols-20` in Tailwind v4 confirmed by docs but fetch returned ambiguity**
   - What we know: Multiple sources confirm Tailwind v4 supports `grid-cols-<any-number>`. One WebFetch of the docs page returned contradictory info (same doc fetched twice).
   - What's unclear: Whether there is a numeric ceiling (e.g., does it stop at 12 or 20?).
   - Recommendation: Use `grid-cols-20` directly. If it doesn't produce CSS, fallback to `style={{ gridTemplateColumns: 'repeat(20, minmax(0, 1fr))' }}` on the container — inline style is a 100% reliable escape hatch.

3. **Hero unit visibility without clicking**
   - What we know: Units 1203 and 0815 are seeded as critical/vampire. They will appear red/orange. The grid is 25×20, Unit 1203 is floor 12, position 3.
   - What's unclear: Whether the cell is visually distinct enough at 28px without additional treatment.
   - Recommendation: The combination of red color + pulsing glow (spike) makes 1203 findable. No additional treatment needed.

---

## Sources

### Primary (HIGH confidence)
- https://nextjs.org/docs/app/getting-started/installation (v16.1.6, 2026-02-16) — create-next-app command, system requirements
- https://nextjs.org/blog/next-16 (2025-10-21) — breaking changes, React Compiler stable, Turbopack default
- https://nextjs.org/docs/app/getting-started/server-and-client-components (v16.1.6, 2026-02-16) — "use client" rules, server component patterns
- https://tailwindcss.com/docs/animation — @theme + @keyframes custom animation syntax
- https://tailwindcss.com/docs/grid-template-columns — grid-cols-<number> utility behavior in v4

### Secondary (MEDIUM confidence)
- https://tailwindcss.com/blog/tailwindcss-v4 — confirmation that grid utilities support arbitrary numbers in v4
- WebSearch result: multiple sources confirm `grid-cols-<any-number>` in Tailwind v4 (cross-referenced with official docs)
- motion.dev/docs — Motion v12 package name, framer-motion successor

### Tertiary (LOW confidence)
- WebSearch: React.memo + 500 cells performance patterns — general community consensus, not benchmarked for this specific case

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — verified against official Next.js 16 and Tailwind v4 docs published 2026-02-16
- Architecture: HIGH — patterns from official Next.js server/client component docs
- Grid cols: MEDIUM-HIGH — Tailwind v4 numeric grid-cols confirmed by multiple sources; fallback documented
- Pitfalls: HIGH — grid col issue confirmed by official v3/v4 migration notes; React.memo gotcha is well-established

**Research date:** 2026-02-20
**Valid until:** 2026-03-20 (30 days — Next.js and Tailwind are stable; minor updates unlikely to break patterns)

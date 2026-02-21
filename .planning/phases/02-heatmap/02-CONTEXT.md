# Phase 2: Heatmap - Context

**Gathered:** 2026-02-20
**Status:** Ready for planning

<domain>
## Phase Boundary

500-unit color-coded CSS Grid heatmap where property managers visually scan building energy status. Clicking any cell reveals unit-level detail. Anomalous units (vampire loads, dangerous spikes) have distinct visual treatment. No KPI cards or ESG metrics — those are Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Grid Layout
- Floor-based rows: 25 rows (Floor 2 at bottom to Floor 26 at top) × 20 columns (unit positions)
- Floor labels on the left axis ("F2", "F3", ... "F26") — bottom-to-top like a real building
- Cell size: small enough that all 500 cells fit on screen without scrolling (approx 24-32px per cell)
- Row/column gap: 2px — tight grid, building feel
- Building name "Ayala Land" as header above the grid

### Color Scheme
- Dark background (slate-900 or similar) — makes colored cells pop for demo impact
- Status colors (Tailwind classes):
  - Normal: green-500
  - Elevated: yellow-400
  - Warning: orange-500
  - Critical: red-600
  - Vampire: orange-400 with dashed border
  - Vacant/near-zero: gray-600
- High contrast between adjacent status levels for instant visual scanning

### Click-to-Detail
- Click a cell → side panel slides in from the right (not a modal — keeps grid visible for context)
- Panel shows: Unit number (e.g., "Unit 1203"), Floor, Unit type (Studio/1BR/2BR), Current kWh, Baseline kWh, CO₂e, Savings %, Status badge, Anomaly type if flagged
- Clicking another cell updates the panel without closing/reopening
- Clicking outside or an "×" button closes the panel
- Selected cell gets a white/bright border ring to show which unit is active

### Anomaly Visual Treatment
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

</decisions>

<specifics>
## Specific Ideas

- The grid should feel like a building viewed from the front — floors stacked bottom to top, like looking at a building cross-section
- Dark background is important for demo impact — colored cells on dark bg look like a "command center" dashboard
- The detail panel should feel lightweight — not a heavy modal that blocks the view
- Research confirmed: CSS Grid + Tailwind is faster to build and more performant than chart libraries for this use case
- Research confirmed: React.memo on each UnitCell component from day one to prevent 500-cell re-renders

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-heatmap*
*Context gathered: 2026-02-20*

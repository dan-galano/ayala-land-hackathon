# Pitfalls Research

**Domain:** Hackathon energy management / building sustainability dashboard (3-hour sprint, Next.js + Express, 500+ condo units, pre-seeded data)
**Researched:** 2026-02-20
**Confidence:** MEDIUM — hackathon-specific patterns from community post-mortems + energy domain from verified sources; ESG/emissions factors cross-verified against IEA and GHG Protocol official sources

---

## Critical Pitfalls

### Pitfall 1: Unrealistic Energy Data Destroys Judge Credibility

**What goes wrong:**
Data generator produces flat, uniform kWh values across all 500+ units — e.g., every unit consumes 150–200 kWh/month with random +/- 10% noise. Judges with domain knowledge (or common sense) immediately notice: no time-of-day variation, no unit-type variance (studio vs. 3BR), no seasonal patterns, no outliers. The "anomaly detection" feature then flags no real anomalies because the data has no realistic spread. Demo collapses.

**Why it happens:**
Devs prioritize getting data into the system quickly. `Math.random() * 200 + 100` seeds 500 units in 30 seconds. Nobody checks whether the distribution looks real.

**How to avoid:**
Seed with domain-realistic ranges:
- Studio unit: 80–150 kWh/month (Philippine condo baseline per Meralco data)
- 1BR unit: 120–250 kWh/month
- 2BR unit: 200–400 kWh/month
- Include 3–5% "vampire load" outliers (>500 kWh/month) — these are the anomalies your dashboard detects
- Include ~10% of units near-zero (vacant units)
- Apply time-of-day curve: peak 6–9pm, trough 2–4am if showing hourly breakdown

Philippine grid reference: 0.6712 kg CO2e/kWh (IEA/Climatiq 2023 data — use this constant for CO2 calculations, not a generic 0.5 or 0.4).

**Warning signs:**
- All 500 units show similar color intensity on the heatmap (no real variance)
- The anomaly threshold catches 0 or 500 units (threshold calibration failure)
- CO2 savings displayed in round numbers like "exactly 10,000 kg CO2 saved"

**Phase to address:**
Data seeding phase — must be the very first thing built, before any UI, so all features can be validated against realistic data from the start.

---

### Pitfall 2: Heatmap Renders 500 DOM Nodes and Locks the Browser

**What goes wrong:**
Team renders 500+ individual `<div>` cells in a CSS grid, each with a color-coded background based on energy status. On first paint this is 500 DOM nodes. When the page re-renders (filter change, sort, status update), React diffs and patches all 500. On mid-range hardware, this causes 200–600ms render stalls. Live demo on a laptop with Chrome DevTools open = visible janking.

**Why it happens:**
For 500 items, CSS grid feels fine in development on a fast machine. The problem is invisible until demo day under pressure.

**How to avoid:**
- Use `React.memo` on the individual cell component so unchanged cells don't re-render
- Generate all colors at seed time (status: "normal" | "warning" | "critical") — never compute colors during render
- If filtering is needed, filter the array before passing to the grid, not inside each cell
- Keep cell component to pure CSS — no inline style computation, no function calls, just a `data-status` attribute driven by a CSS `[data-status="warning"]` rule
- 500 static cells with memo is fast enough. Do NOT use virtualization libraries (react-window, react-virtual) — they add complexity and you don't have scroll-to-position behavior anyway for a 500-cell heatmap grid

**Warning signs:**
- Chrome Performance tab shows "Long Task" on initial render
- Heatmap flickers when filter controls change
- Cell tooltips trigger visible lag on hover across entire grid

**Phase to address:**
UI/component phase — when heatmap cell component is first built. Establish `React.memo` and static color mapping before adding any interactivity.

---

### Pitfall 3: Demo Flow Has No Story — Judges See Charts But Miss the Stakes

**What goes wrong:**
Dashboard is technically complete: heatmap renders, ESG cards show numbers, green loan progress bar is visible. But when presenting, the dev clicks around explaining features. Judges see a pretty dashboard. They don't feel the urgency. They don't understand what the ₱56B loan risk is. Demo ends and judges say "cool dashboard." No differentiation from 10 other dashboard projects.

**Why it happens:**
Teams build features and then demo features. The narrative ("Unit 1203 is about to blow the loan covenant") is never scripted into the demo flow. The dashboard is shown as a tool, not as a story with a problem, climax, and resolution.

**How to avoid:**
Script the demo as a 90-second story before writing code:
1. Open to summary card: "Building A is at 38% of 40% energy savings target — one bad month away from losing loan terms"
2. Click heatmap: "Unit 1203 and 1507 are in CRITICAL status — 3x above threshold"
3. Click anomaly alert: "Vampire load detected — AC left on while unit is vacant"
4. Point to green loan progress bar: "Fix these two units and we stay on track"

Seed data to support this exact narrative. Unit 1203 and 1507 should always be in your seed data as critical outliers. The building-level progress should always seed at 38% (close enough to fail to be urgent).

**Warning signs:**
- Nobody on the team has rehearsed a demo walkthrough before 2 hours remaining
- The demo click path is not written down anywhere
- Seed data has no "hero units" (named outliers judges will remember)

**Phase to address:**
Data seeding phase (define hero units and narrative targets) + final integration phase (rehearse demo path).

---

### Pitfall 4: ESG Cards Show Mathematically Incoherent Numbers

**What goes wrong:**
Dashboard shows "CO2 Saved: 15,000 kg" but the "Total kWh Consumed" card shows 2,000,000 kWh across 500 units, implying a baseline of 2,030,000 kWh. Using Philippine grid factor (0.6712 kg CO2e/kWh), savings of 15,000 kg = only 22,357 kWh saved — which is 1.1% savings, nowhere near the 40% SBTi target also displayed. Any judge who does quick mental arithmetic sees the contradiction.

**Why it happens:**
Each ESG card is built independently by different devs. The CO2 card uses one formula, the kWh card uses another, the "% toward target" uses a hardcoded baseline. Nobody reconciles them.

**How to avoid:**
Define ONE canonical set of seed constants, computed once server-side:
```
BASELINE_KWH_PER_UNIT_PER_MONTH = 280  // pre-efficiency install benchmark
CURRENT_KWH_PER_UNIT_PER_MONTH = 168   // 40% savings achieved
GRID_EMISSION_FACTOR = 0.6712          // kg CO2e/kWh (IEA Philippines 2023)
UNITS_COUNT = 500
REPORTING_PERIOD_MONTHS = 12
```
All dashboard cards derive from these constants. The Express API computes and returns the aggregate stats — frontend never recalculates independently. One endpoint, one source of truth.

**Warning signs:**
- CO2 card and kWh card owned by different devs with no shared constants file
- "% toward target" is hardcoded as a magic number (e.g., `progress = 0.67`)
- Numbers feel "too round" (exactly 40% savings, exactly 10,000 kg CO2)

**Phase to address:**
API/data modeling phase — define shared constants before building any frontend cards.

---

### Pitfall 5: Scope Creep Eats the Last Hour

**What goes wrong:**
The team adds a "unit detail modal" at hour 2, then someone suggests a "building comparison view," then a time-series trend chart. At hour 2.5 the heatmap tooltips are broken, the modal has missing data, and the demo has three half-built features none of which work end-to-end. Demo day: frantically hiding broken features.

**Why it happens:**
Energy dashboards have infinite natural extensions. Every feature feels small ("just a modal"). The team doesn't enforce a hard cutoff. The last hour should be polish and rehearsal, not new features.

**How to avoid:**
Write the feature list on paper at hour 0 and put it somewhere visible. Any feature not on the original list requires unanimous team agreement AND someone must identify what existing feature gets cut to compensate. Default answer to new feature requests in hour 2+: "parking lot — if we finish early."

Must-have list (build these, nothing else):
1. 500-unit heatmap with status colors
2. Four ESG summary cards
3. Anomaly alert list (top 5 offending units)
4. Green loan progress bar
5. Unit status legend

Everything else: parking lot.

**Warning signs:**
- Anyone says "it would be cool if we also..." after hour 1
- There are more than 5 open browser tabs showing libraries to add
- The git log shows 3+ new component files created after hour 1.5

**Phase to address:**
Pre-build planning phase — lock scope in writing before coding starts.

---

### Pitfall 6: Green Loan Progress Bar Uses Wrong "40% Savings" Baseline

**What goes wrong:**
Progress bar shows "% savings vs. baseline" but team uses current month's average kWh as the baseline instead of a pre-efficiency-program baseline. Result: bar always shows 0% savings (comparing current to current) or 100% savings (if baseline is miscalculated as higher than actual). The financial stake of the loan covenant is invisible.

**Why it happens:**
"40% energy savings" sounds simple but requires two data points: a historical baseline (pre-upgrade) and current consumption. Without a seeded baseline value, the calculation has no reference point.

**How to avoid:**
Seed a `baselineKwh` value per unit representing the pre-upgrade consumption. The green loan progress bar formula is:
```
savingsPercent = (baselineKwh - currentKwh) / baselineKwh * 100
buildingProgress = avg(savingsPercent across all units)
target = 40
```
Seed `baselineKwh` as 1.4x–1.7x the current `currentKwh` per unit so the building naturally sits at 38–42% savings range (generating tension near the SPT threshold).

**Warning signs:**
- Progress bar shows 0% or 100% consistently
- No `baselineKwh` field exists in the seed data schema
- Progress bar value is hardcoded as a prop (e.g., `progress={67}`)

**Phase to address:**
Data seeding phase — baseline kWh is a required seed field, not an optional one.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcode all 500 units in a JSON file instead of DB | No database setup time | Can't filter/query dynamically; file bloats | Acceptable for hackathon if no filtering needed |
| Compute CO2 calculations in the frontend | Faster dev, no API round trip | Numbers diverge between cards when different devs write different formulas | Never — always compute server-side |
| Skip `React.memo` on heatmap cells | Faster to write | 500-cell re-renders on every state change | Never — add memo from day one |
| Use `Math.random()` for energy values without seed | Fast to write | Non-reproducible data; anomalies disappear between reloads | Never — use a seeded PRNG (e.g., `seedrandom`) so data is deterministic |
| Single API endpoint returning all 500 units as JSON | Simple, no pagination | 500-unit JSON payload is ~50–100KB; acceptable for hackathon | Acceptable for hackathon demo only |
| CSS `color` computed in JS per-cell during render | Flexible | Runs 500 times per render cycle | Never — precompute status at seed time |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Next.js + Express API | Using `fetch('/api/...')` in Next.js thinking it hits Express routes, but it hits Next.js API routes instead | Use absolute URL `fetch('http://localhost:3001/api/...')` for Express backend; set `NEXT_PUBLIC_API_URL` env var from the start |
| CORS (Next.js calling Express) | Forgetting to add CORS middleware on Express; blocked in browser | Add `cors()` middleware as the first Express middleware before any routes |
| Seed data determinism | Using `Math.random()` makes every server restart produce different data and different anomaly patterns | Use deterministic seeded PRNG (`seedrandom` library or custom LCG) so same seed = same 500 units every time |
| Philippine CO2 factor | Using generic global factor (0.45 kg CO2/kWh) instead of PH-specific factor | Use IEA Philippines 2023 factor: 0.6712 kg CO2e/kWh; this is 49% higher than generic and significantly changes the ESG narrative |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| 500 un-memoized React cells | Visible lag when hovering or filtering | `React.memo` on cell component, precomputed status prop | Always visible on mid-range laptop with DevTools open |
| Recharts with 500 data points on a single chart | Chart renders slowly, tooltip hover lags | Limit time-series charts to 30–90 data points (e.g., last 30 days for one unit); do not render all 500 units as chart series | 100+ series on one Recharts SVG chart breaks at ~50 series |
| Non-memoized filter/sort in render | Every parent render re-sorts 500 items | `useMemo` for filtered/sorted unit list | Immediate — visible on every state change |
| JSON.stringify 500 units on every API call check | Server-side overhead | Cache the computed stats object in module scope; recompute only if underlying data changes | Not critical at hackathon scale but wastes 10–50ms per request |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Exposing internal building IDs in URL params | Not a risk for demo with no auth; irrelevant for hackathon | N/A — no auth requirement for this build |
| Serving seed data file directly from public directory | Anyone can download the full dataset | Serve via Express API endpoint, not static file |
| Hardcoding financial loan amounts (₱56B) in frontend code | Visible in source; judges may scrutinize | Keep financial context in pitch deck, not in code constants |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Heatmap has no legend | Judges don't know what red/yellow/green means | Always-visible legend: green = normal, yellow = warning, red = critical, gray = vacant |
| ESG cards have no units labels | "15,432" means nothing without "kg CO2e" or "kWh" | Every metric card must show value + unit + time period (e.g., "15,432 kg CO2e / this year") |
| Progress bar shows 67% with no context | Judges don't know if 67% is good or bad | Label the target explicitly: "67% toward 40% savings SPT target — ON TRACK" |
| Clicking a heatmap cell does nothing | Feels unfinished; judges expect interactivity | Either (a) show a tooltip on hover with unit name + status + kWh, or (b) show a side panel — pick one and build it; don't leave cells with zero interaction |
| Dashboard has no "as of" date | Energy data without a timestamp feels fake | Show "Data as of: February 2026" prominently — makes simulated data feel like real reported data |

---

## "Looks Done But Isn't" Checklist

- [ ] **Heatmap:** All 500 cells render AND colors are visually distinguishable (not all one shade) — verify seed data has enough variance across status categories
- [ ] **ESG Cards:** CO2 saved figure reconciles with kWh consumption figure using the Philippine grid factor (0.6712) — do the math manually once
- [ ] **Green Loan Progress:** Bar is not hardcoded — it reads from actual seed data aggregation AND shows correct percentage toward 40% SPT target
- [ ] **Anomaly List:** At least 3 units in CRITICAL status visible in the alert list — verify seed data has ≥15 "vampire load" outlier units
- [ ] **Demo narrative:** The specific "hero units" (e.g., Unit 1203, Unit 1507) exist in seed data as critical outliers with data that tells the story
- [ ] **CORS:** Frontend successfully calls Express API from browser (not just curl) — test in browser before demo
- [ ] **No console errors:** Open DevTools during demo run-through; zero red errors visible

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Data is unrealistic (flat distribution) | MEDIUM — 30–45 min | Rewrite seed generator with status-bucketed approach: pre-assign 70% normal, 20% warning, 10% critical, then assign kWh ranges per bucket. Regenerate and verify heatmap visually. |
| Heatmap is janky | LOW — 15–20 min | Add `React.memo` to cell component, move color logic to a lookup object keyed by status string. Re-test render performance. |
| ESG numbers don't reconcile | MEDIUM — 20–30 min | Create a single `/api/stats` endpoint that returns all derived metrics from one calculation. Have all frontend cards read from this single endpoint response. |
| Demo flow has no story | LOW — 10 min | Write the 90-second demo script. Verify seed data supports it. Assign one person to be "presenter" vs "driver." |
| Feature creep caused broken state | HIGH — 45–90 min | Revert to last working commit. Disable the in-progress feature (comment it out or hide behind a flag). Finish the core features. |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Unrealistic seed data | Phase 1: Data Seeding | Visually inspect heatmap — at least 3 distinct color zones visible; anomaly list has ≥3 critical units |
| Heatmap DOM performance | Phase 2: UI Components (heatmap cell) | Open Chrome Performance tab; initial render Long Task < 100ms |
| Demo has no story | Phase 1 (narrative planning) + Phase 4 (final rehearsal) | Rehearsed demo runs in ≤90 seconds with zero explanation needed |
| ESG numbers incoherent | Phase 1: API/data model (shared constants) | Manually verify: CO2 saved = kWh saved × 0.6712; all cards read from same `/api/stats` |
| Scope creep | Phase 0: Pre-build planning | Feature list is written, visible, and has not grown since build started |
| Green loan baseline missing | Phase 1: Data Seeding | `baselineKwh` field exists in unit schema; progress bar reads live, not hardcoded |
| CORS blocking API | Phase 2: API integration | Browser (not curl) successfully fetches from Express; zero CORS errors in console |

---

## Sources

- IEA Emissions Factors 2025: https://iea.blob.core.windows.net/assets/2b5f6d31-3263-44bf-85bc-b754d1c69cd3/IEA_Methodology_Emission_Factors.pdf
- Climatiq Philippines emission factor: https://www.climatiq.io/data/emission-factor/1cdd4e1d-8511-4022-9b33-0d96fd3c1b46
- GHG Protocol Scope 3 Calculation Guidance: https://ghgprotocol.org/scope-3-calculation-guidance-2
- Recharts performance documentation: https://recharts.github.io/en-US/guide/performance/
- Recharts large dataset GitHub issue: https://github.com/recharts/recharts/issues/1146
- React virtualization patterns: https://medium.com/@ignatovich.dm/virtualization-in-react-improving-performance-for-large-lists-3df0800022ef
- SBTi Buildings Criteria FAQs: https://files.sciencebasedtargets.org/production/files/FAQs-SBTi-Buildings-Criteria.pdf
- MIT Sloan "Avoid These Five Pitfalls at Your Next Hackathon": https://sloanreview.mit.edu/article/avoid-these-five-pitfalls-at-your-next-hackathon/
- Hackathon winning tips (serial winner): https://szeyusim.medium.com/how-i-win-most-hackathons-stories-pro-tips-from-a-serial-hacker-1969c6470f92
- DevRant scope creep post-mortem: https://devrant.com/rants/755008/so-me-and-some-colleagues-joined-a-hackathon-we-already-agreed-on-our-project-ar
- Recharts vs Chart.js for large data: https://www.oreateai.com/blog/recharts-vs-chartjs-navigating-the-performance-maze-for-big-data-visualizations
- React dashboard large datasets optimization: https://www.zigpoll.com/content/how-can-i-optimize-the-responsiveness-and-performance-of-my-react-dashboard-when-rendering-large-datasets-with-dynamic-visualizations
- Philippines kWh per capita 2024: https://data.worldbank.org/indicator/EG.USE.ELEC.KH.PC?locations=PH
- Meralco monthly consumption guidance: https://www.meralco.com.ph/residential/bright-ideas/bright-ideas/manage-your-monthly-consumption

---
*Pitfalls research for: Hackathon energy management / building sustainability dashboard*
*Researched: 2026-02-20*

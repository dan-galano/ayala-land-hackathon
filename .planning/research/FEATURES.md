# Feature Research

**Domain:** Energy monitoring / ESG compliance dashboard for property managers
**Researched:** 2026-02-20
**Confidence:** MEDIUM — Industry patterns confirmed by multiple sources; specific Ayala Land / Philippine market adaptations inferred from global best practices

---

## Context: Hackathon Constraints Shape Everything

This is a 3-hour hackathon MVP for Ayala Land property managers. The audience is judges evaluating urgency, financial impact, and scalability — not real end users doing daily operations. Every feature must be:

1. **Demoable** in a live 3-5 minute pitch
2. **Visually compelling** enough to land a "wow" reaction
3. **Parallelizable** across 2-3 developers

Features are assessed through this lens: table stakes = what judges expect to see in any energy dashboard; differentiators = what makes this demo memorable.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features that any credible energy monitoring or ESG dashboard must have. Missing these signals "amateur hour" to judges.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Total energy consumption metric (kWh) | Every energy dashboard starts here; baseline for all downstream calculations | LOW | Single number card with period selector (today/week/month). Pull from seeded data aggregate. |
| CO2e / carbon emissions metric | Mandatory ESG KPI; judges will look for this before anything else | LOW | Derived from kWh via standard emission factor (PH grid: ~0.5 kg CO2e/kWh). Show as kg or tCO2. |
| Energy status per unit (over/under threshold) | Property managers need to know which units are problematic | MEDIUM | Boolean per-unit flag: normal / warning / critical. Drives heatmap color coding. |
| Time-period filtering (today / this month) | Standard for all dashboards; without it data feels static | LOW | Toggle between time windows on seeded dataset. No live data required. |
| Threshold-based anomaly indicators | Energy dashboards universally alert on overages; absence makes dashboard feel inert | MEDIUM | Vampire load detection (always-on high baseline) and spike detection (sudden surge). Rule-based, not ML. |
| Summary KPI cards | Industry standard: 3-5 headline numbers at top of dashboard | LOW | Total kWh, total CO2e, units over threshold, % savings vs baseline. Cards are fast to build. |

### Differentiators (Competitive Advantage)

Features that move this from "energy dashboard" to "Ayala Net-Zero Command Center" — the pitch hook.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Unit-level grid heatmap (500+ units) | Makes the scale of the problem viscerally visible — judges see 500 squares, immediately understand the monitoring gap | MEDIUM | CSS grid or SVG, color-coded by status (green/yellow/red). Click-to-detail is nice but not required. 500 units in a grid is the visual centerpiece of the demo. |
| Green loan progress bar (SPT tracker) | Directly ties the dashboard to Ayala's ₱56B sustainability-linked loan covenant — financial risk made visible | LOW | Single progress bar: "38.2% / 40% energy savings target." Exact number doesn't matter for demo; the concept of loan-linked compliance is the hook. |
| Scope 3 framing of tenant emissions | 75% of a developer's carbon footprint is tenant Scope 3 — surfacing this is a genuine insight gap in the industry | LOW | Label the CO2e card explicitly as "Scope 3 Tenant Emissions." No additional tech required; it's framing that makes the story credible. |
| Anomaly severity classification | Distinguishing "vampire loads" (persistent inefficiency) from "dangerous spikes" (safety/equipment risk) is operationally meaningful | MEDIUM | Two anomaly types with different visual treatments. Vampire: orange badge. Spike: red badge. Seeded data must include both types intentionally. |
| SBTi target progress indicator | Shows alignment to Ayala's verified Net Zero 2050 / 2030 interim targets — anchors pitch to their public commitments | LOW | Small card or progress ring: "% toward SBTi annual carbon budget." Calculated from seeded data. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem like good ideas for a demo but will kill the 3-hour timeline or undermine the pitch.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Floor plan / digital twin layout | "More realistic" building visualization | Requires building-specific CAD/layout data; doesn't generalize; 2-3x build time vs grid | Grid heatmap scales to any building, builds in 1 hour, looks equally impressive at demo scale |
| Live ticking / real-time data (WebSocket) | Makes dashboard feel "live" | Adds WebSocket complexity, timing bugs, race conditions — high failure risk during demo | Pre-seeded static data with a "Last updated: X" timestamp is just as credible to judges |
| ML-based anomaly detection | "More sophisticated" | Requires training data, model selection, inference pipeline — 10x complexity for marginal demo value | Threshold rules (e.g., >2x median = anomaly) are explainable, fast to build, and judges actually prefer explainability |
| PDF / downloadable ESG reports | "Looks enterprise-ready" | Generates files, requires formatting library, adds 1-2 hours to build — zero visual impact in live demo | On-screen cards with clean typography deliver same signal in 30 minutes |
| Multi-building portfolio view | "Shows scalability" | Requires data schema changes, navigation complexity, more seeded data | State in the pitch: "This is building 1 of 300. The data model is flat and scales horizontally." Judges accept verbal scalability claims. |
| User authentication / login | "Looks production-ready" | Adds auth flow, session management — high dev cost for zero demo impact | Open dashboard for demo. Mention "RBAC in roadmap" verbally. |
| Tenant-facing notifications or actions | "Complete product" | Shifts from admin monitoring to a 2-sided platform — completely different product scope | Admin-only view. Defer tenant features to v2 roadmap slide. |
| Historical trend charts (12-month) | "Shows patterns over time" | Requires meaningful seeded data across 12 months, charting library, layout space | Show current-period summary cards only. Optionally add a 7-day sparkline per unit if time allows. |
| Predictive / AI forecasting | "Future-proofs the pitch" | No training data, no time, no value for a view-only demo | Rule-based anomaly detection + "AI roadmap" verbal claim is sufficient for demo context |

---

## Feature Dependencies

```
[KPI Summary Cards]
    └──requires──> [Seeded Data Generator]
                       └──requires──> [Unit energy schema (unit_id, kWh, timestamp)]

[Unit Heatmap Grid]
    └──requires──> [Seeded Data Generator]
    └──requires──> [Threshold Rules Engine]
                       └──requires──> [Unit energy schema]

[Anomaly Detection Badges]
    └──requires──> [Threshold Rules Engine]
    └──enhances──> [Unit Heatmap Grid] (colors driven by anomaly classification)

[Green Loan Progress Bar]
    └──requires──> [KPI Summary Cards] (total kWh savings calculated same way)
    └──requires──> [Baseline energy figure] (hardcoded for demo: "pre-efficiency baseline")

[SBTi Progress Indicator]
    └──requires──> [KPI Summary Cards] (CO2e total feeds SBTi budget calc)

[Scope 3 Framing]
    └──enhances──> [KPI Summary Cards] (label change only, zero tech dependency)
```

### Dependency Notes

- **Seeded Data Generator is the critical path**: Everything depends on it. It must be built first. One developer should own this exclusively in the first 30 minutes.
- **Threshold Rules Engine is the second dependency**: KPIs, heatmap colors, and anomaly badges all derive from the same threshold evaluation pass. Build it as a shared utility function called by all consumers.
- **Green Loan Progress Bar is near-zero cost**: Once total kWh is calculated for KPI cards, the progress bar is one additional calculation. Build it at the same time as KPI cards.
- **Heatmap and KPI cards can be built in parallel**: Once the data contract (API endpoint shape) is agreed, one developer builds the heatmap component while another builds the KPI cards.

---

## MVP Definition

### Launch With (v1 — the 3-hour hackathon build)

- [x] Seeded data generator — 500+ units with realistic energy loads including vampire loads and spikes — this is the foundation; skip everything else if this isn't solid
- [x] KPI summary cards — total kWh, total CO2e (Scope 3 framing), units over threshold, % below baseline — judges look here first
- [x] Unit-level grid heatmap — 500+ units color-coded green/yellow/red by energy status — the visual centerpiece, must be in v1
- [x] Threshold-based anomaly detection — two types: vampire load (persistent high baseline), spike (sudden surge) — operationally meaningful and explainable
- [x] Green loan progress bar — "X% of 40% SPT achieved" — the financial hook, ties dashboard to ₱56B loan risk
- [x] SBTi progress indicator — "X% of annual carbon budget used" — anchors pitch to Ayala's public targets

### Add After Validation (v1.x — if time remains in hackathon)

- [ ] Click-to-detail on heatmap unit — show unit-level breakdown (kWh, CO2e, anomaly type) — only add if heatmap is done early and time allows
- [ ] 7-day sparkline per unit or aggregate — minimal time-series context — add only if core features are all stable

### Future Consideration (v2+ — roadmap slide material)

- [ ] Real Modbus/MQTT sub-meter integration — defer; requires vendor access and IoT infrastructure
- [ ] Live data pipeline — defer; replace static seed with streaming only after infrastructure is proven
- [ ] Tenant-facing portal — defer; separate product with separate UX requirements
- [ ] PDF/Excel ESG report export — defer; useful operationally but zero demo value
- [ ] Multi-building portfolio aggregation — defer; data model supports it, but UI complexity is high
- [ ] ML anomaly detection — defer; threshold rules are sufficient until labeled anomaly data exists

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Seeded data generator | HIGH (foundation) | MEDIUM (30-45 min) | P1 — build first |
| KPI summary cards | HIGH | LOW (30 min) | P1 — build in parallel with heatmap |
| Unit grid heatmap | HIGH | MEDIUM (60-90 min) | P1 — visual centerpiece |
| Threshold rules engine | HIGH (enables heatmap + anomalies) | LOW (30 min) | P1 — build before heatmap |
| Green loan progress bar | HIGH (pitch hook) | LOW (15 min) | P1 — build with KPI cards |
| Anomaly type classification | MEDIUM | LOW (30 min, rule-based) | P1 — explainability differentiator |
| SBTi progress indicator | MEDIUM | LOW (15 min) | P1 — low cost, high narrative value |
| Click-to-detail on unit | LOW | MEDIUM (30-45 min) | P2 — only if time allows |
| Time-period filter | LOW | LOW (15 min) | P2 — nice but static data limits value |
| Sparkline / trend chart | LOW | MEDIUM (30 min) | P3 — defer |

---

## Competitor Feature Analysis

| Feature | EnergyCAP | Measurabl | IBM Envizi | Our Approach |
|---------|--------------|--------------|--------------|--------------|
| Heatmap visualization | Activity map (time-based) | Not found | Not primary feature | Unit-grid spatial heatmap — easier to build, more visually immediate for 500-unit building context |
| Scope 3 tenant emissions | Partial (utility data) | Yes — dedicated Scope 3 tenant view | Yes — full scope breakdown | Label existing CO2e metric as Scope 3 explicitly; framing delivers the value without complexity |
| Loan compliance monitoring | Not found | Not found | Not found | Green loan SPT progress bar — this is genuinely differentiated; no known competitor has this for residential condos |
| Anomaly detection | Rule-based alerts on billing anomalies | Data validation anomaly detection | Fault detection with root cause | Rule-based threshold detection (vampire vs spike classification); matches competitor sophistication without ML overhead |
| Carbon tracking | kWh → CO2e conversion | Full GHG accounting | Full scope 1/2/3 | kWh → CO2e via PH grid emission factor; sufficient for demo and operationally correct |
| Compliance reporting | LEED, ENERGY STAR | CDP, GRI, SBTi frameworks | CSRD, SEC, GRI | SBTi progress framing only; correct for Ayala's public commitments and scoped for 3-hour build |

---

## Sources

- [Prophix — Top 11 ESG Reporting Software Platforms 2026](https://www.prophix.com/blog/esg-software/) — MEDIUM confidence (WebSearch, credible industry source)
- [EnergyCAP — Smart Analytics Features](https://www.energycap.com/energy-monitoring-software/features/) — MEDIUM confidence (official product docs)
- [Measurabl — Scope 3 Tenant Emissions Feature](https://www.measurabl.com/understanding-measurabls-newest-feature-scope-3-tenant-emissions-trends/) — MEDIUM confidence (official product blog)
- [iNetSoft — Energy Management Dashboard KPIs](https://www.inetsoft.com/info/energy-management-dashboards-kpis-and-analytics) — MEDIUM confidence (industry reference, WebFetch verified)
- [Facilio — ESG Reporting Software Best Practices](https://facilio.com/blog/esg-reporting-software/) — MEDIUM confidence (WebFetch verified)
- [Rhino Energy — Scope 3 Tenant Energy Data](https://rhino.energy/blog/why-tenant-energy-data-is-essential-for-accurate-scope-3-reporting) — MEDIUM confidence (specialist source, aligns with Measurabl)
- [Slaughter and May — 2025 SLL Principles Updates](https://www.slaughterandmay.com/insights/new-insights/2025-updates-to-the-sustainability-linked-loan-principles/) — HIGH confidence (law firm official publication, primary source for SLL compliance requirements)
- [EnergyCAP — Heatmap Visualization Best Practices](https://betterbuildingssolutioncenter.energy.gov/sites/default/files/tools/Heat%20Map%20Instructions.pdf) — HIGH confidence (US DOE Better Buildings resource)
- [Medium — Designing ESG Dashboards for 2026](https://medium.com/@mokkup/designing-the-future-of-esg-dashboards-how-to-build-sustainability-reporting-tools-for-2026-6106d647c9ed) — LOW confidence (WebSearch only, single source)
- [Enersee — Energy Management Platform Best Practices 2025](https://www.enersee.ai/insights/energy-management-platforms) — MEDIUM confidence (multiple agreeing sources on complexity anti-pattern)

---

*Feature research for: Ayala Land Net-Zero Command Center (energy monitoring / ESG compliance dashboard)*
*Researched: 2026-02-20*

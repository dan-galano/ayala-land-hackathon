# Requirements: Ayala Land Net-Zero Command Center

**Defined:** 2026-02-20
**Core Value:** Property managers can instantly see which units are exceeding their carbon budget and threatening compliance with Ayala's ₱56B sustainability-linked loans

## v1 Requirements

Requirements for hackathon MVP (3-hour build). Each maps to roadmap phases.

### Data Foundation

- [x] **DATA-01**: System generates seeded energy data for 500+ condo units with realistic Philippine consumption patterns (studio: 80–150 kWh/mo, 1BR: 120–250, 2BR: 200–400)
- [x] **DATA-02**: System includes 3–5% of units as intentional vampire load outliers and 1–2% as dangerous spike anomalies in seeded data
- [x] **DATA-03**: System uses a shared constants file with PH grid emission factor (0.672 kg CO₂e/kWh), baseline kWh per unit type, and SPT target thresholds
- [x] **DATA-04**: System provides a threshold rules engine as a shared utility that classifies units as normal/elevated/warning/critical/vampire

### Dashboard Visualization

- [x] **VIZ-01**: Property manager can view KPI summary cards showing total kWh consumed, total CO₂ saved vs baseline, number of units over threshold, and % energy savings vs baseline
- [ ] **VIZ-02**: Property manager can view a grid heatmap of 500+ units color-coded green/yellow/orange/red by energy status
- [ ] **VIZ-03**: Property manager can click a heatmap cell to see unit-level detail (unit ID, floor, kWh consumed, CO₂e, anomaly type if any)

### ESG Compliance

- [x] **ESG-01**: Property manager can view a CO₂ emissions card explicitly labeled "Scope 3 Tenant Emissions" showing total tenant CO₂e for the building
- [x] **ESG-02**: Property manager can view an SBTi progress indicator showing % of annual carbon budget consumed against Ayala's verified 42% reduction target

### Financial Monitoring

- [x] **FIN-01**: Property manager can view a green loan SPT progress bar showing building's current energy savings % against the 40% target required by sustainability-linked loan covenants

### Anomaly Detection

- [ ] **ANOM-01**: System flags units exceeding energy thresholds with visual indicators on the heatmap grid
- [ ] **ANOM-02**: System classifies anomalies into two types: vampire loads (persistent high baseline when unoccupied — orange) and dangerous spikes (sudden surge indicating faulty appliance — red)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Visualization

- **VIZ-04**: Property manager can filter dashboard by time period (today/week/month)
- **VIZ-05**: Property manager can view 7-day sparkline trends per unit or aggregate

### Reporting

- **RPT-01**: Property manager can download ESG compliance report as PDF
- **RPT-02**: Property manager can export unit energy data as CSV/Excel

### Platform

- **PLAT-01**: Real Modbus/MQTT sub-meter integration replacing seeded data
- **PLAT-02**: Live streaming data pipeline with WebSocket updates
- **PLAT-03**: Multi-building portfolio aggregation view
- **PLAT-04**: Tenant-facing energy portal with consumption insights
- **PLAT-05**: User authentication with role-based access control

### Advanced Analytics

- **ANLYT-01**: ML-based anomaly detection with pattern learning
- **ANLYT-02**: Predictive energy forecasting per unit

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Floor plan / digital twin layout | Requires building-specific CAD data; grid scales to any building and builds 3x faster |
| Mobile responsive design | Desktop-first for demo; property managers use desktop in operations center |
| Real-time WebSocket data | Adds timing bugs and race conditions; static seeded data is reliable for demo |
| User authentication | Zero demo impact; open dashboard for pitch, mention RBAC verbally |
| Tenant notifications/actions | Admin-only view; tenant features are a separate product scope |
| Historical trend charts (12-month) | Requires meaningful seeded data across 12 months; sparklines deferred to v2 |
| Multi-building portfolio | Data model supports it but UI complexity is high; state scalability verbally |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| DATA-01 | Phase 1 | Complete (01-01) |
| DATA-02 | Phase 1 | Complete (01-01) |
| DATA-03 | Phase 1 | Complete (01-01) |
| DATA-04 | Phase 1 | Complete (01-01) |
| VIZ-01 | Phase 3 | Complete |
| VIZ-02 | Phase 2 | Pending |
| VIZ-03 | Phase 2 | Pending |
| ESG-01 | Phase 3 | Complete |
| ESG-02 | Phase 3 | Complete |
| FIN-01 | Phase 3 | Complete |
| ANOM-01 | Phase 2 | Pending |
| ANOM-02 | Phase 2 | Pending |

**Coverage:**
- v1 requirements: 12 total
- Mapped to phases: 12
- Unmapped: 0

---
*Requirements defined: 2026-02-20*
*Last updated: 2026-02-20 after roadmap creation*

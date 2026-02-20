# Ayala Land Net-Zero Command Center

## What This Is

A pro-active admin energy intelligence dashboard for Ayala Land property managers to monitor, audit, and optimize energy consumption across hundreds of individual condo units. Built as a hackathon MVP (3-hour sprint, 2-3 devs) demonstrating real-time Scope 3 emissions visibility using simulated sub-meter data from 500+ units.

## Core Value

Property managers can instantly see which units are exceeding their carbon budget and threatening compliance with Ayala's ₱56B sustainability-linked loans — turning an invisible Scope 3 data gap into actionable intelligence.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Unit-level grid heatmap showing 500+ units color-coded by energy status
- [ ] ESG compliance dashboard cards (total kWh, CO₂ saved, % toward SBTi target)
- [ ] Threshold-based anomaly detection (vampire loads, dangerous power spikes)
- [ ] Green loan progress bar (building % toward 40% energy savings SPT)
- [ ] Pre-seeded data generator simulating realistic energy loads for 500+ units
- [ ] View-only dashboard (no tenant actions, no notifications)

### Out of Scope

- Real IoT/Modbus/MQTT integration — simulated data only for hackathon
- PDF/downloadable ESG reports — on-screen cards only
- Tenant-facing features — admin-only dashboard
- Real-time live ticking data — static seeded dataset
- Floor plan / digital twin layout — grid view only
- User authentication — open dashboard for demo purposes
- Mobile responsive design — desktop-first for demo
- Multiple buildings — single building view for MVP

## Context

- **The Problem:** Ayala Land has zero real-time visibility into individual unit energy consumption (Scope 3). 75% of a developer's carbon footprint comes from tenant usage.
- **Financial Risk:** ₱56B in sustainability-linked loans require proof of 40% energy savings. Manual monthly readings can't deliver this.
- **Data Strategy:** Bypass lack of public Meralco API by targeting building-owned digital sub-meters (Modbus/MQTT enabled) already installed in Ayala condos (Avida, Alveo, Premier).
- **Hackathon Context:** 3-hour build window. Judges care about urgency, financial impact, and scalability. Demo must be visually compelling.
- **Pitch Hooks:** Ayala Land #1 PH developer (TIME 2026). SBTi-verified Net Zero 2050 target. Multiple DOE Energy Efficiency Awards 2025/2026.

## Constraints

- **Timeline**: 3-hour hackathon sprint — every feature must be demoable, no half-built features
- **Team**: 2-3 developers — features must be parallelizable across team members
- **Tech Stack**: Next.js (frontend) + Express (API server) — decided
- **Data**: Pre-seeded static dataset for 500+ units — no live data pipeline
- **Scope**: View-only admin dashboard — no write operations, no auth

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Grid heatmap over floor plan | Floor plan requires building-specific layouts; grid scales to any building and is faster to build | — Pending |
| Threshold rules over ML anomaly detection | 3-hour window; rules are demoable and explainable to judges | — Pending |
| Static seeded data over live ticking | Eliminates WebSocket complexity; reliable demo without timing issues | — Pending |
| Next.js + Express over full-stack Next.js | Team familiar with Express; cleaner separation for parallel dev | — Pending |
| Dashboard cards over PDF reports | Faster to build; more visually impactful for live demo | — Pending |

---
*Last updated: 2026-02-20 after initialization*

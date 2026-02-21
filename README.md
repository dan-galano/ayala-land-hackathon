# Ayala Land — Net-Zero Command Center

Real-time energy monitoring dashboard for property managers to track building energy performance, Scope 3 carbon exposure, and green loan covenant status from a single screen.

## Architecture

```
client/          Next.js 16 + Tailwind v4 frontend (port 3000)
server/          Express API with deterministic seed data (port 3001)
.planning/       GSD planning artifacts (roadmap, phases, research)
```

## Features

- **Heatmap Grid** — 500-unit building visualization (25 floors x 20 units) with color-coded energy status
- **KPI Summary Cards** — Total kWh consumed, Scope 3 Tenant Emissions (CO2e), units over threshold, energy savings vs baseline
- **SBTi Carbon Budget Indicator** — Progress toward Ayala's 42% reduction target with on-track/at-risk status
- **Green Loan SPT Covenant Bar** — Energy savings progress against 40% SPT target with gap-to-covenant display
- **Anomaly Panel** — Vampire load and spike detection alerts
- **Unit Detail Panel** — Click any unit cell for detailed energy breakdown

## Quick Start

### Prerequisites

- Node.js 20+
- npm

### Install & Run

```bash
# Install dependencies
cd server && npm install
cd ../client && npm install

# Start both servers (in separate terminals)
cd server && npm run dev    # Express API on :3001
cd client && npm run dev    # Next.js on :3000
```

Open http://localhost:3000 to view the dashboard.

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS v4, TypeScript
- **Backend:** Express, TypeScript, tsx
- **Data:** Deterministic seed via faker.js (seed 42) — 500 units with realistic energy profiles

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /api/units` | All 500 unit records with energy data |
| `GET /api/summary` | Building-level KPI aggregates |
| `GET /api/anomalies` | Units with vampire load or spike anomalies |

## License

Private — Ayala Land Hackathon 2025

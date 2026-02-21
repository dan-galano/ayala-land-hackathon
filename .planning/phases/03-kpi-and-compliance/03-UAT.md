---
status: testing
phase: 03-kpi-and-compliance
source: [03-01-SUMMARY.md, 03-02-SUMMARY.md]
started: 2026-02-20T09:10:00Z
updated: 2026-02-20T09:10:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 1
name: Four KPI Summary Cards
expected: |
  Open http://localhost:3000 with both servers running (server on 3001, client on 3000). You should see four dark metric cards in a grid: "Total Consumption" showing kWh, "Scope 3 Tenant Emissions" showing CO2e, "Units Over Threshold" showing a count, and "Energy Savings vs Baseline" showing a percentage.
awaiting: user response

## Tests

### 1. Four KPI Summary Cards
expected: Open http://localhost:3000 with both servers running (server on 3001, client on 3000). You should see four dark metric cards in a grid: "Total Consumption" showing kWh, "Scope 3 Tenant Emissions" showing CO2e, "Units Over Threshold" showing a count, and "Energy Savings vs Baseline" showing a percentage.
result: [pending]

### 2. SBTi Carbon Budget Indicator
expected: Below or alongside the KPI cards, an SBTi progress indicator shows a progress bar filled to ~90.7%. It should display "ON TRACK" in green text, with a label referencing the 42% Ayala SBTi reduction target.
result: [pending]

### 3. Green Loan SPT Covenant Bar
expected: A green loan SPT progress bar shows the covenant status. Since savings (38.1%) are below the 40% target, it should display "AT RISK" in red text, with a label showing the gap to target (approximately 1.9%).
result: [pending]

### 4. Data Coherence
expected: All numbers on screen are consistent — the savings percentage shown in the KPI card matches what the SPT bar references. The CO2e value and kWh value both appear reasonable and don't contradict each other. No "NaN", "undefined", or blank values anywhere.
result: [pending]

### 5. Loading and Error States
expected: On initial page load there is a brief "Loading KPI data..." message before the data appears. If you stop the Express server (port 3001) and refresh, you should see a red-bordered error message instead of the KPI cards.
result: [pending]

## Summary

total: 5
passed: 0
issues: 0
pending: 5
skipped: 0

## Gaps

[none yet]

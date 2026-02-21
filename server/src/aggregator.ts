/**
 * Building-level ESG aggregator for Ayala Land.
 * All math is computed once at module load from pre-seeded unit data.
 * Route handlers serve from memory — no computation at request time.
 */

import {
  GRID_EMISSION_FACTOR,
  SPT_TARGET,
  SBTI_REDUCTION_TARGET,
} from './constants.js';
import type { Unit, Summary, UnitStatus } from './types.js';
import { ALL_UNITS } from './seed.js';

/**
 * Compute building-level ESG summary from a set of units.
 *
 * CRITICAL: savingsPercent is derived from raw totals, NOT from summing
 * unit.savingsPercent values — summing per-unit percentages causes floating
 * point drift that would make sptProgress and sbtiProgress inaccurate.
 */
function buildSummary(units: Unit[]): Summary {
  const totalKwh = parseFloat(
    units.reduce((sum, u) => sum + u.currentKwh, 0).toFixed(1)
  );
  const totalBaselineKwh = parseFloat(
    units.reduce((sum, u) => sum + u.baselineKwh, 0).toFixed(1)
  );

  // Carbon: computed from total kWh, not summed from per-unit co2e
  const totalCo2e = parseFloat((totalKwh * GRID_EMISSION_FACTOR).toFixed(2));

  // Savings: always from raw totals to avoid floating point drift
  const savingsPercent = parseFloat(
    (((totalBaselineKwh - totalKwh) / totalBaselineKwh) * 100).toFixed(1)
  );

  // Progress toward targets (% of target achieved)
  const sptProgress = parseFloat((savingsPercent / SPT_TARGET * 100).toFixed(1));
  const sbtiProgress = parseFloat((savingsPercent / SBTI_REDUCTION_TARGET * 100).toFixed(1));

  const unitCount = units.length;
  const anomalyCount = units.filter((u) => u.anomalyType !== null).length;
  const unitsOverThreshold = units.filter((u) =>
    ['warning', 'critical', 'vampire'].includes(u.status)
  ).length;

  // Count units per status — explicit keys ensure all five bands are present
  const statuses: UnitStatus[] = ['normal', 'elevated', 'warning', 'critical', 'vampire'];
  const statusBreakdown = statuses.reduce((acc, status) => {
    acc[status] = units.filter((u) => u.status === status).length;
    return acc;
  }, {} as Record<UnitStatus, number>);

  return {
    totalKwh,
    totalCo2e,
    totalBaselineKwh,
    savingsPercent,
    sptProgress,
    sbtiProgress,
    unitCount,
    anomalyCount,
    unitsOverThreshold,
    statusBreakdown,
  };
}

/** Pre-computed building summary — served from memory by all API route handlers */
export const SUMMARY: Summary = buildSummary(ALL_UNITS);

/**
 * Pure threshold classifier for residential unit energy status.
 * No state, no imports of mutable data, no side effects.
 * Single responsibility: map (currentKwh, baselineKwh, flags) → UnitStatus.
 */

import type { UnitStatus } from './types.js';

/**
 * Classify a unit's energy consumption status based on threshold ratios.
 *
 * Threshold bands (ratio = currentKwh / baselineKwh):
 * - vampire: isVampireFlagged && !isOccupied && ratio > 0.6
 * - critical: ratio > 1.2
 * - warning:  ratio > 1.0
 * - elevated: ratio > 0.8
 * - normal:   ratio <= 0.8
 */
export function classifyUnit(
  currentKwh: number,
  baselineKwh: number,
  isOccupied: boolean,
  isVampireFlagged: boolean
): UnitStatus {
  const ratio = currentKwh / baselineKwh;
  if (isVampireFlagged && !isOccupied && ratio > 0.6) return 'vampire';
  if (ratio > 1.2) return 'critical';
  if (ratio > 1.0) return 'warning';
  if (ratio > 0.8) return 'elevated';
  return 'normal';
}

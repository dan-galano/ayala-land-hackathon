/**
 * Shared ESG constants for Ayala Net-Zero Command Center.
 * All energy, carbon, and target values trace back to this file.
 * Sources: IEA 2024 Philippine grid factor, Ayala SBTi commitment, SPT loan covenant.
 */

/** IEA 2024 Philippine grid emission factor (kg CO2e per kWh) */
export const GRID_EMISSION_FACTOR = 0.672;

/** Green loan covenant: % energy savings required vs 2019 baseline */
export const SPT_TARGET = 40;

/** Ayala's verified Science Based Targets initiative: % CO2 reduction by 2030 */
export const SBTI_REDUCTION_TARGET = 42;

/** Pre-efficiency 2019 monthly baseline consumption per unit type (kWh) */
export const BASELINE_KWH = {
  studio: 180,
  '1BR': 300,
  '2BR': 500,
} as const;

/** Philippine monthly residential consumption ranges per unit type (kWh) */
export const CONSUMPTION_RANGES = {
  studio: { min: 80, max: 150 },
  '1BR': { min: 120, max: 250 },
  '2BR': { min: 200, max: 400 },
} as const;

/**
 * Classifier threshold ratios (currentKwh / baselineKwh).
 * normal:   ratio <= 0.8
 * elevated: 0.8 < ratio <= 1.0
 * warning:  1.0 < ratio <= 1.2
 * critical: ratio > 1.2
 * vampire:  isVampireFlagged && !isOccupied && ratio > 0.6
 */
export const THRESHOLD_RATIOS = {
  normal_max: 0.8,
  elevated_max: 1.0,
  warning_max: 1.2,
  vampire_min_ratio: 0.6,
} as const;

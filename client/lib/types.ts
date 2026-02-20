/**
 * TypeScript interfaces for Ayala Net-Zero Command Center data layer.
 * These types define the API response contract for all frontend consumers.
 */

/** Residential unit size classification */
export type UnitType = 'studio' | '1BR' | '2BR'

/** Energy consumption status relative to 2019 baseline */
export type UnitStatus = 'normal' | 'elevated' | 'warning' | 'critical' | 'vampire'

/** Type of energy anomaly, null if unit is operating normally */
export type AnomalyType = 'vampire' | 'spike' | null

/**
 * Represents a single residential unit in Avida Towers Vita.
 * Matches the shape of GET /api/units array items.
 */
export interface Unit {
  /** 4-character padded ID: floor(2) + position(2), e.g. "0203" = Floor 2, Position 03 */
  id: string
  /** Human-readable label, e.g. "Unit 0203" */
  unitNumber: string
  /** Floor number (2–26) */
  floor: number
  /** Position on floor (1–20) */
  position: number
  /** Unit size category */
  type: UnitType
  /** Current monthly consumption (kWh) */
  currentKwh: number
  /** 2019 pre-efficiency baseline consumption (kWh) */
  baselineKwh: number
  /** Carbon emissions: currentKwh * GRID_EMISSION_FACTOR (kg CO2e) */
  co2e: number
  /** Energy savings vs baseline: (baseline - current) / baseline * 100 (%) */
  savingsPercent: number
  /** Threshold classification */
  status: UnitStatus
  /** Anomaly flag for demo narrative, null if normal */
  anomalyType: AnomalyType
  /** Whether a resident is currently occupying the unit */
  isOccupied: boolean
}

/**
 * Building-level aggregate summary.
 * Matches the shape of GET /api/summary response.
 */
export interface Summary {
  /** Sum of all unit currentKwh (kWh) */
  totalKwh: number
  /** totalKwh * GRID_EMISSION_FACTOR (kg CO2e) */
  totalCo2e: number
  /** Sum of all unit baselineKwh (kWh) */
  totalBaselineKwh: number
  /** (totalBaselineKwh - totalKwh) / totalBaselineKwh * 100 (%) */
  savingsPercent: number
  /** savingsPercent / SPT_TARGET * 100 — progress toward loan covenant (%) */
  sptProgress: number
  /** savingsPercent / SBTI_REDUCTION_TARGET * 100 — progress toward SBTi goal (%) */
  sbtiProgress: number
  /** Total number of units (always 500) */
  unitCount: number
  /** Number of units with anomalyType !== null */
  anomalyCount: number
  /** Number of units with status in ['warning', 'critical', 'vampire'] */
  unitsOverThreshold: number
  /** Count of units per status category */
  statusBreakdown: Record<UnitStatus, number>
}

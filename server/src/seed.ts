import { faker } from '@faker-js/faker';

// CRITICAL: Set seed BEFORE any other code runs to ensure deterministic output.
// faker.seed(42) must be called at module level, not inside a function.
faker.seed(42);

import {
  BASELINE_KWH,
  CONSUMPTION_RANGES,
  GRID_EMISSION_FACTOR,
} from './constants.js';
import type { Unit, UnitType, AnomalyType } from './types.js';
import { classifyUnit } from './classifier.js';

/**
 * Generate all 500 residential units for Ayala Land.
 * Floors 2–26 (25 floors), 20 positions per floor = 500 units exactly.
 *
 * Hero unit overrides are applied AFTER the loop as a map pass so they
 * do not shift RNG position for any other unit.
 */
function generateUnits(): Unit[] {
  const units: Unit[] = [];

  for (let floor = 2; floor <= 26; floor++) {
    for (let pos = 1; pos <= 20; pos++) {
      const id = `${String(floor).padStart(2, '0')}${String(pos).padStart(2, '0')}`;
      const unitNumber = `Unit ${id}`;

      const type: UnitType = faker.helpers.weightedArrayElement([
        { weight: 40, value: 'studio' as UnitType },
        { weight: 40, value: '1BR' as UnitType },
        { weight: 20, value: '2BR' as UnitType },
      ]);

      const baselineKwh = BASELINE_KWH[type];

      const currentKwh = faker.number.float({
        min: CONSUMPTION_RANGES[type].min,
        max: CONSUMPTION_RANGES[type].max,
        fractionDigits: 1,
      });

      // Anomaly flagging via a single RNG roll — keeps the roll deterministic
      // regardless of which branch fires.
      const roll = faker.number.float({ min: 0, max: 1, fractionDigits: 4 });

      let isVampireFlagged = false;
      let isSpiked = false;
      let anomalyType: AnomalyType = null;
      let isOccupied = true;

      if (roll < 0.04) {
        // ~4% vampire loads: persistent high baseline in unoccupied unit
        isVampireFlagged = true;
        isOccupied = false;
        anomalyType = 'vampire';
      } else if (roll > 0.985) {
        // ~1.5% dangerous spikes: sudden surge
        isSpiked = true;
        anomalyType = 'spike';
      }

      // isSpiked is captured in anomalyType; keep variable to satisfy linter
      void isSpiked;

      const status = classifyUnit(currentKwh, baselineKwh, isOccupied, isVampireFlagged);
      const co2e = parseFloat((currentKwh * GRID_EMISSION_FACTOR).toFixed(3));
      const savingsPercent = parseFloat(
        (((baselineKwh - currentKwh) / baselineKwh) * 100).toFixed(1)
      );

      units.push({
        id,
        unitNumber,
        floor,
        position: pos,
        type,
        currentKwh,
        baselineKwh,
        co2e,
        savingsPercent,
        status,
        anomalyType,
        isOccupied,
      });
    }
  }

  // ─── Hero unit overrides ─────────────────────────────────────────────────────
  // Applied as a post-loop map pass so RNG positions are never shifted.
  // All derived fields (co2e, savingsPercent, status) recomputed from overridden values.

  return units.map((unit): Unit => {
    switch (unit.id) {
      case '1203': {
        // Floor 12, Pos 03 — CRITICAL: 2BR spike drawing 3x normal. "Fire hazard" story.
        const currentKwh = BASELINE_KWH['2BR'] * 3; // 1500 kWh
        return {
          ...unit,
          type: '2BR',
          currentKwh,
          baselineKwh: BASELINE_KWH['2BR'],
          co2e: parseFloat((currentKwh * GRID_EMISSION_FACTOR).toFixed(3)),
          savingsPercent: parseFloat(
            (((BASELINE_KWH['2BR'] - currentKwh) / BASELINE_KWH['2BR']) * 100).toFixed(1)
          ),
          anomalyType: 'spike',
          status: 'critical',
          isOccupied: true,
        };
      }

      case '0815': {
        // Floor 8, Pos 15 — VAMPIRE: 1BR consuming 24/7 high baseline. "Nobody's home" story.
        const currentKwh = BASELINE_KWH['1BR'] * 0.85; // 255 kWh
        return {
          ...unit,
          type: '1BR',
          currentKwh,
          baselineKwh: BASELINE_KWH['1BR'],
          co2e: parseFloat((currentKwh * GRID_EMISSION_FACTOR).toFixed(3)),
          savingsPercent: parseFloat(
            (((BASELINE_KWH['1BR'] - currentKwh) / BASELINE_KWH['1BR']) * 100).toFixed(1)
          ),
          anomalyType: 'vampire',
          status: 'vampire',
          isOccupied: false,
        };
      }

      case '2510': {
        // Floor 25, Pos 10 — BEST: penthouse 2BR, lowest consumption. "Green champion" story.
        const currentKwh = BASELINE_KWH['2BR'] * 0.35; // 175 kWh
        return {
          ...unit,
          type: '2BR',
          currentKwh,
          baselineKwh: BASELINE_KWH['2BR'],
          co2e: parseFloat((currentKwh * GRID_EMISSION_FACTOR).toFixed(3)),
          savingsPercent: parseFloat(
            (((BASELINE_KWH['2BR'] - currentKwh) / BASELINE_KWH['2BR']) * 100).toFixed(1)
          ),
          anomalyType: null,
          status: 'normal',
          isOccupied: true,
        };
      }

      default:
        return unit;
    }
  });
}

/** All 500 residential units — deterministic via faker.seed(42) */
export const ALL_UNITS: Unit[] = generateUnits();

/** Units with active anomalies (vampire or spike) for /api/anomalies */
export const ANOMALIES: Unit[] = ALL_UNITS.filter((u) => u.anomalyType !== null);

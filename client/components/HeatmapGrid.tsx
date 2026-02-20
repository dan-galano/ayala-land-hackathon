'use client'

import { memo, useMemo, useState } from 'react'
import type { Unit } from '@/lib/types'
import { UnitCell } from './UnitCell'
// UnitDetailPanel will be implemented in plan 03 — placeholder import
import { UnitDetailPanel } from './UnitDetailPanel'

interface Props {
  units: Unit[]
}

/** Floor numbers from top (26) to bottom (2) — 25 rows total */
const FLOORS = Array.from({ length: 25 }, (_, i) => 26 - i)

interface GridRow {
  floor: number
  units: Unit[]
}

export const HeatmapGrid = memo(function HeatmapGrid({ units }: Props) {
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)

  /**
   * Group units by floor, sort floors descending (26 → 2),
   * sort each row's units by position ascending (1 → 20).
   */
  const grid: GridRow[] = useMemo(() => {
    const byFloor = new Map<number, Unit[]>()

    for (const unit of units) {
      const existing = byFloor.get(unit.floor)
      if (existing) {
        existing.push(unit)
      } else {
        byFloor.set(unit.floor, [unit])
      }
    }

    return FLOORS.map((floor) => ({
      floor,
      units: (byFloor.get(floor) ?? []).sort((a, b) => a.position - b.position),
    }))
  }, [units])

  return (
    <div className="flex flex-col gap-4">
      {/* Grid area: floor labels on the left, cell grid on the right */}
      <div className="flex gap-4">
        {/* Left axis: floor labels F26 (top) → F2 (bottom) */}
        <div className="flex flex-col gap-[2px]">
          {FLOORS.map((floor) => (
            <div
              key={floor}
              className="h-7 w-8 text-xs text-slate-400 text-right pr-1 flex items-center justify-end"
            >
              F{floor}
            </div>
          ))}
        </div>

        {/* 25-row × 20-column CSS Grid */}
        <div
          className="grid gap-[2px]"
          style={{
            gridTemplateColumns: 'repeat(20, minmax(28px, 1fr))',
            gridTemplateRows: 'repeat(25, 28px)',
          }}
        >
          {grid.flatMap((row) =>
            row.units.map((unit) => (
              <UnitCell
                key={unit.id}
                unit={unit}
                isSelected={selectedUnit?.id === unit.id}
                onClick={() => setSelectedUnit(unit)}
              />
            ))
          )}
        </div>
      </div>

      <UnitDetailPanel unit={selectedUnit} onClose={() => setSelectedUnit(null)} />
    </div>
  )
})

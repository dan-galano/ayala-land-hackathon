'use client'

import { memo } from 'react'
import type { Unit } from '@/lib/types'

interface Props {
  unit: Unit
  isSelected: boolean
  onClick: () => void
}

/**
 * Status color classes keyed by UnitStatus value.
 * Fallback (gray-600) handles unoccupied/edge-case units with no matching status.
 */
const STATUS_CLASSES: Record<string, string> = {
  normal: 'bg-green-500',
  elevated: 'bg-yellow-400',
  warning: 'bg-orange-500',
  critical: 'bg-red-600',
  vampire: 'bg-orange-400 border-2 border-dashed border-orange-200',
}

const FALLBACK_CLASS = 'bg-gray-600'

export const UnitCell = memo(function UnitCell({ unit, isSelected, onClick }: Props) {
  const statusClass = STATUS_CLASSES[unit.status] ?? FALLBACK_CLASS

  const isSpike = unit.anomalyType === 'spike'
  const isVampire = unit.anomalyType === 'vampire'

  return (
    <div
      role="button"
      tabIndex={0}
      title={`${unit.unitNumber} — ${unit.status}`}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}
      className={[
        'relative cursor-pointer h-full w-full',
        statusClass,
        isSpike ? 'animate-spike-glow' : '',
        isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-900' : '',
        'hover:brightness-125 transition-[filter] duration-100',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {isSpike && (
        <span className="absolute top-0 right-0 text-[8px] leading-none pointer-events-none">
          ⚡
        </span>
      )}
      {isVampire && (
        <span className="absolute top-0 right-0 text-[8px] leading-none pointer-events-none">
          🔌
        </span>
      )}
    </div>
  )
})

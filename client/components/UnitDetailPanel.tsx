import type { Unit } from '@/lib/types'

interface Props {
  unit: Unit | null
  onClose: () => void
}

function Row({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400">{label}</span>
      <span className={highlight ? 'font-semibold text-orange-400' : ''}>{value}</span>
    </div>
  )
}

export function UnitDetailPanel({ unit, onClose }: Props) {
  const isOpen = unit !== null

  return (
    <div
      className={[
        'fixed top-0 right-0 h-full w-72 z-50',
        'bg-slate-800 text-white',
        'transition-transform duration-300 ease-in-out',
        'flex flex-col',
        isOpen ? 'translate-x-0' : 'translate-x-full',
      ].join(' ')}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <span className="font-bold text-lg">{unit?.unitNumber ?? ''}</span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white text-xl leading-none"
          aria-label="Close panel"
        >
          ×
        </button>
      </div>

      {/* Content */}
      {unit && (
        <div className="flex flex-col gap-3 p-4 text-sm overflow-y-auto">
          <Row label="Unit" value={unit.unitNumber} />
          <Row label="Floor" value={`F${unit.floor}`} />
          <Row label="Type" value={unit.type} />
          <Row label="Current kWh" value={`${unit.currentKwh.toFixed(1)} kWh`} />
          <Row label="Baseline kWh" value={`${unit.baselineKwh.toFixed(1)} kWh`} />
          <Row label="CO₂e" value={`${unit.co2e.toFixed(2)} kg`} />
          <Row label="Savings %" value={`${unit.savingsPercent.toFixed(1)}%`} />
          <Row label="Status" value={unit.status} highlight />
          {unit.anomalyType && (
            <Row label="Anomaly" value={unit.anomalyType} highlight />
          )}
        </div>
      )}
    </div>
  )
}

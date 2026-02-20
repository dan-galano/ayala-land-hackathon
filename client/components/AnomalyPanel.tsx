import type { Unit } from '@/lib/types'

interface Props {
  anomalies: Unit[]
}

const BADGE_STYLES: Record<string, string> = {
  spike: 'bg-red-600 text-white',
  vampire: 'bg-orange-500 text-white',
}

const BADGE_LABELS: Record<string, string> = {
  spike: 'SPIKE',
  vampire: 'VAMPIRE',
}

function AnomalyRow({ unit }: { unit: Unit }) {
  const badgeStyle = unit.anomalyType ? BADGE_STYLES[unit.anomalyType] : 'bg-slate-600 text-slate-300'
  const badgeLabel = unit.anomalyType ? BADGE_LABELS[unit.anomalyType] : 'UNKNOWN'

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
      <div>
        <p className="text-sm font-medium text-white">{unit.unitNumber}</p>
        <p className="text-xs text-slate-400">F{unit.floor} · {unit.currentKwh.toFixed(0)} kWh</p>
      </div>
      <span className={`text-xs font-bold px-2 py-0.5 rounded ${badgeStyle}`}>
        {badgeLabel}
      </span>
    </div>
  )
}

export function AnomalyPanel({ anomalies }: Props) {
  // Sort: spike first (highest severity), then vampire; within each group sort by kWh descending
  const sorted = [...anomalies].sort((a, b) => {
    if (a.anomalyType === 'spike' && b.anomalyType !== 'spike') return -1
    if (b.anomalyType === 'spike' && a.anomalyType !== 'spike') return 1
    return b.currentKwh - a.currentKwh
  })

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-4 h-fit">
      <h2 className="text-sm font-semibold text-white mb-1">Anomaly Report</h2>
      <p className="text-xs text-slate-400 mb-3">{anomalies.length} units flagged</p>
      <div className="overflow-y-auto max-h-[500px]">
        {sorted.map((unit) => (
          <AnomalyRow key={unit.id} unit={unit} />
        ))}
      </div>
    </div>
  )
}

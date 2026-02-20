interface SptProgressBarProps {
  progress: number       // sptProgress — % of 40% SPT target achieved (e.g., 95.3)
  savingsPercent: number // raw savings % (e.g., 38.1)
}

export function SptProgressBar({ progress, savingsPercent }: SptProgressBarProps) {
  const isAtRisk = savingsPercent < 40
  const barPct = Math.min(Math.max(progress, 0), 100)

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-4">
      <p className="text-sm font-semibold text-white">Green Loan SPT Covenant</p>
      <p className="text-xs text-slate-400 mt-1">
        Target: 40% energy savings vs 2019 baseline
      </p>
      <div className="mt-4 flex justify-between text-sm">
        <span className="text-slate-300">{savingsPercent.toFixed(1)}% current savings</span>
        <span className={isAtRisk ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>
          {isAtRisk ? 'AT RISK' : 'ON TRACK'}
        </span>
      </div>
      <div className="mt-2 h-2 w-full rounded-full bg-slate-700">
        <div
          className={`h-2 rounded-full transition-all ${isAtRisk ? 'bg-red-500' : 'bg-emerald-500'}`}
          style={{ width: `${barPct}%` }}
        />
      </div>
      <p className="text-xs text-slate-500 mt-1">
        {isAtRisk
          ? `${(40 - savingsPercent).toFixed(1)}% gap to 40% SPT covenant`
          : 'Covenant target met'}
      </p>
    </div>
  )
}
